//@ts-check
import { withContentCollections } from "@content-collections/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: no Node server, no runtime cost (spec §10). Petpooja
  // handles ordering off-domain; this app ships pre-rendered HTML only.
  output: "export",
  images: { unoptimized: true },
  // The blog is deployed under /blog on the marketing domain (spec §4).
  basePath: "/blog",
};

// `@content-collections/next` is ESM-only in practice — its config-file
// default (`content-collections.ts`) and its own source both use `import`.
// `apps/blog/package.json` has no `"type": "module"`, so a plain
// `next.config.js` is CommonJS and `require()`ing it trips
// `@typescript-eslint/no-require-imports`; `next.config.mjs` (an officially
// supported filename — see `next/dist/shared/lib/constants.js` CONFIG_FILES)
// lets this stay `import` without an eslint-disable. Deviates from
// `apps/web/next.config.js`'s `.js` extension for that reason.
export default withContentCollections(nextConfig);
