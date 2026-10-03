# 05 — Tooling & Config Registry

**Universal rules:** every config file has exactly one owner and one documented reason to exist;
configuration changes are commits with rationale, never drive-bys; tool defaults are verified
against the standard, not trusted (generators lie — see architecture spec §18); versions are
resolved by the package manager, never hand-typed. Below is this repo's complete binding — if a
config file is not in this table, it should not exist.

## 1. The registry

| File                                                   | Owns                                                                                                                                                                                                | Change protocol                                                                                                                                                         |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nx.json`                                              | Plugin registrations + target names, `targetDefaults`                                                                                                                                               | Via `pnpm nx add`; manual edits only for targetDefaults/named inputs, with rationale                                                                                    |
| `pnpm-workspace.yaml`                                  | Workspace globs, `onlyBuiltDependencies`, peer rules                                                                                                                                                | Append-only in practice; every entry keeps its comment                                                                                                                  |
| `package.json` (root)                                  | Scripts (thin `nx` delegates), devDeps, engines, pnpm-guards                                                                                                                                        | Deps via `pnpm add` only. Scripts stay delegates — logic lives in tools, not scripts                                                                                    |
| `package.json` (project)                               | Identity, `"nx"` field (tags, target overrides), deps                                                                                                                                               | Tags per boundary matrix; overrides documented inline                                                                                                                   |
| `tsconfig.base.json`                                   | The strict flags (single source)                                                                                                                                                                    | Effectively frozen; changes are decision-log events                                                                                                                     |
| `tools/typescript-config/*`                            | Shareable presets (currently unconsumed — see §15 note)                                                                                                                                             | Wire-or-retire decision belongs to Phase 1                                                                                                                              |
| `eslint.config.mjs` (root)                             | Composes `@pink-paprikaa-web/eslint-config/base`                                                                                                                                                    | Rarely changes; rules live in the package                                                                                                                               |
| `tools/eslint-config/*`                                | ALL lint policy: presets, custom rules, severity                                                                                                                                                    | The main policy surface. New rule = probe proving it bites (see 06 §4)                                                                                                  |
| `.prettierrc`                                          | printWidth 100, double quotes; `plugins: ["prettier-plugin-tailwindcss"]` with `tailwindStylesheet: "./packages/ui/tailwind.css"` and `tailwindFunctions: ["componentVariants"]` (class order, D18) | Frozen (D18). `tailwindStylesheet` points at the library's Tailwind entry; it moves only with that file                                                                 |
| `commitlint.config.mjs`                                | Commit types + scope enum                                                                                                                                                                           | New scope = new project only                                                                                                                                            |
| `.husky/*` + `.lintstagedrc.json`                      | pre-commit fix, commit-msg lint, pre-push verify                                                                                                                                                    | Hooks stay fast (<5s pre-commit); never bypassed with `--no-verify`                                                                                                     |
| `.github/workflows/ci.yml`                             | The gate pipeline (verify/e2e/lighthouse/guards/deploy)                                                                                                                                             | Every command must run green locally first, in order                                                                                                                    |
| `.lighthouserc.json`                                   | Performance/a11y/SEO budgets                                                                                                                                                                        | Budget values are LAW; fix the page, never the budget                                                                                                                   |
| `scripts/check-founder-names.mjs`                      | The founder guard                                                                                                                                                                                   | Extending coverage OK; narrowing = decision-log event                                                                                                                   |
| `.vscode/settings.json`                                | Editor determinism: format+fix on save, workspace TS                                                                                                                                                | Keep minimal; personal prefs stay personal                                                                                                                              |
| `.npmrc` + engines + `only-allow`                      | Package-manager enforcement (pnpm only)                                                                                                                                                             | Frozen                                                                                                                                                                  |
| `packages/design-tokens/sd.config.mjs`                 | Token build (`@theme static`, case-preserving)                                                                                                                                                      | Output contract frozen; see inline comments before touching                                                                                                             |
| `packages/design-tokens/contrast-pairs.json`           | The contrast policy — every text/background pair the components paint, with its minimum ratio (spec §5.4)                                                                                           | Adding pairs is free. Lowering a `min`, or adding an `exception`, is a decision-log event                                                                               |
| `apps/storybook/.storybook/{main.ts,preview.tsx}`      | Stories globs, docs addons, a11y policy, sidebar order, viewports                                                                                                                                   | Sidebar order follows the design system's tab groups; the a11y rule list changes only with spec §5                                                                      |
| `apps/storybook/vitest.config.mts`                     | Story tests in headless Chromium (`storybook` project) plus docs-kit node specs (`docs-kit` project)                                                                                                | Two projects in one config; do not split into a second Vitest file                                                                                                      |
| `packages/ui/scripts/build-brand-artwork.mjs`          | Compiles `src/assets/brand/*-pink.svg` into `src/lib/brand-artwork.{ts,css}` (svgo, path precision 2)                                                                                               | Run `pnpm nx run ui:brand-artwork`, then Prettier on `src/lib/brand-artwork.*`, and commit the output. Changing precision needs a before/after visual diff (ruling R25) |
| `packages/ui/tailwind.css`                             | The Tailwind entry that ESLint (`cssConfigPath`) and Prettier (`tailwindStylesheet`) read the theme from. Nothing bundles it                                                                        | Keep it as `@import "tailwindcss"` plus the library stylesheet                                                                                                          |
| `apps/web/next.config.js`, `apps/blog/next.config.mjs` | `output: "export"`, basePath (blog only), images.unoptimized                                                                                                                                        | These three keys are LAW (product spec §10-11)                                                                                                                          |

## 2. Version policy (LAW)

- Install via `pnpm add` — resolves latest stable; never hand-write a version string.
- **Nx-family lockstep:** every `@nx/*` package + `nx` pinned to the same exact version. A caret
  on one of them is a defect (caught once in review already).
- Documented exceptions carry removal criteria (currently: TypeScript ~6.x until
  typescript-eslint supports 7; jsx-a11y peer override until it declares ESLint 10).
- Version-sensitive API use is verified against the **installed** package (read
  `node_modules/<pkg>` source/README), never against memory — this session alone caught four
  memory-vs-installed drifts (perfectionist v5 schema, Content Collections API, SD transforms,
  ESLint 10 removals).

## 3. Commands (the complete daily surface)

```bash
pnpm verify            # affected typecheck+lint+test+build — THE definition of done
pnpm verify:all        # same, whole workspace
pnpm commit            # Commitizen (enforced conventional commits)
pnpm format            # prettier via nx
pnpm guard:founder     # founder-name gate over built output
pnpm nx run web:serve        # dev servers
pnpm nx e2e web-e2e    # Playwright vs the real static export
pnpm nx run storybook:build   # Storybook is apps/storybook, not packages/ui
pnpm nx test storybook        # every story as a test (Chromium, axe)
pnpm nx run ui:brand-artwork  # regenerate the brand artwork after an SVG change
pnpm nx graph          # visualise projects + task deps
pnpm nx show project <name>   # the resolved "virtual project.json"
```

## 4. Config-change checklist (CONVENTION — every config PR)

1. State the reason in the commit body (what breaks/improves without it).
2. Run the affected gate cold (`--skip-nx-cache`) — cached green is not proof.
3. If the change alters what a rule catches: run a **probe** (a deliberate violation) and show
   it failing, then remove the probe ([06 §4](06-quality-gates.md)).
4. Update this registry if a file appears/disappears/changes owner.
