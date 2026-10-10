import { RuleTester } from "eslint";

import rule from "./no-arbitrary-shorthand.js";

const tester = new RuleTester({
  languageOptions: { ecmaVersion: "latest", sourceType: "module" },
});

const error = [{ messageId: "arbitraryShorthand" }];

tester.run("no-arbitrary-shorthand", rule, {
  valid: [
    { code: 'const c = "h-button-h-md px-4";' },
    { code: 'const c = "hover:bg-brand-primary md:flex [&>*]:shrink-0";' },
    { code: 'const style = { color: "var(--color-pink-500)" };' },
    { code: 'const selector = "[data-surface=brand]";' },
  ],
  invalid: [
    { code: 'const c = "w-(--x)";', errors: error },
    { code: 'const c = "flex hover:h-(--button-h-sm)";', errors: error },
    { code: 'const c = "text-(length:--fs)";', errors: error },
    { code: 'const c = "[mask-type:alpha]";', errors: error },
    { code: "const c = `md:[scrollbar-width:none] p-4`;", errors: error },
  ],
});

console.log("no-arbitrary-shorthand: all RuleTester cases passed");
