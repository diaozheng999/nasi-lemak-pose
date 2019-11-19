/**
 * RuntimeUtilities.ts
 * @author Diao Zheng
 * @file Utilities to be able to include partial test scripts at runtime.
 * @barrel ignore
 * @ignore_test
 */

export function inJestEnvironment(): boolean {
  // tslint:disable:max-line-length
  //
  // Jest defines an environment variable JEST_WORKER_ID according to
  // https://stackoverflow.com/questions/50940640/how-to-determine-if-jest-is-running-the-code-or-not
  //
  // tslint:enable:max-line-length
  return !!(process && process.env && process.env.JEST_WORKER_ID);
}
