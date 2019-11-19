/**
 * Pose.ts
 * @author Diao Zheng
 * @file Defines a pose for `react-native-pose`
 * @ignore_test
 */

import { Animated } from "react-native";
import { IPosedProp } from "./IPosedProp";
import * as Transition from "./Transition";

export interface IPoseBase<TPose extends string, TStyles> {
  transition?: Transition.ConfigType<number, TPose>;
  passive?: {
    [passiveProp in keyof TStyles]?: [
      keyof TStyles,
      Animated.InterpolationConfigType
    ];
  };
}

export type StaticPose<TValue, TStyles> =
  | TValue
  | [keyof TStyles, Animated.AnimatedInterpolation]
;

export type DynamicPose<TValue, TStyles, TProps> =
  (props: TProps) => StaticPose<TValue, TStyles>
;

export type PoseEntryValue<TValue, TStyles, TProps> =
  | StaticPose<TValue, TStyles>
  | DynamicPose<TValue, TStyles, TProps>
;

export type PoseEntry<TStyles, TProps> = {
  [key in keyof TStyles]:
    | TStyles[key]
    | PoseEntryValue<TStyles[key], TStyles, TProps>
};

export type Pose<TPose extends string, TStyles, TProps> = {
  [key in keyof TStyles]?: PoseEntry<TStyles[key], TProps & IPosedProp<TPose>>
} & IPoseBase<TPose, TStyles>;
