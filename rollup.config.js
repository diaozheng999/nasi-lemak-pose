
import { terser } from "rollup-plugin-terser";

module.exports = {
  input: "dist/esm/index.js",
  plugins: [
    terser(),
  ],
  external: [
    "lodash",
    "nasi",
    "nasi-lemak",
    "react",
    "react-native-pose",
    "tslib"
  ],
  output: {
    file: "dist/cjs/index.js",
    format: "cjs",
  },
};
