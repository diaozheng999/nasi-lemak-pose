/**
 * Themeable.tsx
 * @author Diao Zheng
 * @file Themeable version of View, Text, ScrollView, Image
 */

import _ from "lodash";
import {
  Action,
  Component,
  Hashing,
  Integer,
  Intent,
  Option,
  ReactTypes,
  Theme,
} from "nasi-lemak";
import React from "react";
import { Pose } from "./Pose";
import { PoseConfiguration } from "./PoseConfiguration";
import { Posed } from "./Posed";
import { inJestEnvironment } from "./RuntimeUtilities";

interface IState {
  handlerId?: number;
  updateFlag: boolean;
}

type PropType<T> = ReactTypes.PropType<T>;

type Action = Action.Only<"RERENDER">;

/**
 * Defines a themeable configuration function.
 * @template TPose a enum of poses
 * @template TStyle an object describing all styles being rendered
 * @template TElement one of `Image`, `ScrollView`, `Text` or `View`: the view
 * element being wrapped.
 * @template TAdditionalProps Additional properties to be passed over to
 * dynamic props when using `react-native-pose`
 */
export type ThemeableConfig<
  TPose extends string,
  TStyle,
  TElement,
  TAdditionalProps = {},
> = (
  props: Readonly<PropType<Posed<TElement, TPose, TAdditionalProps>>>,
  theme: Theme.Type,
) => PoseConfiguration<TPose, TStyle, TAdditionalProps>;

/**
 * Extracts only a portion of the returned function. We always execute the
 * function and never memoize the function, therefore, side-effect is always
 * executed.
 * @param fn A function (preferably pure).
 * @param pickSpec A array of keys to pick from the returned object using
 * Lodash.
 * @template TArg argument type
 * @template TResult result type
 * @template Picked a subset of the result type
 */
export function extract<TArg, TResult, Picked extends keyof TResult>(
  fn: (arg: TArg, theme: Theme.Type) => TResult,
  pickSpec: Array<string | number | symbol>,
  theme: Theme.Type,
): (arg: TArg) => TResult[Picked] {
  return (arg) => {
    const result = fn(arg, theme);

    if (pickSpec.length === 0) {
      return result;
    }

    return _.get(result, pickSpec);
  };
}

/**
 * A type-safe key implementation for union-property-tytpd object.
 * @param obj an object with union property type.
 */
function keys<T extends string>(obj: {[k in T]: any}): T[] {
  return _.keys(obj) as any;
}

/**
 * Creates a hash of the style prop keys for each pose. This internally uses
 * `Core/Hashing` with the default context. May need to reimplement if collision
 * rate is too high.
 * @returns A hash based on the prop keys for the poses of `config`.
 * @param config The configuration function. Make sure that it's pure and
 * efficient.
 * @param props The current properties.
 * @param theme The current theme.
 * @template TPose the pose enum
 * @template TStyle type to describe the styles being handled for the poses
 * @template TElement the RN element in question to be wrapped with pose. This
 * will be either of `Image`, `ScrollView`, `Text`, or `View`.
 * @template TAdditionalProps Defines additional properties to the react element
 * This is intersected with `PropType<TElement>`.
 */
function getShapeHash<
  TPose extends string,
  TStyle,
  TElement,
  TAdditionalProps = {},
>(
  config: ThemeableConfig<TPose, TStyle, TElement, TAdditionalProps>,
  props: Readonly<PropType<Posed<TElement, TPose, TAdditionalProps>>>,
  theme: Theme.Type,
): string
{
  return Hashing.hash(getPosedKeys(config(props, theme))).toString(16);
}

/**
 * Defers running of config to a function that gets executed only on props. In
 * a more generic sense, it attempts to bring out things that are not updated
 * based on props out into the static configuration object. However, since
 * we're dealing with unknown implementation of `config`, we will have to run
 * `config` for every style property for every pose. To avoid having to do such
 * extreneous work, you can optionally provide a list of style properties to
 * `shouldHoist`. Note also the following:
 *   1. All `passive` style props will be hoisted. The only way of updating on
 *      something other than a Theme change is to use a dummy pose for each
 *      update. (e.g. `config.__tminternal_isPose1 = {}`).
 *   2. Same goes for `label`, `props` and `draggable`.
 *   3. Because `config` may be executed multiple times, it should not contain
 *      any side effects, additionally, it should be as efficient as possible.
 *   4. This internally uses `Hashing` to create a hash for the key shape array
 *      to get something that shouldn't collide. However, if the collision
 *      chance is too high, considering hashing twice using 2 separate contexts
 *      to further reduce collision.
 * @param config The configuration function based on `props`. This should be
 * efficient and pure.
 * @param props The current props being passed in.
 * @template TPose the pose enum
 * @template TStyle type to describe the styles being handled for the poses
 * @template TElement the RN element in question to be wrapped with pose. This
 * will be either of `Image`, `ScrollView`, `Text`, or `View`.
 * @template TAdditionalProps Defines additional properties to the react element
 * This is intersected with `PropType<TElement>`.
 * @returns A `react-native-pose` configuration object with each key being
 *          a "dynamic prop".
 */
export function hoistConfigWithProps<
  TPose extends string,
  TStyle,
  TElement,
  TAdditionalProps = {},
>(
  config: ThemeableConfig<TPose, TStyle, TElement, TAdditionalProps>,
  props: Readonly<PropType<Posed<TElement, TPose, TAdditionalProps>>>,
  theme: Theme.Type,
  shouldHoist?: Array<keyof TStyle>,
): PoseConfiguration<TPose, TStyle, TAdditionalProps>
{
  const staticConfig = _.merge({}, config(props, theme));
  const posedProps = getPosedKeys(staticConfig);

  for (const pose of keys(posedProps)) {
    switch (pose) {
      case "label":
      case "passive":
      case "props":
      case "draggable":
        continue;

      default:
        const hoisted = _.mapValues<
          Pose<
            TPose,
            TStyle,
            PropType<Posed<TElement, TPose, TAdditionalProps>>
          >
        >(
          staticConfig[pose] as any,
          (value: any, key: keyof TStyle | "transition") => {
            if (key === "transition") {
              return value;
            } else if (shouldHoist && shouldHoist.indexOf(key) >= 0) {
              return value;
            } else {
              return extract(config, [pose, key], theme);
            }
          },
        ) as any;

        staticConfig[pose] = hoisted;
    }
  }

  return staticConfig;
}

/**
 * Creates a hashable object that maps a pose to a list of style props. label
 * and draggable are ignored.
 *
 * @returns a list of style props for each key for each pose.
 * @param config A realised configuration object for `react-native-pose`
 * @template TPose the pose enum
 * @template TStyle style description for all configured style properties
 * @template TAdditionalProps additional props on top of base props that will
 * be passed in as a param to each of the dyanmic props.
 */
export function getPosedKeys<
  TPose extends string,
  TStyle extends {},
  TAdditionalProps
>(
  config: PoseConfiguration<TPose, TStyle, TAdditionalProps>,
): {
  [key in keyof PoseConfiguration<TPose, TStyle, TAdditionalProps>]: string[];
}
{
  const poses: { [pose: string]: string[] } = {};

  for (const pose of keys(config)) {
    if (pose === "label" || pose === "draggable") {
      continue;
    }
    poses[pose] = keys(config[pose as TPose]);
  }

  return poses as any;
}

/**
 * A Higher-order Component (HOC) that wraps a component generation function
 * given by `react-native-pose` (such as `posed.View`) into a component that
 * responds to theme changes.
 *
 * This, being an HOC, means that `ref` will not be passed through to the
 * wrapped component. If this is required, a `forwardRef` must be used.
 *
 * For convenience, we allow the configuration function to be a simple function
 * that takes in the `prop` and returns a configuration object. However,
 * `react-native-pose` does not really accept such a function. Therefore, we'll
 * have to painstakingly build such a static object so that each of the poses
 * does exactly what we expect, through dynamic props. For example, if we have
 *
 *   ```(props) => { pose1: { key1: a } }```
 *
 * we will rewrite it into:
 *
 *   ```{ pose1: { key1: (props) => a } }```
 *
 * This transform, assumes that `config` is pure and simple, such that we can
 * call it many times and get the expected result. So please ensure that
 * `config` is indeed such a function. If you know ahead-of-time that a prop
 * will not be changed by the function, you can optionally pass it into the
 * `shouldHoist` array so that we simply compute it once and put it there.
 *
 * To determine which of the internally cached components to render, for each
 * update, we have to execute `config` to generate the key structure so that we
 * can hash it to find the existing value.
 *
 * @returns A component that represents a themeable version of a
 * `react-native-pose` animated component.
 *
 * @param hoc The generator HOC that creates a `react-native-pose` animated
 * component
 * @param config The configuration function. It is assumed to be simple, total
 * and pure.
 * @param shouldHoist If passed in, this list of style props will be placed in
 * the static `react-native-pose` configuration object on setTheme being called.
 * (i.e. changes in props will not affect these style props)
 * @template TPose the pose enum
 * @template TStyle type to describe the styles being handled for the poses
 * @template TElement the RN element in question to be wrapped with pose. This
 * will be either of `Image`, `ScrollView`, `Text`, or `View`.
 * @template TAdditionalProps Defines additional properties to the react element
 * This is intersected with `PropType<TElement>`.
 */
export function Themeable<
  TPose extends string,
  TStyle,
  TElement,
  TAdditionalProps = {},
>(
  hoc: (
    config:
      PoseConfiguration<
        TPose,
        TStyle,
        PropType<TElement> & TAdditionalProps
      >,
  ) => Posed<TElement, TPose, TAdditionalProps>,

  config: ThemeableConfig<TPose, TStyle, TElement, TAdditionalProps>,

  shouldHoist?: Array<keyof TStyle>,
): React.ComponentType<PropType<Posed<TElement, TPose, TAdditionalProps>>>
{

  if (__DEV__ && inJestEnvironment()) {
    // in Jest environment, we fix the hashing context instead of choosing one
    // at random.
    Hashing.setContext({
      a: Integer.UNSAFE_ofNumber(513660638),
      array: Integer.UNSAFE_ofNumber(932461440),
      b: Integer.UNSAFE_ofNumber(305970351),
      bigint: Integer.UNSAFE_ofNumber(678164677),
      boolean: Integer.UNSAFE_ofNumber(470651069),
      float: Integer.UNSAFE_ofNumber(695394570),
      int: Integer.UNSAFE_ofNumber(447178590),
      nan: Integer.UNSAFE_ofNumber(556654269),
      null: Integer.UNSAFE_ofNumber(683739127),
      object: Integer.UNSAFE_ofNumber(536128209),
      p: Integer.UNSAFE_ofNumber(1073738297),
      string: Integer.UNSAFE_ofNumber(168654003),
      undefined: Integer.UNSAFE_ofNumber(29061947),
    });
  }

  const ThemedComponent = class Themed extends Component<
    PropType<Posed<TElement, TPose, TAdditionalProps>>,
    IState,
    Action
  >
  {
    public static contextType = Theme.Context;
    public context!: React.ContextType<typeof Theme.Context>;

    private memoizedElements: Map<Theme.Type, Record<string, any>> = new Map();

    constructor(props: PropType<Posed<TElement, TPose, TAdditionalProps>>) {
      super(props);
      this.state = {
        updateFlag: false,
      };
      // Previously, `createElementConstructor` was called here so that
      // a memoized component is produced during the constructor. However, this
      // is not always possible because at this point the themes may not have
      // been registered at this time. Therefore, we will defer the the
      // constructor until the first render function instead. The invariant of
      // two renders of the same component with the same theme using the same
      // component is still held this way.
    }

    public render() {
      const { children, ...props } = this.props as any;

      const theme = this.getCurrentTheme();
      const [ shape, Element ] = this.createElementConstructor(
        theme,
        this.props,
      );

      if (Element) {
        return (
          <Element {...props} key={`${theme}@${shape}`}>
            {children}
          </Element>
        );
      } else {
        return false;
      }
    }

    protected reducer(state: IState, action: Action): Intent.Type<IState> {
      switch (action.action) {
        case "RERENDER":
          return Intent.Update({ updateFlag: !state.updateFlag });
      }
      return Intent.NoUpdate();
    }

    private getCurrentTheme = () => {
      return this.context;
    }

    private createElementConstructor = (
      theme: Theme.Type,
      props: Readonly<PropType<Posed<TElement, TPose, TAdditionalProps>>>,
    ) => {
      const memoizedKey = getShapeHash(config, props, theme);

      const element = this.memoizedElements.get(theme);

      let elementMap: Record<string, any>;

      if (Option.isNone(element)) {
        elementMap = {};
        this.memoizedElements.set(theme, elementMap);
      } else {
        elementMap = element;
      }

      if (Option.isNone(elementMap[memoizedKey])) {
        const constructor: any = hoc(
          hoistConfigWithProps(config, props, theme, shouldHoist),
        );
        if (__DEV__ && inJestEnvironment()) {
          Object.defineProperty(constructor, "name", {
            value: `Themed_${theme}@${memoizedKey}`,
          });
        }
        elementMap[memoizedKey] = constructor;
      }
      return [
        memoizedKey,
        elementMap[memoizedKey],
      ];
    }
  };

  return ThemedComponent;
}
