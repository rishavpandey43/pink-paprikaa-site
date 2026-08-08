import atomicLayering from "@pink-paprikaa-web/eslint-config/atomic-layering";
import react from "@pink-paprikaa-web/eslint-config/react";

export default [
  ...react,
  ...atomicLayering,
  {
    ignores: ["**/out-tsc"],
  },
  {
    // `react.js` registers `eslint-plugin-tailwindcss` without a
    // `cssConfigPath` (it can't pick one correct path for every consumer —
    // see the comment there). This package's Tailwind entry is `tailwind.css`
    // at its root, not the App Router `src/app/global.css` that `next.js`
    // defaults to. That file exists solely for this setting: Storybook (which
    // used to own the only Tailwind entry here) is now `apps/storybook`.
    settings: { tailwindcss: { cssConfigPath: "tailwind.css" } },
  },
];
