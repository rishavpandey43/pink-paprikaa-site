import { RuleTester } from "eslint";

import rule from "./no-native-ui.js";

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run("no-native-ui", rule, {
  valid: [
    { code: "const el = <Select options={[]} />;", filename: "/packages/ui/src/atoms/field.tsx" },
    {
      code: "const el = <select><option>A</option></select>;",
      filename: "/packages/ui/src/lib/platform-select.tsx",
    },
    {
      code: "const el = <select><option>A</option></select>;",
      filename: "/packages/ui/src/atoms/select/select.tsx",
    },
    {
      code: 'const el = <input type="range" />;',
      filename: "/packages/ui/src/atoms/slider/slider.tsx",
    },
    { code: 'const el = <input type="text" aria-required />;', filename: "/app.tsx" },
    { code: 'const el = <Alert title="Busy" />;', filename: "/app.tsx" },
    { code: "const el = <svg><title>Bag</title></svg>;", filename: "/app.tsx" },
    { code: "const el = <form noValidate />;", filename: "/app.tsx" },
  ],
  invalid: [
    {
      code: "const el = <select><option>A</option></select>;",
      filename: "/packages/ui/src/atoms/input/input.tsx",
      errors: [{ messageId: "select" }],
    },
    {
      code: 'const el = <input type="date" />;',
      filename: "/apps/storybook/src/patterns/enquiry-form.tsx",
      errors: [{ messageId: "inputType" }],
    },
    {
      code: 'const el = <input type="range" />;',
      filename: "/packages/ui/src/atoms/input/input.tsx",
      errors: [{ messageId: "inputType" }],
    },
    {
      code: "const el = <input required />;",
      filename: "/app.tsx",
      errors: [{ messageId: "required" }],
    },
    {
      code: 'const el = <button title="tip">Go</button>;',
      filename: "/app.tsx",
      errors: [{ messageId: "title" }],
    },
    {
      code: "const el = <form />;",
      filename: "/app.tsx",
      errors: [{ messageId: "form" }],
    },
  ],
});

console.log("no-native-ui: all RuleTester cases passed");
