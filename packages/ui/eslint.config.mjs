import atomicLayering from "@pink-paprikaa-web/eslint-config/atomic-layering";
import react from "@pink-paprikaa-web/eslint-config/react";

export default [
  ...react,
  ...atomicLayering,
  {
    ignores: ["**/out-tsc"],
  },
];
