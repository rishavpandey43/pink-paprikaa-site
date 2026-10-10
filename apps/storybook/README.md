# Storybook — the Pink Paprikaa Design System tab

`apps/storybook` is the design system's workbench and its documentation: the thirteen groups of the
design-system folder's "Design System tab", in the same order. Component stories live beside their
components in `packages/ui/src`; everything else lives here. Local and static build only — public
hosting waits for the Phase 6 cutover (spec D16).

Every Storybook CLI command must run from **this directory** (or be given `--config-dir`); there is
no `.storybook` at the workspace root, so `npx storybook <cmd>` from the root fails with
`SB_CORE-SERVER_0006 MainFileMissingError`. The Nx targets below already set `cwd`.

## Commands

| What                                     | Command                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| Dev server (port 6006)                   | `pnpm nx run @pink-paprikaa-web/storybook:serve`                               |
| Static build (`storybook-static/`)       | `pnpm nx run @pink-paprikaa-web/storybook:build`                               |
| Serve the static build                   | `pnpm nx run @pink-paprikaa-web/storybook:serve-static`                        |
| Story tests (every story, once)          | `pnpm nx run @pink-paprikaa-web/storybook:test`                                |
| Story tests, watch mode                  | `pnpm nx run @pink-paprikaa-web/storybook:test -- --watch`                     |
| One story file                           | `pnpm nx run @pink-paprikaa-web/storybook:test -- forms.stories`               |
| Visual tests (Chromatic) — needs a token | `CHROMATIC_PROJECT_TOKEN=… pnpm nx run @pink-paprikaa-web/storybook:chromatic` |

`build` and `serve-static` are aliases (`nx:noop` + `dependsOn`) of the inferred `build-storybook`
and `static-storybook`, so every app answers to the same `serve` / `build` / `serve-static` / `lint`
targets.

Story tests run in headless Chromium; install it once with `pnpm exec playwright install chromium`.

## How it consumes the design system

The same way an app will (spec §6.5). `.storybook/styles.css` imports `tailwindcss` and then
`@pink-paprikaa-web/ui/styles.css`. The library scans its own sources. This app adds `@source` only
for its own `src/` and for the library's `*.stories.tsx`, which the library excludes from its own
scan so a shipping app never pays for demo-only classes. `.storybook/fonts.ts` self-hosts Poppins,
DM Sans and Space Mono through `@fontsource/*` (D11).

## Story tests (`@storybook/addon-vitest`)

`vitest.config.mts` has **two** projects: `storybook` (browser) and `docs-kit` (node). The
`storybook` project turns every story into a Vitest test: it renders the story, runs its `play`
function if it has one, then runs axe against the rendered DOM. Those tests run in **headless
Chromium via Playwright**, not jsdom, because focus visibility and computed roles and names need
real layout and a resolved stylesheet. The `docs-kit` project is node-side specs over
`src/**/*.spec.ts`. The library's own jsdom suite (`pnpm nx test ui`) is separate; none of the
three configs touch the others. The `test` target's cache inputs include `^default`, so a change to
any `packages/ui` component or story re-runs it. Watch mode also starts a Storybook dev server (if
none is on port 6006), so failure output can deep-link to the failing story.

## Groups and where they live

Counted from `.storybook/preview.tsx` `options.storySort.order`: Introduction, then the thirteen
design-system groups.

| Group                                                         | Source                                                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Introduction                                                  | `src/docs/introduction.mdx`                                                                                  |
| Brand · Colors · Type · Spacing · Layout · Motion · Marketing | `src/foundations/<group>/*.mdx`, with the group's specimens in `src/foundations/<group>/<group>.stories.tsx` |
| Atoms · Molecules · Organisms · Layouts                       | `packages/ui/src/<layer>/<name>/<name>.stories.tsx`                                                          |
| Molecules → Field → React Hook Form + Zod                     | `src/patterns/forms.stories.tsx`                                                                             |
| Website · App · Marketing → Kit                               | `src/kits/{website,app,marketing}/`                                                                          |

## Foundation pages

- **Values are read, never typed.** Every token value reaches a page through
  `src/docs-kit/catalogue.ts`, which reads `@pink-paprikaa-web/design-tokens/tokens.json`.
  `token()` and `tokensWithPrefix()` throw on a missing name, so a renamed token fails
  `storybook:test` on the specimen that asked for it.
- **Every live visual is a specimen story.** MDX holds prose and
  `<Canvas of={Specimens.X} meta={Specimens} sourceState="none" />`; the story sits in the group's
  hidden CSF file (`tags: ["!dev", "!autodocs"]` — out of the sidebar, still rendered and tested).
  Keep `className` out of MDX: ESLint cannot see it there.
- **The docs-kit is docs-only** — `Swatch`, `Swatches`, `TokenTable`, `TypeSpecimen`,
  `ContrastMatrix`, `SpacingScale`, `RadiusScale`, `ShadowLadder`, `MotionDemo`, `SpecimenRow`,
  `SpecimenTile`. `packages/ui` never imports it. Its contract tests are
  `src/docs-kit/docs-kit.stories.tsx` plus the `docs-kit` Vitest project.
- Inline `style` here may reference only a token's custom property (`var(--…)` from the catalogue)
  or a value computed from `tokens.json` — never a literal.
- Every design-system guideline card maps to a page, named in a `{/* source: guidelines/<card>.card.html */}`
  comment. Check from the workspace root:

  ```bash
  diff <(ls "zip-files/Pink Paprikaa Design System/guidelines" | sed 's/\.card\.html$//' | sort) \
       <(grep -rhoE 'guidelines/[a-z0-9-]+\.card\.html' apps/storybook/src/foundations | sed -E 's#guidelines/##; s#\.card\.html##' | sort -u)
  ```

## Reference kits

- Composed only from `@pink-paprikaa-web/ui` public exports.
- Facts — year, address, hours, legal lines, contact, outlet — come from `@pink-paprikaa-web/content`;
  the only reviews are the four verified Google reviews, as the guests wrote them
  (`src/kits/fixtures.ts`). No invented testimonial, no rating the business has not been given,
  nothing non-veg — not even egg.
- Every kit page carries the "Reference kit — not production copy" notice and a 360px story whose
  test fails on any sideways scroll.

## Accessibility policy (spec §5)

`preview.tsx` sets `parameters.a11y.test = "error"`: an axe violation fails the story test. Every
rule runs except `color-contrast` — axe cannot scope an exception to the brand's single declared
pair (white on the brand pink, held at the AA-large 3:1 floor). Contrast is owned by the token
policy instead: `packages/design-tokens/contrast-pairs.json`, measured on every
`design-tokens:test` run by the same evaluator that renders **Colors → Contrast**. Storybook itself
disables `region` (stories are fragments, not pages).

## The founder guard covers this build

`pnpm guard:founder` scans `storybook-static` along with the apps' output. Two things would
otherwise leak the builder's home directory into the build, and `.storybook/main.ts` handles both:

- `relativeDocgenPaths()` rewrites react-docgen-typescript's absolute `filePath` to a
  workspace-relative one.
- `env` blanks `NODE_PATH`, which pnpm's bin shims export and Storybook bakes into the manager
  bundles.

Never narrow the guard to make a build pass.

## Visual tests (Chromatic)

The addon is registered and appears in the Storybook sidebar; the `chromatic` target builds
Storybook and hands the static output to the Chromatic CLI. Everything up to the network call is
wired. What is **not** wired, because it cannot be created from here, is the project token.

To take the first baseline:

1. Sign in at <https://www.chromatic.com/start> and create a project for this repository.
2. Copy the project token from the project's **Manage** screen.
3. Put it where the tooling looks for it. Either is fine; `.env` is gitignored:

   ```bash
   # apps/storybook/.env
   CHROMATIC_PROJECT_TOKEN=<token>
   ```

   …or export `CHROMATIC_PROJECT_TOKEN` in the shell / add it as a CI secret.

4. Run the first baseline from the workspace root:

   ```bash
   pnpm nx run @pink-paprikaa-web/storybook:chromatic
   ```

   The first build accepts every snapshot as the baseline; later runs diff against it.

The in-Storybook **Visual Tests** panel uses the same token — open Storybook, click the panel, and
paste the token when it asks. It writes a `chromatic.config.json` here containing the `projectId`
(not the token); that file is safe to commit once it exists. Nothing in this repo fabricates a
token or a project id.
