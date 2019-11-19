/**
 * Image.ts
 * @author Diao Zheng
 * @file Well-typed variant that encapsulates `posed.Image()`
 *
 * @ignore_test
 */

import { Image as RNImage, ImageProps, ImageStyle } from "react-native";
import posed from "react-native-pose";
import { PoseConfiguration } from "./PoseConfiguration";
import { Posed } from "./Posed";

export function Image<
  TPose extends string,
  TStyle = ImageStyle,
  TAdditionalProps = {},
>(
  config: PoseConfiguration<TPose, TStyle, ImageProps & TAdditionalProps>,
): Posed<RNImage, TPose, TAdditionalProps> {
  return posed.Image(config);
}
