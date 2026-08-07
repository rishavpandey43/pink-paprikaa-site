import react from "@pink-paprikaa-web/eslint-config/react";

export default [
  ...react,
  {
    ignores: ["**/out-tsc"],
  },
];
