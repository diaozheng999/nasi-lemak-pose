/**
 * View.ts
 * @author Diao Zheng
 * @file Well-typed variant that encapsulates `posed.View()`
 *
 * @ignore_test
 */

import { View as RNView, ViewProps, ViewStyle } from "react-native";
import posed from "react-native-pose";
import { PoseConfiguration } from "./PoseConfiguration";
import { Posed } from "./Posed";

export function View<
  TPose extends string,
  TStyle extends {} = ViewStyle,
  TAdditionalProps = {},
>(
  config: PoseConfiguration<TPose, TStyle, ViewProps & TAdditionalProps>,
): Posed<RNView, TPose, TAdditionalProps> {
  return posed.View(config);
}
