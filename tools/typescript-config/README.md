# TypeScript Config Presets

Shared TypeScript configuration presets for the workspace: `base.json` (all projects), `next.json` (Next.js apps), `react-library.json` (React component libraries), and `node.json` (Node.js projects).

Strict compiler options are defined once in the root `tsconfig.base.json` and inherited by all presets.

**Currently unconsumed.** Generated project `tsconfig.json`s extend the root `tsconfig.base.json` directly, not these presets — strictness holds via the root base, not through this package. Whether to wire projects onto these presets or retire them is a Phase 1 decision (see spec §15, Phase 0 progress table).
