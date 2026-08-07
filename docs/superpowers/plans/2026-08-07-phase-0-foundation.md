# Phase 0 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete every ⬜ todo item in §15 of
`docs/superpowers/specs/2026-08-07-boilerplate-architecture-design.md` so that
`pnpm install && pnpm verify` passes from a clean clone and every §12 gate exists.

**Architecture:** Nx 23 integrated monorepo (pnpm workspaces, inferred tasks only). Two
static-export Next.js 16 apps + Playwright e2e apps; five `packages/*` libraries; three `tools/*`
packages. Style Dictionary builds DTCG tokens into a Tailwind v4 `@theme` stylesheet. Everything is
wired empty-but-working: one reference component (`Button`) proves token → variant → story → test
end to end.

**Tech Stack:** Nx 23.1.1 · pnpm 10 · TypeScript 6.0.3 · Next.js 16 · React 19 · Tailwind v4 ·
tailwind-variants · Radix UI · Style Dictionary 5 · Vitest 4 · Playwright · Storybook 10 ·
ESLint 10 flat config · husky 9 + commitlint + Commitizen · sharp · Zod 4 · schema-dts.

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
15. **The Nx way, always (user directive 2026-08-07).** Set up every capability through Nx:
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

### Task 5: `packages/utils`, `packages/content`, `packages/seo` — wired libraries with Vitest

**Files:**

- Create (via generator): `packages/utils`, `packages/content`, `packages/seo` — each with
  `src/index.ts`, `vite.config.ts` (or `vitest.config.ts`), `tsconfig*.json`, `package.json`
- Create: `packages/utils/src/format-inr.ts` + `src/format-inr.test.ts`
- Create: `packages/content/src/schemas.ts` + `src/schemas.test.ts` + `src/data/site.json`
- Create: `packages/seo/src/restaurant.ts` + `src/restaurant.test.ts`

**Interfaces:**

- Consumes: `@pink-paprikaa-web/typescript-config/base.json` (Task 1) if the generated tsconfig
  is replaced; generated tsconfigs extending the root base are also acceptable — do not fight
  the generator, just ensure the §6 strict flags are in force either way.
- Produces:
  - `@pink-paprikaa-web/utils`: `formatInr(amount: number): string` — `formatInr(310)` → `"₹310"`.
  - `@pink-paprikaa-web/content`: Zod schemas `imageRefSchema`, `menuSchema`, `offerSchema`,
    `galleryItemSchema`, `siteSchema`; types `Menu`, `MenuItem`, `Offer`, `GalleryItem`, `Site`
    (inferred via `z.infer`); `site` (the parsed, typed content of `data/site.json`).
  - `@pink-paprikaa-web/seo`: `restaurantJsonLd(site: Site): WithContext<Restaurant>`.
  - Tasks 8 and 12 import these names exactly.

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
references; delete generated placeholder code (`libs-utils.ts` style stubs).

- [ ] **Step 2: utils — failing test, then implementation**

`packages/utils/src/format-inr.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatInr } from "./format-inr.js";

describe("formatInr", () => {
  it("formats a plain rupee amount with the ₹ sign and no decimals", () => {
    expect(formatInr(310)).toBe("₹310");
  });
  it("groups thousands in the Indian style", () => {
    expect(formatInr(150000)).toBe("₹1,50,000");
  });
});
```

Run `pnpm nx test utils` → FAIL (module not found). Then `packages/utils/src/format-inr.ts`:

```ts
const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** Product-spec copy rule: rupee amounts written plainly — "₹310", never "₹310/-". */
export function formatInr(amount: number): string {
  return `₹${inr.format(amount)}`;
}
```

Export from `src/index.ts`: `export { formatInr } from "./format-inr.js";`
Run `pnpm nx test utils` → PASS.

- [ ] **Step 3: content — schemas from the product spec §6 data model, verbatim shapes**

```bash
pnpm add zod
```

(`pnpm add` at the root then move the dependency: run the add **inside** `packages/content` —
`pnpm --filter @pink-paprikaa-web/content add zod` — so the dependency lands in the right
package.json.)

`packages/content/src/schemas.ts`:

```ts
import { z } from "zod";

export const imageRefSchema = z.object({
  src: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blurHash: z.string().optional(),
});

export const menuItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  price: z.number().positive().nullable(),
  variations: z.array(z.object({ label: z.string(), price: z.number().positive() })).optional(),
  tags: z.array(z.enum(["bestseller", "chef-special", "spicy"])),
  image: imageRefSchema.optional(),
  available: z.boolean(),
});

export const subCategorySchema = z.object({
  name: z.string().min(1),
  items: z.array(menuItemSchema),
});

export const categorySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  intro: z.string(),
  image: imageRefSchema,
  subCategories: z.array(subCategorySchema),
});

export const menuSchema = z.object({
  updatedAt: z.string().date(),
  priceNote: z.string(),
  categories: z.array(categorySchema),
});

export const offerSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  terms: z.string(),
  validFrom: z.string().date(),
  validTo: z.string().date(),
  channels: z.array(z.enum(["dine-in", "takeaway", "delivery"])),
  timeWindow: z.object({ from: z.string(), to: z.string() }).optional(),
  image: imageRefSchema.optional(),
  featured: z.boolean(),
});

export const galleryItemSchema = z.object({
  id: z.string().min(1),
  src: imageRefSchema,
  alt: z.string().min(1), // required — build fails if empty (product spec §6.3)
  category: z.enum(["food", "dine-in", "catering", "events", "kitchen", "moments"]),
});

export const siteSchema = z.object({
  brand: z.literal("Pink Paprikaa"),
  legalName: z.literal("Paprikaa Culinary Ventures Private Limited"),
  domain: z.string().url(),
  orderUrl: z.string().url(),
  email: z.string().email(),
  gstin: z.string().length(15),
  fssai: z.string().length(14),
  addressLocality: z.string().min(1),
  addressRegion: z.string().min(1),
});

export type ImageRef = z.infer<typeof imageRefSchema>;
export type MenuItem = z.infer<typeof menuItemSchema>;
export type Menu = z.infer<typeof menuSchema>;
export type Offer = z.infer<typeof offerSchema>;
export type GalleryItem = z.infer<typeof galleryItemSchema>;
export type Site = z.infer<typeof siteSchema>;
```

`packages/content/src/data/site.json` — single source of NAP truth (values from the product
spec §4.3; do NOT invent data not in the spec):

```json
{
  "brand": "Pink Paprikaa",
  "legalName": "Paprikaa Culinary Ventures Private Limited",
  "domain": "https://pinkpaprikaa.com",
  "orderUrl": "https://order.pinkpaprikaa.com",
  "email": "business@pinkpaprikaa.com",
  "gstin": "06AAPCP9130L1ZW",
  "fssai": "10825005001702",
  "addressLocality": "MKM Market, Sector 57, Gurgaon",
  "addressRegion": "Haryana"
}
```

`packages/content/src/index.ts`:

```ts
import rawSite from "./data/site.json";
import { siteSchema } from "./schemas.js";

export * from "./schemas.js";
/** Parsed at import time — a schema violation in site.json fails every consumer's build. */
export const site = siteSchema.parse(rawSite);
```

(`resolveJsonModule: true` may be needed in the package tsconfig — add it there, not to the
root base.)

`packages/content/src/schemas.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { site } from "./index.js";
import { galleryItemSchema, menuItemSchema } from "./schemas.js";

describe("site.json", () => {
  it("parses against siteSchema with the correct brand spelling", () => {
    expect(site.brand).toBe("Pink Paprikaa");
    expect(site.gstin).toBe("06AAPCP9130L1ZW");
  });
});

describe("menuItemSchema", () => {
  it("accepts a null price only alongside no constraint violation", () => {
    expect(
      menuItemSchema.safeParse({
        id: "momo-1",
        name: "Veg Momo",
        description: "Steamed",
        price: null,
        variations: [{ label: "Half", price: 155 }],
        tags: ["bestseller"],
        available: true,
      }).success
    ).toBe(true);
  });
  it("rejects an unknown tag", () => {
    expect(
      menuItemSchema.safeParse({
        id: "x",
        name: "X",
        description: "",
        price: 100,
        tags: ["new"],
        available: true,
      }).success
    ).toBe(false);
  });
});

describe("galleryItemSchema", () => {
  it("rejects empty alt text", () => {
    expect(
      galleryItemSchema.safeParse({
        id: "g1",
        src: { src: "/img/a.avif", width: 800, height: 600 },
        alt: "",
        category: "food",
      }).success
    ).toBe(false);
  });
});
```

Run `pnpm nx test content` → PASS.

- [ ] **Step 4: seo — JSON-LD builder typed with schema-dts**

```bash
pnpm --filter @pink-paprikaa-web/seo add -D schema-dts
pnpm --filter @pink-paprikaa-web/seo add @pink-paprikaa-web/content@workspace:*
```

`packages/seo/src/restaurant.ts`:

```ts
import type { Site } from "@pink-paprikaa-web/content";
import type { Restaurant, WithContext } from "schema-dts";

/** Builders take content types as input so structured data cannot drift from displayed content. */
export function restaurantJsonLd(site: Site): WithContext<Restaurant> {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: site.brand,
    url: site.domain,
    email: site.email,
    servesCuisine: ["North Indian", "Chinese"],
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      addressLocality: site.addressLocality,
      addressRegion: site.addressRegion,
      addressCountry: "IN",
    },
  };
}
```

`packages/seo/src/restaurant.test.ts`:

```ts
import { site } from "@pink-paprikaa-web/content";
import { describe, expect, it } from "vitest";
import { restaurantJsonLd } from "./restaurant.js";

describe("restaurantJsonLd", () => {
  it("builds Restaurant JSON-LD from the site content", () => {
    const ld = restaurantJsonLd(site);
    expect(ld["@type"]).toBe("Restaurant");
    expect(ld.name).toBe("Pink Paprikaa");
    expect(JSON.stringify(ld)).not.toMatch(/rishav|pandey|anand/i);
  });
});
```

Export from `src/index.ts`. Run `pnpm nx test seo` → PASS.

- [ ] **Step 5: Exit gate + commit**

`pnpm nx run-many -t typecheck lint test build` for the three projects, then full exit gate.

```bash
git add -A
git commit -m "feat(content): utils, content and seo packages wired with Vitest"
```

(One commit is fine; if you prefer three scoped commits — `feat(utils):`, `feat(content):`,
`feat(seo):` — that is also acceptable.)

---

### Task 6: `packages/ui` — React library, tailwind-variants, reference `Button`

**Files:**

- Create (via generator): `packages/ui` React library with Vitest
- Create: `packages/ui/src/atoms/button/button.tsx`, `button.test.tsx`
- Create: `packages/ui/src/{molecules,organisms,templates}/.gitkeep`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: token utility classes from Task 4 (`bg-brand-primary`, `hover:bg-brand-primary-hover`,
  `text-surface`); NOT the CSS file itself — Tailwind class strings compile in the consuming
  app/Storybook, so `ui` has no runtime dependency on the CSS.
- Produces: `@pink-paprikaa-web/ui` exporting `Button` and `ButtonProps`:

  ```ts
  type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
    intent?: "primary" | "secondary";
    size?: "sm" | "md" | "lg";
  };
  function Button(props: ButtonProps): JSX.Element;
  ```

  Tasks 7 and 8 import `Button` by this exact name.

- [ ] **Step 1: Generate the React library**

```bash
pnpm nx add @nx/react
pnpm nx g @nx/react:library packages/ui --bundler=none --unitTestRunner=vitest --linter=eslint --style=none
```

(Check `--help`; goals: importPath `@pink-paprikaa-web/ui`, vitest with jsdom, no project.json.)
Replace the generated eslint config content with:
`import react from "@pink-paprikaa-web/eslint-config/react"; export default [...react];`

```bash
pnpm --filter @pink-paprikaa-web/ui add tailwind-variants @radix-ui/react-slot
pnpm --filter @pink-paprikaa-web/ui add -D @testing-library/react @testing-library/jest-dom vitest-axe jsdom
```

Create the four layer directories; `molecules/`, `organisms/`, `templates/` each get a `.gitkeep`.

- [ ] **Step 2: Failing tests first**

`packages/ui/src/atoms/button/button.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";
import { Button } from "./button.js";

describe("Button", () => {
  it("renders its children and defaults to the primary intent", () => {
    render(<Button>Order Now</Button>);
    const button = screen.getByRole("button", { name: "Order Now" });
    expect(button.className).toContain("bg-brand-primary");
  });

  it("applies the secondary intent variant", () => {
    render(<Button intent="secondary">View Menu</Button>);
    expect(screen.getByRole("button", { name: "View Menu" }).className).toContain("border");
  });

  it("forwards native button props", () => {
    render(<Button type="submit">Go</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Button>Order Now</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

(Wire `vitest-axe/extend-expect` and `@testing-library/jest-dom` in the vitest setup file the
generator created; add one if absent and reference it from the vite config `test.setupFiles`.)

Run `pnpm nx test ui` → FAIL (button module missing).

- [ ] **Step 3: Implement `Button` with tailwind-variants**

`packages/ui/src/atoms/button/button.tsx`:

```tsx
import { tv, type VariantProps } from "tailwind-variants";

const button = tv({
  base: "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
  variants: {
    intent: {
      primary: "bg-brand-primary text-surface hover:bg-brand-primary-hover",
      secondary:
        "border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-surface",
    },
    size: {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-6 text-lg",
    },
  },
  defaultVariants: { intent: "primary", size: "md" },
});

export type ButtonProps = React.ComponentPropsWithoutRef<"button"> & VariantProps<typeof button>;

/** Reference atom proving the token → variant → story → test path (arch spec §8). */
export function Button({ className, intent, size, ...props }: ButtonProps) {
  return <button className={button({ intent, size, className })} {...props} />;
}
```

`src/index.ts`: `export { Button, type ButtonProps } from "./atoms/button/button.js";`

Run `pnpm nx test ui` → PASS.

- [ ] **Step 4: Prove the atomic-layering lint rule bites**

Temporarily create `packages/ui/src/atoms/button/layering-probe.ts` containing
`import "../../molecules/probe.js";` plus a stub `packages/ui/src/molecules/probe.ts`. Run
`pnpm nx lint ui` → must FAIL with the "Atomic layering" message from Task 2. Delete both files.
If it does not fail, fix the `react.js` zone globs until it does — this is the acceptance test
for spec §7 rule 2.

- [ ] **Step 5: Exit gate + commit**

```bash
git add -A
git commit -m "feat(ui): React library with atomic layers and reference Button atom"
```

---

### Task 7: Storybook 10 shell inside `packages/ui`

**Files:**

- Create (via generator): `packages/ui/.storybook/main.ts`, `.storybook/preview.ts`
- Create: `packages/ui/.storybook/styles.css`
- Create: `packages/ui/src/atoms/button/button.stories.tsx`

**Interfaces:**

- Consumes: `Button` (Task 6), `@pink-paprikaa-web/design-tokens/theme.css` (Task 4).
- Produces: `storybook` (dev) and `build-storybook` targets on the `ui` project; static build
  output consumed by CI later phases. Task 12's CI does NOT build Storybook (deploy is Phase 6).

- [ ] **Step 1: Generate the Storybook configuration**

```bash
pnpm nx add @nx/storybook
pnpm nx g @nx/storybook:configuration ui --uiFramework=@storybook/react-vite
pnpm --filter @pink-paprikaa-web/ui add -D @storybook/addon-a11y @tailwindcss/vite tailwindcss
```

(Check `--help` and the interactive prompts; pick react-vite, no interaction tests. Verify no
`project.json` appears — Storybook targets are inferred by `@nx/storybook`'s plugin from
`.storybook/main.ts`.)

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

Ensure `design-tokens` builds before Storybook: `@nx/storybook` infers a dependency through the
import only if the package graph knows it — add
`pnpm --filter @pink-paprikaa-web/ui add @pink-paprikaa-web/design-tokens@workspace:*` and check
`pnpm nx graph --print` (or `show project ui`) lists the dependency, so `build-storybook`
triggers the token build via `dependsOn` defaults (`^build`).

- [ ] **Step 3: The Button story**

`packages/ui/src/atoms/button/button.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button.js";

const meta = {
  title: "Atoms/Button",
  component: Button,
  args: { children: "Order Now" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { intent: "secondary", children: "View Menu" } };
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <Button {...args} size="sm" />
      <Button {...args} size="md" />
      <Button {...args} size="lg" />
    </div>
  ),
};
```

- [ ] **Step 4: Verify both targets**

Run: `pnpm nx run ui:build-storybook`
Expected: static output builds; the emitted CSS contains `--color-brand-primary` (grep the
output dir) proving the token pipeline reached Storybook. Then run the exit gate. (Do not leave
a dev server running.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(ui): Storybook 10 shell with a11y addon and Button stories"
```

---

### Task 8: `apps/web` + `apps/web-e2e`

**Files:**

- Create (via generator): `apps/web` (Next.js 16, App Router), `apps/web-e2e` (Playwright)
- Modify: `apps/web/next.config.*` (static export), `apps/web/src/app/global.css`,
  `apps/web/src/app/layout.tssx→tsx`, `apps/web/src/app/page.tsx`
- Create: `apps/web/public/_redirects`
- Modify: `apps/web-e2e/src/*.spec.ts`

**Interfaces:**

- Consumes: `Button` from `@pink-paprikaa-web/ui`, `site` from `@pink-paprikaa-web/content`,
  `restaurantJsonLd` from `@pink-paprikaa-web/seo`, `theme.css` from design-tokens.
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
  `pnpm add -D eslint-plugin-tailwindcss`, and in `tools/eslint-config/react.js` register it with
  its flat config and `settings: { tailwindcss: { config: "<path resolution per plugin docs for v4>" } }`.
  If the installed plugin version does not support Tailwind v4 config-less mode, add it with the
  rules it can run and record the limitation in the task report — do not pin an older Tailwind.
- Add workspace deps:
  `pnpm --filter web add @pink-paprikaa-web/ui@workspace:* @pink-paprikaa-web/content@workspace:* @pink-paprikaa-web/seo@workspace:* @pink-paprikaa-web/design-tokens@workspace:*`

- [ ] **Step 2: The placeholder home page (real metadata, no founder names)**

`apps/web/src/app/layout.tsx` — metadata from the product spec §5.1, JSON-LD wired:

```tsx
import { site } from "@pink-paprikaa-web/content";
import { restaurantJsonLd } from "@pink-paprikaa-web/seo";
import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "Pink Paprikaa — Pure Veg Restaurant & AC Dine-In | Sector 57, Gurgaon",
  description:
    "Pure-veg North Indian, Chinese, momos and café food in Sector 57 Gurgaon. AC dine-in, delivery and corporate meals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-surface text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd(site)) }}
        />
        {children}
      </body>
    </html>
  );
}
```

`apps/web/src/app/page.tsx`:

```tsx
import { site } from "@pink-paprikaa-web/content";
import { Button } from "@pink-paprikaa-web/ui";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold text-brand-primary">{site.brand}</h1>
      <p className="max-w-md text-center">
        Pure veg since day one. AC dine-in in Sector 57 — new site under construction.
      </p>
      <a href={site.orderUrl} target="_blank" rel="noreferrer">
        <Button>Order Now</Button>
      </a>
    </main>
  );
}
```

`apps/web/public/_redirects` (spec §4, unchanged Petpooja redirects):

```
https://order.pinkpaprikaa.com/*   https://pinkpaprikaa.petpooja.site/:splat   301!
https://pickup.pinkpaprikaa.com/*  https://pinkpaprikaa.petpooja.com/menu/:splat  301!
```

- [ ] **Step 3: Build and verify the export**

Run: `pnpm nx build web`
Expected: `apps/web/out/index.html` exists, contains `Pink Paprikaa` (grep it), contains
`application/ld+json`, and `apps/web/out/_redirects` exists. Also assert the built CSS resolves
the token: grep `out/_next/static/**/*.css` for `--color-brand-primary`.

- [ ] **Step 4: Playwright e2e against the real static export**

```bash
pnpm --filter web-e2e add -D @axe-core/playwright
pnpm exec playwright install chromium
```

In `apps/web-e2e/playwright.config.ts`, make the webServer serve the export (not `next dev`):

```ts
webServer: {
  command: "pnpm exec serve apps/web/out -l 4300",  // pnpm add -D serve (root)
  url: "http://localhost:4300",
  reuseExistingServer: !process.env.CI,
},
```

and ensure the e2e target depends on the app build (check `pnpm nx show project web-e2e`; if the
inferred e2e target lacks it, add `"nx": { "targets": { "e2e": { "dependsOn": ["web:build"] } } }`
to `apps/web-e2e/package.json`).

`apps/web-e2e/src/home.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home renders the brand and the Order Now action", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Pink Paprikaa" })).toBeVisible();
  const order = page.getByRole("link", { name: /order now/i });
  await expect(order).toHaveAttribute("href", /order\.pinkpaprikaa\.com/);
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
git commit -m "feat(web): static-export Next.js app with wired tokens, ui, content, seo and e2e"
```

---

### Task 9: `apps/blog` + `apps/blog-e2e`

**Files:**

- Create (via generator): `apps/blog`, `apps/blog-e2e`
- Modify: `apps/blog/next.config.*` (`basePath: "/blog"`, static export)
- Create: `apps/blog/content/posts/hello-pink-paprikaa.mdx`
- Create: `apps/blog/content-collections.ts`
- Modify: blog app pages to list and render posts; e2e spec

**Interfaces:**

- Consumes: `@pink-paprikaa-web/ui` (Button in the placeholder page proves `scope:blog` may use
  `scope:shared`), design-tokens theme.
- Produces: `pnpm nx build blog` → static export under `apps/blog/out/` with all URLs prefixed
  `/blog`. Task 12's founder-gate scans this output too.

- [ ] **Step 1: Generate, then configure basePath + export**

```bash
pnpm nx g @nx/next:application apps/blog --e2eTestRunner=playwright --appDir=true --style=tailwind --linter=eslint --unitTestRunner=none
```

Apply the same §18 corrections as Task 8 (export, images.unoptimized, Tailwind v4, eslint config
from `@pink-paprikaa-web/eslint-config/next`, workspace deps ui + design-tokens), **plus**
`basePath: "/blog"` in the next config.

- [ ] **Step 2: Content Collections wiring (spec §9) with one real post**

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
    template: z.enum(["article"]).default("article"),
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

`apps/blog/content/posts/hello-pink-paprikaa.mdx`:

```mdx
---
title: "The new Pink Paprikaa site is cooking"
description: "A rebuilt pinkpaprikaa.com is on the way — faster pages, a real menu, and a blog."
date: "2026-08-07"
---

Pure veg since day one. The new site — and this blog — are under construction.
```

Blog `page.tsx` lists `allPosts` (title + description + date); `[slug]/page.tsx` renders the MDX
body with `generateStaticParams()` reading the collection (spec §9's `createPages` replacement).
Use the design-system-free defaults for MDX components in Phase 0.

- [ ] **Step 3: Build + verify basePath**

Run: `pnpm nx build blog`
Expected: export exists; the post page is exported; grep the HTML for `/blog/_next/` asset
prefixes proving basePath. Zero founder names in output.

- [ ] **Step 4: e2e — serve the export mounted at `/blog`**

`apps/blog-e2e/playwright.config.ts` webServer (basePath means assets expect to live under
`/blog`):

```ts
// A scratch dir with the export mounted at /blog, so URLs match production:
command:
  "rm -rf apps/blog-e2e/.serve && mkdir -p apps/blog-e2e/.serve && cp -R apps/blog/out apps/blog-e2e/.serve/blog && pnpm exec serve apps/blog-e2e/.serve -l 4301",
url: "http://localhost:4301/blog",
```

Spec: `/blog` lists the post; clicking through renders the post title; no critical/serious axe
violations; no founder names in HTML. (Same shape as Task 8's spec file.) Add the
`dependsOn: ["blog:build"]` wiring as in Task 8, and gitignore `apps/blog-e2e/.serve`.

Run: `pnpm nx e2e blog-e2e` → PASS.

- [ ] **Step 5: Exit gate + commit**

```bash
git add -A
git commit -m "feat(blog): static-export blog app with Content Collections and basePath /blog"
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
`tags`. Run `pnpm nx run-many -t lint` → all pass (no legitimate dependency violates §5's table —
note `seo → content` requires `type:content` in the `type:util` allow-list? **No**: spec's table
says `type:util → type:util` only. But `seo` imports `content`. Resolution, from the spec's own
project table: `seo` is `type:util`, and seo→content is a real, spec-mandated dependency (§11
"Builders take packages/content types as input"). Add `type:content` to the `type:util`
constraint's allow-list in `tools/eslint-config/base.js` and record the spec-table amendment in
the task report — the spec's prose wins over its table.)

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
- Produces: CI gates per spec §12/§14. Content-integrity gate = the content package's build-time
  `siteSchema.parse` (Task 5) + tests; no separate tool in Phase 0.

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
  token pipeline (4), Storybook+Button (6, 7), Vitest/Playwright/axe/LHCI + CI jobs (5, 8, 12),
  content-integrity + founder gates (5, 12), root scripts (3).
- **Known narrowings (deliberate, recorded in tasks):** deploy job is a Phase 6-gated skeleton
  (Netlify access is a §16 external input); content-integrity in Phase 0 is the build-time Zod
  parse + tests, not a separate link-checker (no content to check yet); `commitlint.config.mjs`
  not `.ts`; `seo → content` requires amending the `type:util` dep-constraint (spec prose wins
  over its table).
- **Type consistency:** `Button`/`ButtonProps` (6→7,8); `site`, `Site`, `restaurantJsonLd`
  (5→8); token utility names `bg-brand-primary`, `hover:bg-brand-primary-hover`, `text-surface`,
  `text-ink`, `border-brand-primary` (4→6,7,8); `processImages`/`ImageManifestEntry` (11 only);
  preset names `base/next/react-library/node` (1→5,6,8,11).
