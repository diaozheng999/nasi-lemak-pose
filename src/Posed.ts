/**
 * Posed.ts
 * @author Diao Zheng
 * @file Defines the posed component type for `react-native-pose`
 * see https://popmotion.io/pose/
 *
 * @ignore_test
 */

import React from "react";
import { IPosedProp } from "./IPosedProp";

type GetStyleProp<T> = T extends { style?: infer U } ? U : {};
type MergeStyleProp<T> = { style?: GetStyleProp<T> } & Omit<T, "style">;

export type Posed<TComponent, TPose extends string, TAdditionalProps = {}> =
  TComponent extends React.Component<infer TProp> ?
    React.ReactType<
      MergeStyleProp<TProp & IPosedProp<TPose> & TAdditionalProps>
    >
  :
    never
;
