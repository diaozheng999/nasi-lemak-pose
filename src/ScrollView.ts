/**
 * ScrollView.ts
 * @author Diao Zheng
 * @file Well-typed variant that encapsulates `posed.Text()`
 *
 * @ignore_test
 */

import {
  ScrollView as RNScrollView,
  ScrollViewProps,
  ViewStyle,
} from "react-native";
import posed from "react-native-pose";
import { PoseConfiguration } from "./PoseConfiguration";
import { Posed } from "./Posed";

export function ScrollView<
  TPose extends string,
  TStyle = ViewStyle,
  TAdditionalProps = {},
>(
  config: PoseConfiguration<TPose, TStyle, ScrollViewProps & TAdditionalProps>,
): Posed<RNScrollView, TPose, TAdditionalProps> {
  return posed.ScrollView(config);
}
