import next from "@next/eslint-plugin-next";

import react from "./react.js";

export default [
  ...react,
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    plugins: { "@next/next": next },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
    },
  },
  {
    // Every Next.js app in this workspace uses the App Router convention of
    // a single global stylesheet at `src/app/global.css` (see task 8's
    // `apps/web`) — see `react.js` for why `eslint-plugin-tailwindcss`'s
    // `cssConfigPath` can't be set generically for every consumer of that
    // shared preset. Apps that deviate from this path must override this
    // setting locally.
    settings: { tailwindcss: { cssConfigPath: "src/app/global.css" } },
  },
];
