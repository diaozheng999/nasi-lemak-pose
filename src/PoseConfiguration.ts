/**
 * PoseConfiguration.ts
 * @author Diao Zheng
 * @file defines types for pose configuration in `react-native-pose`
 *
 * see https://popmotion.io/pose
 * @ignore_test
 */
import { Animated } from "react-native";
import { IPosedProp } from "./IPosedProp";
import { Pose } from "./Pose";
import { ITransitionProps } from "./Transition";

export interface IStaticPoseConfiguration<
  TStyle extends {},
  TProps,
  TPose extends string
> {
  draggable?: boolean | "x" | "y";
  dragging?: Pose<"dragging", TStyle, TProps>;
  dragEnd?: Pose<"dragEnd", TStyle, TProps>;
  label?: string;
  props?: Partial<ITransitionProps<unknown, TPose>>;
  passive?: {
    [passiveProp in keyof TStyle]?: [
      keyof TStyle,
      Animated.InterpolationConfigType
    ]
  };
}

export interface IPoseChildrenConfigEntry {
  staggerChildren?: number;
}

export type PoseConfiguration<
  TPose extends string,
  TStyle extends {},
  TProps
> = IStaticPoseConfiguration<TStyle, TProps & IPosedProp<TPose>, TPose> & {
  [pose in TPose]:
    Pose<pose, TStyle, TProps & IPosedProp<TPose>> &
    IPoseChildrenConfigEntry;
};
