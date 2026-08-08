---
description: Scaffold an app feature module (feature folder, route, content-first, e2e) per the handbook
---

Create a new feature module following docs/engineering exactly. Feature request: $ARGUMENTS

Deterministic procedure — docs/engineering/08-recipes.md §2, gated:

1. Scope first: write one sentence of what the feature does and an explicit OUT-of-scope list.
   Confirm which app owns it (web vs blog) from the request; if genuinely ambiguous, ask before
   creating files.
2. Content first: if the feature needs data, run recipe §4 (schema in `packages/content`, parse
   at boundary, invalid-fixture tests) BEFORE any UI file exists.
3. Scaffold `apps/<app>/src/features/<name>/` with only what's needed today:
   `components/`, `<name>-constants.ts`, `<name>-transformer.ts` — transformer is a pure typed
   function with unit tests (docs/engineering/03-patterns.md §4).
4. Route: path added to `src/constants/routes.ts` as `as const`; `app/<route>/page.tsx` stays a
   thin binding (no logic in JSX — the lint and review rubric both check).
5. State: justify every piece of state against the ladder (03-patterns §6) in a code comment at
   the state's declaration if above rung 2.
6. Interactivity: `"use client"` on smallest leaves only. Page-level directive = redo.
7. e2e: extend the app's journey spec if a user journey changed; specs run against the real
   export.
8. Gate: `pnpm verify` + `pnpm nx e2e <app>-e2e` (show output), self-review per 06 §5, commit
   with the app's scope.
