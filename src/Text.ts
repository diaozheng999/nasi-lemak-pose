/**
 * Text.ts
 * @author Diao Zheng
 * @file Well-typed variant that encapsulates `posed.Text()`
 *
 * @ignore_test
 */

import { Text as RNText, TextProps, TextStyle } from "react-native";
import posed from "react-native-pose";
import { PoseConfiguration } from "./PoseConfiguration";
import { Posed } from "./Posed";

export function Text<
  TPose extends string,
  TStyle = TextStyle,
  TAdditionalProps = {},
>(
  config: PoseConfiguration<TPose, TStyle, TextProps & TAdditionalProps>,
): Posed<RNText, TPose, TAdditionalProps> {
  return posed.Text(config);
}
