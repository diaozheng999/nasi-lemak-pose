/**
 * jestSetup.js
 * @author My M1 App Team
 * @file Jest setup script
 */

const React = require("react");

function MockPosed(component) {
  return (config) => (props) => {
    const { children, ...otherProps } = props;

    const renderedProps = {
      ...otherProps,
      posedConfig: config,
    };

    return React.createElement(component, renderedProps, children);
  };
}

jest
  .mock("./src/Image", () => MockPosed("PosedImage"))
  .mock("./src/Text", () => MockPosed("PosedText"))
  .mock("./src/ScrollView", () => MockPosed("PosedScrollView"))
  .mock("./src/View", () => MockPosed("PosedView"))
;
