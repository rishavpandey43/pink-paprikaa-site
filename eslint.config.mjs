import base from "@pink-paprikaa-web/eslint-config/base";

export default [
  ...base,
  {
    ignores: ["**/vite.config.*.timestamp*", "**/vitest.config.*.timestamp*"],
  },
];
