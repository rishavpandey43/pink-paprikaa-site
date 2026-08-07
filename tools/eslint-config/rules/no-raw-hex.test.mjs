import { RuleTester } from "eslint";
import rule from "./no-raw-hex.js";

const tester = new RuleTester({
  languageOptions: { ecmaVersion: "latest", sourceType: "module" },
});

tester.run("no-raw-hex", rule, {
  valid: [
    { code: 'const c = "bg-brand-primary";' },
    { code: 'const c = "text-lg font-bold";' },
    { code: 'const id = "#anchor";' },
  ],
  invalid: [
    { code: 'const c = "#EE2C68";', errors: [{ messageId: "rawHex" }] },
    { code: "const c = `border-[#ee2c68]`;", errors: [{ messageId: "rawHex" }] },
  ],
});

console.log("no-raw-hex: all RuleTester cases passed");
