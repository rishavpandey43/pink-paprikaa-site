import noArbitraryShorthand from "./no-arbitrary-shorthand.js";
import noNativeUi from "./no-native-ui.js";
import noRawHex from "./no-raw-hex.js";

// The workspace's own rules as ONE object: flat config throws "Cannot redefine plugin" when two
// different objects are registered under `pink-paprikaa` for the same file (base.js and react.js
// both cover `.ts`), so every config block must reference this same instance.
const pinkPaprikaa = {
  rules: {
    "no-arbitrary-shorthand": noArbitraryShorthand,
    "no-native-ui": noNativeUi,
    "no-raw-hex": noRawHex,
  },
};

export default pinkPaprikaa;
