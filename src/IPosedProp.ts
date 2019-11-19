/**
 * IPosedProp.ts
 * @author Diao Zheng
 * @file Defines passable props to a posed element from `react-native-pose`
 *
 * see https://popmotion.io/pose
 * @ignore_test
 */

export interface IPosedProp<T extends string> {
  pose: T;
}
