# Phase 0 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete every ⬜ todo item in §15 of
`docs/superpowers/specs/2026-08-07-boilerplate-architecture-design.md` so that
`pnpm install && pnpm verify` passes from a clean clone and every §12 gate exists.

**Architecture:** Nx 23 integrated monorepo (pnpm workspaces, inferred tasks only). Two
static-export Next.js 16 apps + Playwright e2e apps; five `packages/*` libraries; three `tools/*`
packages. Style Dictionary builds DTCG seed tokens into a Tailwind v4 `@theme` stylesheet.
**Boilerplate only:** every project is empty-but-wired — generator stubs, configuration, and
pipelines; no design-system components, no product code, no content (Global Constraint 15).

**Tech Stack:** Nx 23.1.1 · pnpm 10 · TypeScript 6.0.3 · Next.js 16 · React 19 · Tailwind v4 ·
Style Dictionary 5 · Vitest 4 · Playwright · Storybook 10 · ESLint 10 flat config ·
husky 9 + commitlint + Commitizen · sharp · Content Collections.

## Global Constraints

Every task's requirements implicitly include all of these.

1. **`Pink Paprikaa` — two `a`s** in every occurrence, code and copy.
2. **Founder-name ban:** the strings `rishav`, `pandey`, `anand` (any case) must never appear in
   app source, package source, content data, or built output. (They may appear in `docs/` and
   git history only.)
3. **`#EE2C68` exists in exactly one place:** `packages/design-tokens/tokens/`. Nowhere else —
   not in className, JSX, CSS, or stories.
4. **Never hand-write a dependency version into any `package.json`.** Install with
   `pnpm add <pkg>` / `pnpm add -D <pkg>` (resolves latest stable) or an Nx generator. Two
   standing exceptions already in place: `typescript: ~6.0.3` stays (do not upgrade), and
   `eslint-plugin-jsx-a11y` gets a pnpm peer override (Task 2).
5. **pnpm only.** Every Nx invocation is `pnpm nx …`. Never `npm`, `yarn`, or a global `nx`.
6. **No `project.json` files.** Targets come from Nx plugin inference and `package.json`
   `scripts` / `nx` fields only.
7. **No Nx Cloud.** Do not add `nx-cloud` or `nx connect` anywhere.
8. **Cross-package imports use the npm scope** (`@pink-paprikaa-web/<name>`) — never a relative
   path that escapes a package.
9. **Conventional Commits.** Allowed scopes (scope is optional): `web`, `blog`, `ui`, `tokens`,
   `content`, `seo`, `utils`, `tools`, `ci`, `deps`.
10. **Task exit gate:** before the final commit of every task,
    `pnpm nx format:check && pnpm nx sync:check` and
    `pnpm nx affected -t typecheck lint test build` must all pass (run
    `pnpm nx format:write` and `pnpm nx sync` to fix, and commit what they change).
11. **pnpm 10 blocks postinstall build scripts.** If `pnpm install`/`pnpm add` warns about
    ignored build scripts (e.g. `sharp`, `esbuild`, `@tailwindcss/oxide`), add that package to
    `onlyBuiltDependencies` in `pnpm-workspace.yaml` and re-run `pnpm install`.
12. **Never guess Nx generator flags.** Run `pnpm nx g <generator> --help` first; the flags below
    are believed correct for Nx 23 but the `--help` output governs.
13. **Environment:** Node 24 (`.nvmrc`), pnpm 10.26.1 (`packageManager`). Nx defaultBase is
    `main`.
14. **Generated output is a starting point** (spec §18): after any generator runs, diff every
    file it wrote against this plan and the spec, and correct disagreements (quote style, npm
    commands, Nx Cloud references, single-quote Prettier output).
15. **Boilerplate only (user directive 2026-08-07).** This plan delivers architectural setup —
    workspace, tooling, configuration, CI, and empty-but-wired projects. No product code, no
    design-system components, no content: apps and packages keep their **generator-produced
    stubs** (corrected for config compliance), placeholders exist only where required to prove
    the setup runs, and anything visual or content-shaped waits for Phases 1–2. Tooling
    implementations the spec's §15 lists as Phase 0 setup (lint rules, image-pipeline tool, CI
    guard scripts, token pipeline seeds) are in scope.
16. **The Nx way, always (user directive 2026-08-07).** Set up every capability through Nx:
    `pnpm nx add <plugin>` / `pnpm nx g <generator>` first, hand-authoring only where no
    generator covers it. Build on what Nx generates and exports (e.g. compose ESLint configs
    from `@nx/eslint-plugin`'s flat presets rather than reinventing them) instead of replacing
    Nx's structure. Every task must remain invocable as `pnpm nx <target> <project>`, inference
    must keep working (`pnpm nx show project <name>` lists the expected targets), and nothing
    may break `nx graph`, `nx sync`, or `nx affected`.

---

### Task 1: `tools/typescript-config` — four shared presets

**Files:**

- Create: `tools/typescript-config/package.json`
- Create: `tools/typescript-config/base.json`
- Create: `tools/typescript-config/next.json`
- Create: `tools/typescript-config/react-library.json`
- Create: `tools/typescript-config/node.json`
- Create: `tools/typescript-config/README.md`

**Interfaces:**

- Consumes: root `tsconfig.base.json` (already exists; carries the strict options).
- Produces: presets that later tasks' tsconfigs extend as
  `"extends": "@pink-paprikaa-web/typescript-config/<preset>.json"`. Tasks 5, 6, 8, 9, 11 rely on
  these exact names: `base.json`, `next.json`, `react-library.json`, `node.json`.

This is a config-only package: JSON presets, no source, no build target. TypeScript resolves
`extends` through node module resolution, so being a workspace package is enough.

- [ ] **Step 1: Create the package manifest**

`tools/typescript-config/package.json`:

```json
{
  "name": "@pink-paprikaa-web/typescript-config",
  "version": "0.0.0",
  "private": true,
  "description": "Shared TypeScript presets: base / next / react-library / node"
}
```

- [ ] **Step 2: Create the four presets**

`tools/typescript-config/base.json` — everything extends the root strict base; presets add only
what differs:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true
  }
}
```

`tools/typescript-config/next.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es2022"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "noEmit": true,
    "emitDeclarationOnly": false,
    "allowJs": true,
    "incremental": true,
    "plugins": [{ "name": "next" }]
  }
}
```

`tools/typescript-config/react-library.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es2022"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx"
  }
}
```

`tools/typescript-config/node.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "types": ["node"]
  }
}
```

`README.md`: three lines — what each preset is for, and that the strict flags live in the root
`tsconfig.base.json` (spec §6).

- [ ] **Step 3: Verify the workspace sees the package**

Run: `pnpm install` (links the new workspace package), then `pnpm nx show projects`.
Expected: `@pink-paprikaa-web/typescript-config` is listed (name comes from package.json).
Then run the exit gate (Global Constraint 10).

- [ ] **Step 4: Commit**

```bash
git add tools/typescript-config pnpm-lock.yaml
git commit -m "feat(tools): add shared TypeScript presets (base/next/react-library/node)"
```

---

### Task 2: ESLint 10 flat config in `tools/eslint-config`

**Files:**

- Modify: `pnpm-workspace.yaml` (jsx-a11y peer override)
- Create: `tools/eslint-config/package.json`
- Create: `tools/eslint-config/base.js`
- Create: `tools/eslint-config/react.js`
- Create: `tools/eslint-config/next.js`
- Create: `tools/eslint-config/rules/no-raw-hex.js`
- Create: `tools/eslint-config/rules/no-raw-hex.test.mjs`
- Create: `eslint.config.mjs` (workspace root)

**Interfaces:**

- Consumes: `@pink-paprikaa-web/typescript-config` exists (Task 1) — not imported, but the same
  package pattern is followed.
- Produces: `@pink-paprikaa-web/eslint-config` exporting three flat-config arrays: `base`
  (TS + Nx boundaries + perfectionist + prettier), `react` (base + react/hooks/jsx-a11y +
  no-raw-hex + atomic layering), `next` (react + @next plugin). Root `eslint.config.mjs` composes
  them for the whole workspace. Task 10 fills the `depConstraints` in the boundaries rule — write
  the rule now with the full §5 constraint table so Task 10 only has to add tags to projects.

- [ ] **Step 1: Add the peer override, then install the lint stack**

In `pnpm-workspace.yaml` append (spec §13 — exact YAML):

```yaml
peerDependencyRules:
  allowedVersions:
    "eslint-plugin-jsx-a11y>eslint": "10"
```

(Note: at the top level of `pnpm-workspace.yaml`, not nested under a `pnpm:` key — that nesting
is for `package.json`.)

Run:

```bash
pnpm add -D eslint typescript-eslint eslint-plugin-react eslint-plugin-react-hooks \
  eslint-plugin-jsx-a11y @next/eslint-plugin-next eslint-plugin-perfectionist \
  eslint-plugin-tailwindcss eslint-config-prettier jiti
pnpm nx add @nx/eslint
```

Expected: ESLint resolves to 10.x, no unresolved peer warnings about jsx-a11y. `@nx/eslint`
registers its plugin in `nx.json` — verify the diff adds `@nx/eslint/plugin` and nothing about
Nx Cloud. (`jiti` lets ESLint load TS-adjacent config if needed by plugins.)

- [ ] **Step 2: Write the custom `no-raw-hex` rule and its test**

`tools/eslint-config/rules/no-raw-hex.js` — bans hex colour literals in JSX/className/strings
(spec §7 rule 1):

```js
const HEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/;

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Ban literal hex colours. The brand hex exists once, in packages/design-tokens — use the token.",
    },
    messages: {
      rawHex:
        "Raw hex colour '{{value}}' — use a design token from @pink-paprikaa-web/design-tokens instead.",
    },
    schema: [],
  },
  create(context) {
    const check = (node, raw) => {
      const match = typeof raw === "string" && raw.match(HEX);
      if (match) {
        context.report({ node, messageId: "rawHex", data: { value: match[0] } });
      }
    };
    return {
      Literal(node) {
        check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value.raw);
      },
      JSXText(node) {
        check(node, node.value);
      },
    };
  },
};
```

`tools/eslint-config/rules/no-raw-hex.test.mjs` — use ESLint's `RuleTester` (node test runner,
no framework install needed):

```js
import { RuleTester } from "eslint";
import rule from "./no-raw-hex.js";

const tester = new RuleTester({
  languageOptions: { ecmaVersion: "latest", sourceType: "module" },
});

tester.run("no-raw-hex", rule, {
  valid: [
    { code: 'const c = "bg-brand-primary";' },
    { code: 'const c = "text-lg font-bold";' },
    { code: 'const id = "#anchor";' },
  ],
  invalid: [
    { code: 'const c = "#EE2C68";', errors: [{ messageId: "rawHex" }] },
    { code: "const c = `border-[#ee2c68]`;", errors: [{ messageId: "rawHex" }] },
  ],
});

console.log("no-raw-hex: all RuleTester cases passed");
```

Run: `node tools/eslint-config/rules/no-raw-hex.test.mjs`
Expected: prints the pass line, exit 0. (RuleTester throws on failure.)

- [ ] **Step 3: Write the three shareable flat configs**

`tools/eslint-config/package.json`:

```json
{
  "name": "@pink-paprikaa-web/eslint-config",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./base": "./base.js",
    "./react": "./react.js",
    "./next": "./next.js"
  }
}
```

`tools/eslint-config/base.js`:

```js
import nx from "@nx/eslint-plugin";
import perfectionist from "eslint-plugin-perfectionist";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["**/dist", "**/out", "**/.next", "**/storybook-static", "**/node_modules"] },
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    plugins: { "@nx": nx, perfectionist },
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: "type:app",
              onlyDependOnLibsWithTags: ["type:ui", "type:content", "type:util", "type:tokens"],
            },
            {
              sourceTag: "type:ui",
              onlyDependOnLibsWithTags: ["type:ui", "type:util", "type:tokens"],
            },
            { sourceTag: "type:content", onlyDependOnLibsWithTags: ["type:util"] },
            { sourceTag: "type:util", onlyDependOnLibsWithTags: ["type:util"] },
            { sourceTag: "type:tokens", onlyDependOnLibsWithTags: [] },
            { sourceTag: "scope:web", onlyDependOnLibsWithTags: ["scope:web", "scope:shared"] },
            { sourceTag: "scope:blog", onlyDependOnLibsWithTags: ["scope:blog", "scope:shared"] },
            { sourceTag: "scope:shared", onlyDependOnLibsWithTags: ["scope:shared"] },
          ],
        },
      ],
      "perfectionist/sort-imports": "error",
      "perfectionist/sort-named-imports": "error",
    },
  },
  // Disable type-aware linting for plain JS config files.
  {
    files: ["**/*.js", "**/*.mjs"],
    ...tseslint.configs.disableTypeChecked,
  },
  prettier
);
```

(Note: `type:e2e` sources are intentionally absent from `depConstraints` — an e2e project may
depend on its app; no constraint entry means unconstrained, which matches spec §5's table.)

`tools/eslint-config/react.js`:

```js
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import base from "./base.js";
import noRawHex from "./rules/no-raw-hex.js";

const layerOrder = ["atoms", "molecules", "organisms", "templates"];

/** no-restricted-imports zones: a layer may not import from any layer above it (spec §7 rule 2). */
const atomicLayering = layerOrder.slice(0, -1).map((layer, i) => ({
  files: [`**/packages/ui/src/${layer}/**/*`],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: layerOrder.slice(i + 1).map((upper) => ({
          group: [`**/${upper}/**`, `**/${upper}`],
          message: `Atomic layering: ${layer} cannot import from ${upper} (layers only go upward).`,
        })),
      },
    ],
  },
}));

export default [
  ...base,
  {
    files: ["**/*.tsx", "**/*.jsx"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      "pink-paprikaa": { rules: { "no-raw-hex": noRawHex } },
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs["recommended-latest"].rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "pink-paprikaa/no-raw-hex": "error",
    },
  },
  {
    files: ["**/*.ts"],
    plugins: { "pink-paprikaa": { rules: { "no-raw-hex": noRawHex } } },
    rules: { "pink-paprikaa/no-raw-hex": "error" },
  },
  ...atomicLayering,
];
```

`tools/eslint-config/next.js`:

```js
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
];
```

If a plugin's flat-config export name differs in the installed major (e.g.
`reactHooks.configs["recommended-latest"]` vs `.recommended`), check
`node_modules/<plugin>/README.md` and use the documented flat-config entry — do not downgrade the
plugin. `eslint-plugin-tailwindcss` is added in Task 8 with the apps (it needs a Tailwind v4 CSS
entry point to resolve classes against; there isn't one until the apps exist).

- [ ] **Step 4: Root config + verify lint runs**

`eslint.config.mjs` (workspace root):

```js
import base from "@pink-paprikaa-web/eslint-config/base";

export default [...base];
```

Run: `pnpm install` (link the new package), then `pnpm nx run-many -t lint` and
`pnpm nx show projects --with-target lint`.
Expected: lint target exists for projects with lintable files and passes. Then the exit gate.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(tools): ESLint 10 flat config with no-raw-hex and atomic layering rules"
```

---

### Task 3: Root scripts, husky hooks, commitlint, Commitizen

**Files:**

- Modify: root `package.json` (`scripts`)
- Create: `commitlint.config.mjs`
- Create: `.husky/pre-commit`, `.husky/commit-msg`, `.husky/pre-push`
- Create: `.lintstagedrc.json`

**Interfaces:**

- Consumes: ESLint from Task 2 (lint-staged runs `eslint --fix`).
- Produces: `pnpm verify`, `pnpm verify:all`, `pnpm commit`, `pnpm format`, `pnpm format:check` —
  every later task and CI calls `verify`. Commit scopes enforced:
  `web|blog|ui|tokens|content|seo|utils|tools|ci|deps`.

- [ ] **Step 1: Install**

```bash
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional \
  commitizen @commitlint/cz-commitlint
```

- [ ] **Step 2: Root scripts (spec §7 table, verbatim)**

Edit root `package.json` `scripts` to exactly:

```json
{
  "verify": "nx affected -t typecheck lint test build",
  "verify:all": "nx run-many -t typecheck lint test build",
  "commit": "cz",
  "format": "nx format:write",
  "format:check": "nx format:check",
  "prepare": "husky"
}
```

Add the Commitizen wiring to root `package.json` (config block, not a dependency version):

```json
"config": { "commitizen": { "path": "@commitlint/cz-commitlint" } }
```

- [ ] **Step 3: commitlint config**

`commitlint.config.mjs`:

```js
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      ["web", "blog", "ui", "tokens", "content", "seo", "utils", "tools", "ci", "deps"],
    ],
  },
};
```

(Spec §4 names `commitlint.config.ts`; use `.mjs` so commitlint loads it without a TS loader —
record this as a deliberate deviation in the task report.)

- [ ] **Step 4: Hooks and lint-staged**

Run `pnpm exec husky init` (creates `.husky/` and the `prepare` script — verify it didn't
overwrite Step 2's scripts; restore if so). Then write:

`.husky/pre-commit`:

```bash
pnpm exec lint-staged
```

`.husky/commit-msg`:

```bash
pnpm exec commitlint --edit "$1"
```

`.husky/pre-push`:

```bash
pnpm verify
```

`.lintstagedrc.json`:

```json
{
  "*.{ts,tsx,js,jsx,mjs}": ["eslint --fix --no-warn-ignored", "prettier --write"],
  "*.{json,md,css,yaml,yml}": ["prettier --write"]
}
```

- [ ] **Step 5: Verify each hook fires**

1. `echo 'const x = "#FFAA00"' > /tmp/pp-hex-check.ts` — do NOT commit this; instead stage a real
   file with a deliberate double-space and verify `git commit` reformats it (pre-commit works).
2. `git commit -m "bad message"` on a staged change → must be rejected by commit-msg.
3. `git commit -m "chore(tools): wrong-scope-check"` with scope `bogus` → rejected;
   with a valid scope → accepted.
4. `pnpm verify` runs and passes (affected may be empty — fine).
   Use a scratch commit and `git commit --amend`/reset so the final history stays clean.

- [ ] **Step 6: Exit gate + commit**

```bash
git add -A
git commit -m "feat: add verify/commit/format scripts, husky hooks, commitlint and Commitizen"
```

(All commits from here on pass through the hooks.)

---

### Task 4: `packages/design-tokens` — DTCG tokens → Style Dictionary pipeline

**Files:**

- Create: `packages/design-tokens/package.json`
- Create: `packages/design-tokens/tokens/color.primitive.json`
- Create: `packages/design-tokens/tokens/color.semantic.json`
- Create: `packages/design-tokens/tokens/button.component.json`
- Create: `packages/design-tokens/sd.config.mjs`
- Create: `packages/design-tokens/README.md`

**Interfaces:**

- Produces: build outputs `dist/theme.css` (Tailwind v4 `@theme` block), `dist/tokens.ts`,
  `dist/tokens.json`. Package exports: `"./theme.css" → "./dist/theme.css"`,
  `"./tokens.json" → "./dist/tokens.json"`. CSS custom properties follow Tailwind v4 namespaces:
  `--color-brand-primary`, `--color-brand-primary-hover`, `--color-surface`, `--color-ink`.
  Tasks 6–9 rely on the utility classes those generate (`bg-brand-primary`,
  `hover:bg-brand-primary-hover`, `text-surface`, `text-ink`).
- Consumes: nothing (tokens depend on nothing — spec §5).

- [ ] **Step 1: Install and scaffold**

```bash
pnpm add -D style-dictionary
```

`packages/design-tokens/package.json`:

```json
{
  "name": "@pink-paprikaa-web/design-tokens",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "style-dictionary build --config sd.config.mjs"
  },
  "exports": {
    "./theme.css": "./dist/theme.css",
    "./tokens.json": "./dist/tokens.json"
  },
  "nx": {
    "targets": {
      "build": {
        "inputs": ["{projectRoot}/tokens/**/*", "{projectRoot}/sd.config.mjs"],
        "outputs": ["{projectRoot}/dist"],
        "cache": true
      }
    }
  }
}
```

- [ ] **Step 2: Author the three token tiers (DTCG format, spec §8)**

`tokens/color.primitive.json` — **the only place the brand hex may exist**:

```json
{
  "color": {
    "pink": {
      "500": { "$type": "color", "$value": "#EE2C68" },
      "600": { "$type": "color", "$value": "#D01F56" }
    },
    "neutral": {
      "0": { "$type": "color", "$value": "#FFFFFF" },
      "900": { "$type": "color", "$value": "#1A1A1A" }
    }
  }
}
```

`tokens/color.semantic.json`:

```json
{
  "color": {
    "brand": {
      "primary": { "$type": "color", "$value": "{color.pink.500}" },
      "primary-hover": { "$type": "color", "$value": "{color.pink.600}" }
    },
    "surface": { "$type": "color", "$value": "{color.neutral.0}" },
    "ink": { "$type": "color", "$value": "{color.neutral.900}" }
  }
}
```

`tokens/button.component.json`:

```json
{
  "button": {
    "bg": { "default": { "$type": "color", "$value": "{color.brand.primary}" } },
    "fg": { "default": { "$type": "color", "$value": "{color.surface}" } }
  }
}
```

- [ ] **Step 3: Style Dictionary config with a Tailwind `@theme` format**

`sd.config.mjs`:

```js
import StyleDictionary from "style-dictionary";

const kebab = (path) => path.map((p) => p.replace(/\./g, "-")).join("-");

StyleDictionary.registerFormat({
  name: "css/tailwind-theme",
  format: ({ dictionary }) => {
    const lines = dictionary.allTokens.map((t) => `  --${kebab(t.path)}: ${t.$value ?? t.value};`);
    return `/* Generated by Style Dictionary — do not edit. Source: tokens/*.json */\n@theme {\n${lines.join("\n")}\n}\n`;
  },
});

StyleDictionary.registerFormat({
  name: "typescript/tokens-const",
  format: ({ dictionary }) => {
    const entries = dictionary.allTokens
      .map((t) => `  "${kebab(t.path)}": "${t.$value ?? t.value}",`)
      .join("\n");
    return `/* Generated by Style Dictionary — do not edit. */\nexport const tokens = {\n${entries}\n} as const;\n\nexport type TokenName = keyof typeof tokens;\n`;
  },
});

export default {
  source: ["tokens/**/*.json"],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "dist/",
      files: [{ destination: "theme.css", format: "css/tailwind-theme" }],
    },
    ts: {
      transformGroup: "js",
      buildPath: "dist/",
      files: [{ destination: "tokens.ts", format: "typescript/tokens-const" }],
    },
    json: {
      transformGroup: "js",
      buildPath: "dist/",
      files: [{ destination: "tokens.json", format: "json/flat" }],
    },
  },
};
```

If Style Dictionary 5's API differs (format signature, `json/flat` name), consult
`node_modules/style-dictionary/README.md` / docs and adapt — outputs and filenames are the
contract, the API calls are not.

- [ ] **Step 4: Build and verify the three outputs**

Run: `pnpm install && pnpm nx build design-tokens` (project name may be
`@pink-paprikaa-web/design-tokens` — check `pnpm nx show projects`).

Expected: `dist/theme.css` contains `@theme` with `--color-brand-primary: #EE2C68;`,
`dist/tokens.ts` compiles, `dist/tokens.json` parses. Run it twice — the second run must be an Nx
cache hit (`[existing outputs match the cache]`). `git status` must show `dist/` untracked → add
`packages/design-tokens/dist` to `.gitignore` if the root ignore doesn't already cover `dist`.

- [ ] **Step 5: Exit gate + commit**

```bash
git add -A
git commit -m "feat(tokens): DTCG token source with Style Dictionary theme.css/tokens.ts pipeline"
```

---

### Task 5: `packages/utils`, `packages/content`, `packages/seo` — empty-but-wired libraries with Vitest

**Files:**

- Create (via generator): `packages/utils`, `packages/content`, `packages/seo` — each with
  `src/index.ts` + generated stub + generated test, `vite.config.ts` (or `vitest.config.ts`),
  `tsconfig*.json`, `package.json`

**Interfaces:**

- Consumes: `@pink-paprikaa-web/typescript-config/base.json` (Task 1) if the generated tsconfig
  is replaced; generated tsconfigs extending the root base are also acceptable — do not fight
  the generator, just ensure the §6 strict flags are in force either way.
- Produces: three registered Nx projects with working `typecheck`, `lint`, `test` targets and
  importPaths `@pink-paprikaa-web/utils` / `content` / `seo`. **Empty-but-wired (Global
  Constraint 15):** the generator's stub export and stub test are kept as-is — no schemas, no
  helpers, no builders. Real implementations arrive in Phase 2.

- [ ] **Step 1: Generate the three libraries**

```bash
pnpm nx add @nx/vite
pnpm nx g @nx/js:library packages/utils --bundler=none --unitTestRunner=vitest --linter=eslint
pnpm nx g @nx/js:library packages/content --bundler=none --unitTestRunner=vitest --linter=eslint
pnpm nx g @nx/js:library packages/seo --bundler=none --unitTestRunner=vitest --linter=eslint
```

Check `--help` first (Global Constraint 12): the goals are importPath
`@pink-paprikaa-web/<name>`, vitest, eslint, no project.json. If the generator writes a
`project.json`, re-run with the flag that avoids it or delete it and move any non-inferrable
config into the `nx` field of the package's `package.json`. Verify each generated
`eslint.config.mjs` imports the root config (or replace its content with
`import base from "@pink-paprikaa-web/eslint-config/base"; export default [...base];`).

After generation: per spec §18 review every generated file; run `pnpm nx sync` to fix TS project
references. **Keep the generator's stub source and stub test in each package** — they are the
"empty-but-wired" placeholder (Global Constraint 15). Do not write schemas, helpers, builders,
or any product code; do not install zod or schema-dts (they arrive with real content in
Phase 2).

- [ ] **Step 2: Verify all three packages are wired**

Run: `pnpm nx run-many -t typecheck lint test -p utils content seo` (adjust to the registered
project names from `pnpm nx show projects`).
Expected: all targets green using the generated stub tests; `pnpm nx graph --print` (or
`show project`) lists all three projects.

- [ ] **Step 3: Exit gate + commit**

```bash
git add -A
git commit -m "feat(content): scaffold empty-but-wired utils, content and seo packages"
```

---

### Task 6: `packages/ui` — empty-but-wired React library with atomic layer scaffold

**Files:**

- Create (via generator): `packages/ui` React library with Vitest (generated stub component and
  stub test kept as-is)
- Create: `packages/ui/src/{atoms,molecules,organisms,templates}/.gitkeep`

**Interfaces:**

- Consumes: nothing yet (components arrive in Phase 1 with the designs).
- Produces: `@pink-paprikaa-web/ui` as a registered project with working
  `typecheck`/`lint`/`test` targets, the four atomic layer directories, and the generator's stub
  export. **No design-system components are authored** (Global Constraint 15) — the
  reference-component row in spec §15 is consciously deferred to Phase 1; Task 13 records that.

- [ ] **Step 1: Generate the React library**

```bash
pnpm nx add @nx/react
pnpm nx g @nx/react:library packages/ui --bundler=none --unitTestRunner=vitest --linter=eslint --style=none
```

(Check `--help`; goals: importPath `@pink-paprikaa-web/ui`, vitest with jsdom, no project.json.)
Replace the generated eslint config content with:
`import react from "@pink-paprikaa-web/eslint-config/react"; export default [...react];`
**Keep the generator's stub component and stub test** — they are the empty-but-wired
placeholder. Create the four layer directories, each holding only a `.gitkeep`.

Run `pnpm nx test ui` → the generated stub test PASSES.

- [ ] **Step 2: Prove the atomic-layering lint rule bites**

Temporarily create `packages/ui/src/atoms/layering-probe.ts` containing
`import "../molecules/probe.js";` plus a stub `packages/ui/src/molecules/probe.ts`. Run
`pnpm nx lint ui` → must FAIL with the "Atomic layering" message from Task 2. Delete both files.
If it does not fail, fix the `react.js` zone globs until it does — this is the acceptance test
for spec §7 rule 2. (The deep-import variant was already proven in Task 2's fix round.)

- [ ] **Step 3: Exit gate + commit**

```bash
git add -A
git commit -m "feat(ui): scaffold empty-but-wired ui library with atomic layer directories"
```

---

### Task 7: Storybook 10 shell inside `packages/ui`

**Files:**

- Create (via generator): `packages/ui/.storybook/main.ts`, `.storybook/preview.ts`, and any
  story the generator emits for the existing stub component
- Create: `packages/ui/.storybook/styles.css`

**Interfaces:**

- Consumes: `@pink-paprikaa-web/design-tokens/theme.css` (Task 4).
- Produces: `storybook` (dev) and `build-storybook` targets on the `ui` project. **No
  hand-authored stories** (Global Constraint 15) — if the generator offers story generation for
  the existing stub component, accept it (generator output is boilerplate); author nothing
  beyond that. Component stories arrive in Phase 1.

- [ ] **Step 1: Generate the Storybook configuration**

```bash
pnpm nx add @nx/storybook
pnpm nx g @nx/storybook:configuration ui --uiFramework=@storybook/react-vite
pnpm --filter @pink-paprikaa-web/ui add -D @storybook/addon-a11y @tailwindcss/vite tailwindcss
```

(Check `--help` and the prompts; pick react-vite, no interaction tests; accept generated stories
for the stub component if offered — `build-storybook` needs at least one story to be a
meaningful proof. Verify no `project.json` appears — Storybook targets are inferred by
`@nx/storybook`'s plugin from `.storybook/main.ts`.)

- [ ] **Step 2: Wire Tailwind v4 + tokens into the preview**

`packages/ui/.storybook/styles.css`:

```css
@import "tailwindcss";
@import "@pink-paprikaa-web/design-tokens/theme.css";
```

In `.storybook/preview.ts`, first line: `import "./styles.css";` and register `addon-a11y` in
`main.ts` `addons`. Add the Tailwind v4 vite plugin in `main.ts` `viteFinal` (or the generated
vite config):

```ts
import tailwindcss from "@tailwindcss/vite";
// in viteFinal: config.plugins = [...(config.plugins ?? []), tailwindcss()];
```

Ensure `design-tokens` builds before Storybook: add
`pnpm --filter @pink-paprikaa-web/ui add @pink-paprikaa-web/design-tokens@workspace:*` and check
`pnpm nx show project ui` lists the dependency, so `build-storybook` triggers the token build
via `dependsOn` defaults (`^build`).

- [ ] **Step 3: Verify the build target**

Run: `pnpm nx run ui:build-storybook`
Expected: static output builds; the emitted CSS contains `--color-brand-primary` (grep the
output dir) proving the token pipeline reached Storybook. Then run the exit gate. (Do not leave
a dev server running.)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(ui): Storybook 10 shell with a11y addon wired to the token pipeline"
```

---

### Task 8: `apps/web` + `apps/web-e2e` — empty-but-wired static-export app

**Files:**

- Create (via generator): `apps/web` (Next.js 16, App Router), `apps/web-e2e` (Playwright)
- Modify: `apps/web/next.config.*` (static export), `apps/web/src/app/global.css`,
  `layout.tsx`, `page.tsx` (stripped to a minimal placeholder)
- Create: `apps/web/public/_redirects`
- Modify: `apps/web-e2e/src/*.spec.ts`

**Interfaces:**

- Consumes: `theme.css` from `@pink-paprikaa-web/design-tokens` — the one workspace dependency,
  proving cross-package wiring and that the token pipeline reaches an app build. **No ui/content/
  seo imports** (those packages are empty stubs; wiring them into pages is Phase 1–2 work).
- Produces: `pnpm nx build web` → static export in `apps/web/out/` containing `index.html` and
  `_redirects`. Task 12's CI, Lighthouse and founder-gate consume `apps/web/out/`.

- [ ] **Step 1: Generate the app**

```bash
pnpm nx add @nx/next
pnpm nx g @nx/next:application apps/web --e2eTestRunner=playwright --appDir=true --style=tailwind --linter=eslint --unitTestRunner=none
```

(Check `--help`. If the generator asks about src directory / server actions, choose the plainest
option. It should also generate `apps/web-e2e` with `@nx/playwright`.) Then, per spec §18,
correct the generated output:

- `next.config` must set `output: "export"` and `images: { unoptimized: true }` (spec §10).
- If the generator scaffolded Tailwind v3 (a `tailwind.config.js` + `postcss.config.js` with
  `tailwindcss` v3), migrate to v4: `pnpm --filter web add tailwindcss @tailwindcss/postcss`,
  postcss config plugins `{ "@tailwindcss/postcss": {} }`, delete `tailwind.config.js`, and
  `global.css` becomes:

  ```css
  @import "tailwindcss";
  @import "@pink-paprikaa-web/design-tokens/theme.css";
  ```

- Replace generated eslint config content with
  `import next from "@pink-paprikaa-web/eslint-config/next"; export default [...next];`
- Now add `eslint-plugin-tailwindcss` (deferred from Task 2):
  `pnpm add -D -w eslint-plugin-tailwindcss`, and in `tools/eslint-config/react.js` register it
  with its flat config and the settings the plugin documents for Tailwind v4. If the installed
  plugin version does not support Tailwind v4, add it with the rules it can run and record the
  limitation in the task report — do not pin an older Tailwind.
- Add the one workspace dep:
  `pnpm --filter web add @pink-paprikaa-web/design-tokens@workspace:*`

- [ ] **Step 2: Strip to a minimal placeholder (no product content, no founder names)**

Replace the generator's welcome page with the smallest honest placeholder. `layout.tsx`: title
`Pink Paprikaa` (two `a`s — hard rule), import `./global.css`, no other metadata. `page.tsx`:

```tsx
export default function Home() {
  return (
    <main>
      <h1>Pink Paprikaa</h1>
      <p>New site under construction.</p>
    </main>
  );
}
```

No token utility classes, no components, no copy beyond this — visual design is Phase 1,
content is Phase 2. Delete unused generator assets (welcome component etc.).

`apps/web/public/_redirects` (spec §4, unchanged Petpooja redirects — this is deploy config,
in scope):

```
https://order.pinkpaprikaa.com/*   https://pinkpaprikaa.petpooja.site/:splat   301!
https://pickup.pinkpaprikaa.com/*  https://pinkpaprikaa.petpooja.com/menu/:splat  301!
```

- [ ] **Step 3: Build and verify the export**

Run: `pnpm nx build web`
Expected: `apps/web/out/index.html` exists, contains `Pink Paprikaa` (grep it), and
`apps/web/out/_redirects` exists. Also assert the built CSS resolves the token: grep
`out/_next/static/**/*.css` (or the emitted CSS files) for `--color-brand-primary`.

- [ ] **Step 4: Playwright e2e against the real static export**

```bash
pnpm --filter web-e2e add -D @axe-core/playwright
pnpm add -D -w serve
pnpm exec playwright install chromium
```

In `apps/web-e2e/playwright.config.ts`, make the webServer serve the export (not `next dev`):

```ts
webServer: {
  command: "pnpm exec serve apps/web/out -l 4300",
  url: "http://localhost:4300",
  reuseExistingServer: !process.env.CI,
},
```

and ensure the e2e target depends on the app build (check `pnpm nx show project web-e2e`; if the
inferred e2e target lacks it, add `"nx": { "targets": { "e2e": { "dependsOn": ["web:build"] } } }`
to `apps/web-e2e/package.json`).

`apps/web-e2e/src/home.spec.ts` (setup verification only — page serves, a11y wiring works,
founder gate holds):

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("the exported home page serves and renders the brand heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Pink Paprikaa" })).toBeVisible();
});

test("home has no critical or serious axe violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious"
  );
  expect(blocking).toEqual([]);
});

test("no founder names in the served HTML", async ({ page }) => {
  const response = await page.goto("/");
  const body = (await response?.text()) ?? "";
  expect(body).not.toMatch(/rishav|pandey|anand/i);
});
```

Run: `pnpm nx e2e web-e2e` → PASS.

- [ ] **Step 5: Exit gate + commit**

```bash
git add -A
git commit -m "feat(web): scaffold empty-but-wired static-export web app with e2e"
```

---

### Task 9: `apps/blog` + `apps/blog-e2e` — empty-but-wired blog app

**Files:**

- Create (via generator): `apps/blog`, `apps/blog-e2e`
- Modify: `apps/blog/next.config.*` (`basePath: "/blog"`, static export)
- Create: `apps/blog/content-collections.ts`
- Create: `apps/blog/content/posts/placeholder.mdx` (fixture proving the MDX pipeline; not
  brand content)
- Modify: blog `page.tsx` minimally to read the collection; e2e spec

**Interfaces:**

- Consumes: `theme.css` from design-tokens (same single workspace dep as Task 8).
- Produces: `pnpm nx build blog` → static export under `apps/blog/out/` with all URLs prefixed
  `/blog`, and a wired Content Collections pipeline. Task 12's founder-gate scans this output.
  Real posts and templates are Phase 5.

- [ ] **Step 1: Generate, then configure basePath + export**

```bash
pnpm nx g @nx/next:application apps/blog --e2eTestRunner=playwright --appDir=true --style=tailwind --linter=eslint --unitTestRunner=none
```

Apply the same §18 corrections as Task 8 (export, images.unoptimized, Tailwind v4, eslint config
from `@pink-paprikaa-web/eslint-config/next`, design-tokens workspace dep), **plus**
`basePath: "/blog"` in the next config. Strip the welcome page to the same minimal shape as
Task 8 (heading `Pink Paprikaa Blog`, nothing else authored).

- [ ] **Step 2: Content Collections wiring (spec §9) with one placeholder fixture**

```bash
pnpm --filter blog add -D @content-collections/core @content-collections/next @content-collections/mdx
```

`apps/blog/content-collections.ts`:

```ts
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";

const posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    date: z.string(),
  }),
  transform: async (doc, ctx) => ({
    ...doc,
    slug: doc._meta.path,
    body: await compileMDX(ctx, doc),
  }),
});

export default defineConfig({ collections: [posts] });
```

Wrap the next config with `withContentCollections` per `@content-collections/next` docs.

`apps/blog/content/posts/placeholder.mdx` — a fixture, clearly not content:

```mdx
---
title: "Placeholder"
description: "Scaffolding fixture proving the MDX pipeline builds. Replaced in Phase 5."
date: "2026-08-07"
---

Scaffolding fixture. Real posts arrive in Phase 5.
```

Wire the collection into the build minimally: blog `page.tsx` maps `allPosts` to a `<ul>` of
titles — the least code that makes the build consume the collection (an unconsumed collection
proves nothing). No detail pages, no templates — Phase 5.

- [ ] **Step 3: Build + verify basePath**

Run: `pnpm nx build blog`
Expected: export exists; grep the HTML for `/blog/_next/` asset prefixes proving basePath; the
placeholder title appears in the exported HTML (collection consumed); zero founder names.

- [ ] **Step 4: e2e — serve the export mounted at `/blog`**

`apps/blog-e2e/playwright.config.ts` webServer (basePath means assets expect to live under
`/blog`):

```ts
// A scratch dir with the export mounted at /blog, so URLs match production:
command:
  "rm -rf apps/blog-e2e/.serve && mkdir -p apps/blog-e2e/.serve && cp -R apps/blog/out apps/blog-e2e/.serve/blog && pnpm exec serve apps/blog-e2e/.serve -l 4301",
url: "http://localhost:4301/blog",
```

Spec: `/blog` serves and lists the placeholder title; no critical/serious axe violations; no
founder names in HTML. (Same shape as Task 8's spec file.) Add the
`dependsOn: ["blog:build"]` wiring as in Task 8, and gitignore `apps/blog-e2e/.serve`.

Run: `pnpm nx e2e blog-e2e` → PASS.

- [ ] **Step 5: Exit gate + commit**

```bash
git add -A
git commit -m "feat(blog): scaffold empty-but-wired blog app with Content Collections and basePath /blog"
```

---

### Task 10: Nx tags + module-boundary enforcement proven

**Files:**

- Modify: `package.json` of every project — add `"nx": { "tags": [...] }` per spec §5:
  - `apps/web` → `["type:app", "scope:web"]`; `apps/web-e2e` → `["type:e2e", "scope:web"]`
  - `apps/blog` → `["type:app", "scope:blog"]`; `apps/blog-e2e` → `["type:e2e", "scope:blog"]`
  - `packages/ui` → `["type:ui", "scope:shared"]`
  - `packages/design-tokens` → `["type:tokens", "scope:shared"]`
  - `packages/content` → `["type:content", "scope:shared"]`
  - `packages/seo` → `["type:util", "scope:shared"]`; `packages/utils` → `["type:util", "scope:shared"]`
  - `tools/*` (typescript-config, eslint-config, image-pipeline if it exists yet) →
    `["type:tool", "scope:shared"]`

**Interfaces:**

- Consumes: the `depConstraints` written in Task 2.
- Produces: enforced boundaries; later phases rely on violations being lint errors.

- [ ] **Step 1: Add tags, verify they're seen**

Add the `nx.tags` field to each package.json. Run `pnpm nx show project web --json` and confirm
`tags`. Run `pnpm nx run-many -t lint` → all pass. (With Phase 0's empty-but-wired packages the
only cross-project edges are `web`/`blog` → `design-tokens` and `ui` → `design-tokens`; all are
legal under §5's table — `type:app` → `type:tokens`, `type:ui` → `type:tokens`, scopes →
`scope:shared`. The table from Task 2 applies verbatim; the `seo → content` question only
arises in Phase 2 when seo gains real builders.)

- [ ] **Step 2: Prove the boundary bites both ways**

Temporarily add `import "@pink-paprikaa-web/ui"` to `apps/web`… no — that's legal. The two
canonical violations (spec §5): (a) in `packages/ui/src/index.ts` add
`import "@pink-paprikaa-web/content";`? Also legal? **No** — `type:ui` may depend on
`type:ui|util|tokens`, and `content` is `type:content` → violation. (b) in `apps/web` add
`import "@pink-paprikaa-web/blog"`-equivalent — apps aren't importable packages, so instead
verify scope: in `packages/ui` import from `apps/web` source — not resolvable via scope; use
violation (a) plus: (c) in `packages/design-tokens` — no source imports exist; skip. Run
`pnpm nx lint ui` with (a) in place → must FAIL with `enforce-module-boundaries`. Remove the
probe. If it passes, the boundary isn't wired — fix before proceeding (likely cause: eslint
config for the package not using the shared base, or tags not read from package.json `nx` field).

- [ ] **Step 3: Exit gate + commit**

```bash
git add -A
git commit -m "feat: apply Nx project tags and prove module-boundary enforcement"
```

---

### Task 11: `tools/image-pipeline` — sharp AVIF/WebP ladder + LQIP + manifest

**Files:**

- Create (via generator): `tools/image-pipeline` (`@nx/js` library, vitest, node preset)
- Create: `tools/image-pipeline/src/pipeline.ts`, `src/pipeline.test.ts`, `src/cli.ts`
- Create: `assets-src/README.md`

**Interfaces:**

- Consumes: nothing from other packages (framework-agnostic tool).
- Produces: `@pink-paprikaa-web/image-pipeline` exporting:

  ```ts
  type ImageManifestEntry = {
    source: string; // path relative to assets-src/
    width: number; // intrinsic width of the original
    height: number;
    lqip: string; // base64 data URI
    variants: { format: "avif" | "webp" | "jpeg"; width: number; file: string }[];
  };
  async function processImages(srcDir: string, outDir: string): Promise<ImageManifestEntry[]>;
  ```

  CLI: `node tools/image-pipeline/dist/cli.js <srcDir> <outDir>` — but in Phase 0 only the
  library API + tests must work; app integration is Phase 3.

- [ ] **Step 1: Generate + install sharp**

```bash
pnpm nx g @nx/js:library tools/image-pipeline --bundler=tsc --unitTestRunner=vitest --linter=eslint
pnpm --filter @pink-paprikaa-web/image-pipeline add sharp
```

Watch for the pnpm build-script warning → add `sharp` to `onlyBuiltDependencies`
(Global Constraint 11), re-run `pnpm install`, and verify
`node -e "require('sharp')"`-equivalent works via the test below. Point the package tsconfig at
the `node` preset from Task 1 if the generated one doesn't already target node.

- [ ] **Step 2: Failing test — generate a test image with sharp itself**

`tools/image-pipeline/src/pipeline.test.ts`:

```ts
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { processImages } from "./pipeline.js";

let src: string;
let out: string;

beforeAll(async () => {
  src = await mkdtemp(join(tmpdir(), "pp-img-src-"));
  out = await mkdtemp(join(tmpdir(), "pp-img-out-"));
  await sharp({
    create: { width: 1600, height: 900, channels: 3, background: { r: 238, g: 44, b: 104 } },
  })
    .jpeg()
    .toFile(join(src, "hero.jpg"));
});

afterAll(async () => {
  await rm(src, { recursive: true, force: true });
  await rm(out, { recursive: true, force: true });
});

describe("processImages", () => {
  it("emits an AVIF+WebP+fallback ladder with LQIP and content-hashed names", async () => {
    const manifest = await processImages(src, out);
    expect(manifest).toHaveLength(1);
    const entry = manifest[0]!;
    expect(entry.width).toBe(1600);
    expect(entry.lqip).toMatch(/^data:image\/webp;base64,/);
    const formats = new Set(entry.variants.map((v) => v.format));
    expect(formats).toEqual(new Set(["avif", "webp", "jpeg"]));
    // ladder never upscales: widths ≤ 1600
    expect(Math.max(...entry.variants.map((v) => v.width))).toBeLessThanOrEqual(1600);
    // content-hashed filenames
    for (const v of entry.variants) {
      expect(v.file).toMatch(/-[0-9a-f]{8}\.(avif|webp|jpe?g)$/);
    }
    const written = await readdir(out);
    expect(written).toContain("manifest.json");
  }, 60000);
});
```

Run `pnpm nx test image-pipeline` → FAIL.

- [ ] **Step 3: Implement**

`tools/image-pipeline/src/pipeline.ts` — the fixed ladder is `[640, 960, 1280, 1920]` filtered
to widths ≤ the original; formats AVIF + WebP + JPEG fallback; LQIP is a 16px-wide WebP inlined
base64; hash is the first 8 hex chars of a sha256 of the variant bytes; writes
`<outDir>/manifest.json` and returns the manifest.

```ts
import { createHash } from "node:crypto";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import sharp from "sharp";

export type ImageManifestEntry = {
  source: string;
  width: number;
  height: number;
  lqip: string;
  variants: { format: "avif" | "webp" | "jpeg"; width: number; file: string }[];
};

const LADDER = [640, 960, 1280, 1920];
const INPUT_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export async function processImages(srcDir: string, outDir: string): Promise<ImageManifestEntry[]> {
  await mkdir(outDir, { recursive: true });
  const files = (await readdir(srcDir)).filter((f) => INPUT_EXT.has(extname(f).toLowerCase()));
  const manifest: ImageManifestEntry[] = [];

  for (const file of files) {
    const image = sharp(join(srcDir, file));
    const meta = await image.metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    const base = file.replace(extname(file), "");

    const lqipBuffer = await image.clone().resize(16).webp({ quality: 40 }).toBuffer();
    const lqip = `data:image/webp;base64,${lqipBuffer.toString("base64")}`;

    const widths = LADDER.filter((w) => w <= width);
    const variants: ImageManifestEntry["variants"] = [];
    for (const w of widths.length > 0 ? widths : [width]) {
      for (const format of ["avif", "webp", "jpeg"] as const) {
        const buffer = await image.clone().resize(w).toFormat(format).toBuffer();
        const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 8);
        const ext = format === "jpeg" ? "jpg" : format;
        const out = `${base}-${w}w-${hash}.${ext}`;
        await writeFile(join(outDir, out), buffer);
        variants.push({ format, width: w, file: out });
      }
    }
    manifest.push({ source: file, width, height, lqip, variants });
  }

  await writeFile(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  return manifest;
}
```

`src/cli.ts`:

```ts
import { processImages } from "./pipeline.js";

const [srcDir, outDir] = process.argv.slice(2);
if (!srcDir || !outDir) {
  console.error("Usage: image-pipeline <srcDir> <outDir>");
  process.exit(1);
}
const manifest = await processImages(srcDir, outDir);
console.log(`image-pipeline: ${String(manifest.length)} source image(s) processed → ${outDir}`);
```

Run `pnpm nx test image-pipeline` → PASS.

- [ ] **Step 4: `assets-src/` exists and is documented**

`assets-src/README.md`: originals live here, never deployed (spec §4); Phase 3 migrates the 25
PNGs from the old repo. Add a `.gitkeep` if needed. Confirm `assets-src` is NOT inside any app's
`public/`.

- [ ] **Step 5: Exit gate + commit**

```bash
git add -A
git commit -m "feat(tools): sharp image pipeline with AVIF/WebP ladder, LQIP and manifest"
```

---

### Task 12: CI jobs (e2e, Lighthouse, deploy skeleton) + founder-name and content gates

**Files:**

- Modify: `.github/workflows/ci.yml`
- Create: `scripts/check-founder-names.mjs`
- Create: `.lighthouserc.json`
- Modify: root `package.json` (add `guard:founder` script)

**Interfaces:**

- Consumes: `apps/web/out`, `apps/blog/out` (Tasks 8–9); `pnpm verify` (Task 3).
- Produces: CI gates per spec §12/§14. The content-integrity gate is **fully deferred to
  Phase 2** (packages are empty-but-wired; there are no schemas or content to validate yet) —
  Task 13 records this in §15.

- [ ] **Step 1: Founder-name guard (spec §12 — greps built output)**

`scripts/check-founder-names.mjs`:

```js
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const BANNED = /rishav|pandey|anand/i;
const TEXT_EXT = /\.(html|js|css|json|txt|xml|webmanifest|mjs)$/;
const targets = process.argv.slice(2);

if (targets.length === 0) {
  console.error("Usage: check-founder-names.mjs <dir> [<dir>…]");
  process.exit(1);
}

let failures = 0;

async function scan(dir) {
  for (const name of await readdir(dir)) {
    const path = join(dir, name);
    if ((await stat(path)).isDirectory()) {
      await scan(path);
    } else if (TEXT_EXT.test(name)) {
      const content = await readFile(path, "utf8");
      const match = content.match(BANNED);
      if (match) {
        console.error(`FOUNDER-NAME GUARD: "${match[0]}" found in ${path}`);
        failures += 1;
      }
    }
  }
}

for (const dir of targets) {
  await scan(dir);
}

if (failures > 0) {
  console.error(`Founder-name guard failed: ${String(failures)} file(s). See product spec §3.3.`);
  process.exit(1);
}
console.log("Founder-name guard: clean.");
```

Root script: `"guard:founder": "node scripts/check-founder-names.mjs apps/web/out apps/blog/out"`.

Verify both directions: run after `pnpm nx run-many -t build` → clean. Then temporarily plant a
banned name in `apps/web/out/index.html` (the build output, not source) and re-run → exits 1.

- [ ] **Step 2: Lighthouse CI budgets (spec §12 table, verbatim)**

```bash
pnpm add -D @lhci/cli
```

`.lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "apps/web/out",
      "numberOfRuns": 1
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 1 }],
        "categories:seo": ["error", { "minScore": 1 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 200 }],
        "total-byte-weight": ["error", { "maxNumericValue": 1048576 }],
        "resource-summary:image:size": ["error", { "maxNumericValue": 614400 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

Run locally: `pnpm nx build web && pnpm exec lhci autorun` → must pass (the placeholder page is
tiny; if a budget fails, fix the page, not the budget). If local Chrome is unavailable, note it
in the report and rely on the CI job definition being correct.

- [ ] **Step 3: CI jobs**

Extend `.github/workflows/ci.yml` — keep the existing `verify` job; add after it:

```yaml
e2e:
  name: E2E
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v5
      with:
        filter: tree:0
        fetch-depth: 0
    - uses: pnpm/action-setup@v4
    - uses: actions/setup-node@v5
      with:
        node-version-file: .nvmrc
        cache: pnpm
    - run: pnpm install --frozen-lockfile
    - uses: nrwl/nx-set-shas@v4
    - run: pnpm exec playwright install --with-deps chromium
    - run: pnpm nx affected -t e2e

lighthouse:
  name: Lighthouse
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v5
      with:
        filter: tree:0
        fetch-depth: 0
    - uses: pnpm/action-setup@v4
    - uses: actions/setup-node@v5
      with:
        node-version-file: .nvmrc
        cache: pnpm
    - run: pnpm install --frozen-lockfile
    - run: pnpm nx build web
    - run: pnpm exec lhci autorun

guards:
  name: Content guards
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v5
      with:
        filter: tree:0
        fetch-depth: 0
    - uses: pnpm/action-setup@v4
    - uses: actions/setup-node@v5
      with:
        node-version-file: .nvmrc
        cache: pnpm
    - run: pnpm install --frozen-lockfile
    - run: pnpm nx run-many -t build
    - run: pnpm guard:founder

deploy:
  # Phase 6 cutover — becomes real when Netlify access exists (spec §16).
  # Gated off until the repository variable NETLIFY_DEPLOY_ENABLED is set to "true".
  name: Deploy
  if: github.ref == 'refs/heads/main' && vars.NETLIFY_DEPLOY_ENABLED == 'true'
  runs-on: ubuntu-latest
  needs: [verify, e2e, lighthouse, guards]
  steps:
    - run: echo "Netlify deploy lands at Phase 6 cutover (arch spec §14, §16)."
```

(Also remove the now-outdated trailing comment in ci.yml that says e2e/lighthouse "are added
alongside the apps".) There is no remote yet, so CI cannot be run — verify instead that every
command in the workflow runs green locally in the same order, and say so in the report.

- [ ] **Step 4: Exit gate + commit**

```bash
git add -A
git commit -m "ci: add e2e, lighthouse, founder-name guard and gated deploy skeleton"
```

---

### Task 13: Documentation closeout

**Files:**

- Modify: `docs/superpowers/specs/2026-08-07-boilerplate-architecture-design.md` (§15 table)
- Modify: `CLAUDE.md`
- Modify: `README.md`

**Interfaces:** none — documentation truth-up.

- [ ] **Step 1: §15 Phase 0 progress table**

Flip every completed item to `✅ done`, each with a one-line note naming the commit topic (as the
existing done rows do). Any item this plan consciously narrowed gets the honest note (e.g.
deploy job is a gated skeleton pending Phase 6 Netlify access; content-integrity gate =
build-time Zod parse, dedicated link/asset checker arrives with real content in Phase 2).

- [ ] **Step 2: CLAUDE.md truth-up**

Remove or rewrite the now-false statements added while the workspace was empty:

- "`nx affected` is a no-op right now" block → replace with the real project list summary.
- "Vitest is not installed yet" note → delete; the single-test example is now real.
- Hard-rule 8's "`pnpm commit` does not exist yet" caveat → now it exists; rule becomes "author
  with `pnpm commit`".
- The "Rules 3, 5 and 6 describe lint enforcement that is not wired yet" paragraph → delete
  (they are wired; say instead that the acceptance probes live in git history).
- "Current state" facts list: root scripts now real; keep the no-remote and `main`-only facts
  (still true).

- [ ] **Step 3: README status**

Update the status blockquote: Phase 0 complete (foundation built: apps, packages, tools, gates);
live site still served from the old repo until Phase 6.

- [ ] **Step 4: Exit gate + commit**

```bash
git add -A
git commit -m "docs: record Phase 0 completion in spec §15, CLAUDE.md and README"
```

---

## Self-Review

- **Spec coverage:** every ⬜ §15 row maps to a task: apps (8, 9), packages (4, 5, 6), tools
  (1, 2, 11), tags+boundaries (10), ESLint+rules (2), jsx-a11y override (2), hooks/commits (3),
  token pipeline (4), Storybook shell (7), Vitest/Playwright/axe/LHCI + CI jobs (5, 8, 12),
  founder gate (12), root scripts (3).
- **Known narrowings (deliberate, recorded in tasks and closed out in Task 13):** boilerplate
  only per the user's 2026-08-07 directive — the §15 "reference `Button`" item and all package
  implementations (schemas, helpers, JSON-LD builders) are deferred to Phases 1–2; the
  content-integrity gate defers with them; deploy job is a Phase 6-gated skeleton (Netlify
  access is a §16 external input); `commitlint.config.mjs` not `.ts`.
- **Type consistency:** CSS custom properties `--color-brand-primary`, `--color-brand-primary-hover`,
  `--color-surface`, `--color-ink` (4→7,8 grep checks); `processImages`/`ImageManifestEntry`
  (11 only); preset names `base/next/react-library/node` (1→5,6,8,11); single workspace dep
  `@pink-paprikaa-web/design-tokens` (4→7,8,9).
