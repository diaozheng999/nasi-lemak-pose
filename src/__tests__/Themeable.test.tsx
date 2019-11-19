/**
 * Themeable.test.tsx
 * @author Diao Zheng
 * @file test file for themeable HOC
 */

import { MyM1ReactNativeTheme, Theme } from "nasi-lemak";
import React from "react";
import { View as RNView, ViewStyle } from "react-native";
import renderer from "react-test-renderer";
import { PoseConfiguration } from "../PoseConfiguration";
import { RuntimeUtilities } from "../TestUtilities";
import * as Themeable from "../Themeable";
import { View as PosedView } from "../View";

jest.useFakeTimers();

const DEFAULT = Theme.DEFAULT_THEME;
const ELECTABUZZ = MyM1ReactNativeTheme.registeredTheme("ELECTABUZZ");

describe("extract", () => {

  test("empty", () => {
    const result = { a: 1 };
    expect(Themeable.extract(
      () => result,
      [],
      DEFAULT,
    )({})).toStrictEqual(result);
  });

  test("single", () => {
    const result = { a: 1 };
    expect(Themeable.extract(
      () => result,
      ["a"],
      DEFAULT,
    )({})).toStrictEqual(1);
  });

  test("nested", () => {
    const result = { a: { b: 1 } };
    expect(Themeable.extract(
      () => result,
      ["a", "b"],
      DEFAULT,
    )({})).toStrictEqual(1);
  });

  test("missing", () => {
    const result = { a: { b: 1 } };
    expect(Themeable.extract(
      () => result,
      ["a", "c"],
      DEFAULT,
    )({})).toBeUndefined();
  });

});

describe("getPosedKeys", () => {
  test("no static poses", () => {
    const keys = Themeable.getPosedKeys({
      draggable: "x",
      props: {},
    });
    expect(keys).toStrictEqual({
      props: [],
    });
  });

  test("with poses", () => {
    const keys = Themeable.getPosedKeys({
      pose1: { a: 1, b: 2 },
      pose2: { b: 1, a: 2 },
      props: {},
    });
    expect(keys).toStrictEqual({
      pose1: ["a", "b"],
      pose2: ["b", "a"],
      props: [],
    });
  });

  test("ignored keys", () => {
    const keys = Themeable.getPosedKeys({
      draggable: false,
      label: "boo",
    });
    expect(keys).toStrictEqual({});
  });
});

describe("hoistConfigWithProps", () => {
  test("static values", () => {
    const config: PoseConfiguration<
      never,
      { c: number, d: number },
      {}
    >
    = {
      draggable: false,
      label: "label",
      passive: {
        d: ["c", { inputRange: [0, 1], outputRange: [1, 0] }],
      },
      props: {
        useNativeDriver: true,
      },
    };

    expect(
      Themeable.hoistConfigWithProps<
        never,
        { c: number, d: number },
        RNView
      >(() => config, { pose: undefined as never }, DEFAULT),
    ).toStrictEqual(config);
  });

  test("static values", () => {
    const config: PoseConfiguration<
      "a",
      { c: number, d: number },
      {}
    >
    = {
      a: { c: 5 },
      draggable: false,
      label: "label",
      passive: {
        d: ["c", { inputRange: [0, 1], outputRange: [1, 0] }],
      },
      props: {
        useNativeDriver: true,
      },
    };

    const hoisted = Themeable.hoistConfigWithProps<
      "a",
      { c: number, d: number },
      RNView
    >(() => config, { pose: "a" }, DEFAULT);

    expect((hoisted.a.c as any)()).toBe(5);
  });

  test("transform", () => {
    const config: PoseConfiguration<
      "a",
      { c: number, d: number },
      {}
    >
    = {
      a: {
        c: 5,
        transition: {
          ease: "linear",
        },
      },
      draggable: false,
      label: "label",
      passive: {
        d: ["c", { inputRange: [0, 1], outputRange: [1, 0] }],
      },
      props: {
        useNativeDriver: true,
      },
    };

    const hoisted = Themeable.hoistConfigWithProps<
      "a",
      { c: number, d: number },
      RNView
    >(() => config, { pose: "a" }, DEFAULT);

    expect(hoisted.a.transition).toStrictEqual(config.a.transition as any);
  });

  test("shouldHoist", () => {
    const config: PoseConfiguration<
      "a",
      { c: number, d: number },
      {}
    >
    = {
      a: {
        c: 5,
        d: 6,
        transition: {
          ease: "linear",
        },
      },
      draggable: false,
      label: "label",
      passive: {
        d: ["c", { inputRange: [0, 1], outputRange: [1, 0] }],
      },
      props: {
        useNativeDriver: true,
      },
    };

    const hoisted = Themeable.hoistConfigWithProps<
      "a",
      { c: number, d: number },
      RNView
    >(() => config, { pose: "a" }, DEFAULT, ["c"]);

    expect(hoisted.a.c).toBe(5);
    expect((hoisted.a.d as any)()).toBe(6);
  });
});

describe("hoc", () => {

  test("memoized element", () => {
    const Element = Themeable.Themeable<
      "a",
      ViewStyle,
      RNView,
      { __test: boolean }
    >
    (
      PosedView,
      ({ __test }) =>  {
        if (__test) {
          return { a: { borderRadius: 5 } };
        } else {
          return { a: { borderBottomRadius: 5 } };
        }
      },
    );

    const tree = RuntimeUtilities.createRenderer(
      <Theme.Context.Provider value={DEFAULT}>
        <Element pose="a" __test={true} />
      </Theme.Context.Provider>,
    );

    const root1: any = tree.root.findAllByProps({ pose: "a" })[1];

    renderer.act(() => {
      tree.update(
        <Theme.Context.Provider value={DEFAULT}>
          <Element pose="a" __test={false} />
        </Theme.Context.Provider>,
      );
    });
    jest.runAllImmediates();
    const root2: any = tree.root.findAllByProps({ pose: "a" })[1];

    renderer.act(() => {
      tree.update(
        <Theme.Context.Provider value={DEFAULT}>
          <Element pose="a" __test={true} />
        </Theme.Context.Provider>,
      );
    });

    jest.runAllImmediates();

    const root3: any = tree.root.findAllByProps({ pose: "a" })[1];

    expect(root1._fiber.elementType).not.toBe(root2._fiber.elementType);
    expect(root1._fiber.elementType).toBe(root3._fiber.elementType);
  });

  test("different theme", () => {
    const Element = Themeable.Themeable<
      "a",
      ViewStyle,
      RNView,
      { __test: boolean }
    >
    (
      PosedView,
      ({ __test }) =>  {
        if (__test) {
          return { a: { borderRadius: 5 } };
        } else {
          return { a: { borderBottomRadius: 5 } };
        }
      },
    );
    const tree = RuntimeUtilities.createRenderer(
      <Theme.Context.Provider value={DEFAULT}>
        <Element pose="a" __test={true} />
      </Theme.Context.Provider>,
    );
    const root1: any = tree.root.findAllByProps({ pose: "a" })[1];

    renderer.act(() => {
      tree.update(
        <Theme.Context.Provider value={ELECTABUZZ}>
          <Element pose="a" __test={true} />
        </Theme.Context.Provider>,
      );
    });

    jest.runAllImmediates();
    renderer.act(() => {
      jest.runAllTimers();
    });
    const root2: any = tree.root.findAllByProps({ pose: "a" })[1];

    expect(root1._fiber.elementType).not.toBe(root2._fiber.elementType);
  });
});
