# Storybook

The design system's workbench. Stories live in `packages/ui/src`; this app only hosts them.

Every Storybook CLI command must run from **this directory** (or be given `--config-dir`). There is
no `.storybook` at the workspace root, so `npx storybook <cmd>` from the repo root fails with
`SB_CORE-SERVER_0006 MainFileMissingError`. The Nx targets below already set `cwd`.

## Commands

| What                                     | Command                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| Dev server (port 6006)                   | `pnpm nx run @pink-paprikaa-web/storybook:serve`                               |
| Static build                             | `pnpm nx run @pink-paprikaa-web/storybook:build`                               |
| **Story tests** (every story, once)      | `pnpm nx run @pink-paprikaa-web/storybook:test`                                |
| **Story tests, watch mode**              | `pnpm nx run @pink-paprikaa-web/storybook:test -- --watch`                     |
| One story file                           | `pnpm nx run @pink-paprikaa-web/storybook:test -- button.stories`              |
| Visual tests (Chromatic) — needs a token | `CHROMATIC_PROJECT_TOKEN=… pnpm nx run @pink-paprikaa-web/storybook:chromatic` |

## Story tests (`@storybook/addon-vitest`)

`vitest.config.mts` turns every story into a Vitest test: it renders, runs the story's `play`
function if it has one, and then runs axe against the rendered DOM. `preview.tsx` sets
`parameters.a11y.test = "error"`, so an accessibility violation **fails the test** — it does not
just show up in a panel.

Tests run in **headless Chromium via Playwright**, not jsdom. That is the point: colour contrast,
focus visibility and computed roles need real layout and a resolved stylesheet. The library's own
jsdom suite (`pnpm nx run @pink-paprikaa-web/ui:test`) has to disable the `color-contrast` rule for
exactly that reason — see `packages/ui/vitest.setup.ts`. The two suites are complementary and run
independently; neither one's config touches the other.

Watch mode also starts a Storybook dev server (if one is not already on port 6006) so failure
output can deep-link to the failing story.

### Current state: this target is red, and the failures are real

The first full run reports **200 failing story tests out of 441**, in 53 of 79 story files. Every
single failure is an axe violation — there are no render errors and no failing `play` functions.
483 of the 489 findings are `color-contrast`, and they trace back to the palette in
`packages/design-tokens`, not to individual components:

| Foreground → background                                   | Ratio | Needs | Findings |
| --------------------------------------------------------- | ----- | ----- | -------- |
| `text.on-brand` (`ink.0`) on `surface.brand` (`pink.500`) | 4.04  | 4.5   | ~114     |
| `text.subtle` (`ink.500`) on `surface.page` (`ink.0`)     | 3.78  | 4.5   | ~122     |
| `pink.400` on `surface.brand-soft` (`pink.100`)           | 2.52  | 4.5   | 78       |
| `text.brand` (`pink.500`) on `surface.page` (`ink.0`)     | 4.04  | 4.5   | ~55      |
| `text.brand` on `surface.brand-soft` (`pink.100`)         | 3.18  | 4.5   | 35       |
| `text.brand` on `surface.sunken` (`ink.100`)              | 3.67  | 4.5   | 16       |
| `text.brand` on `brand.tint` (`pink.50`)                  | 3.78  | 4.5   | 10       |
| `status.success` (`mint`) on white                        | 3.15  | 4.5   | 6        |
| `text.muted` (`ink.600`) on `surface.brand`               | 1.59  | 4.5   | 4        |
| `status.warning` (`turmeric`) on white                    | 1.87  | 4.5   | 3        |

The remaining six findings are structural and component-local: `landmark-unique` (app-shell,
site-header, tab-bar), `landmark-no-duplicate-banner` (site-header), `scrollable-region-focusable`
(cluster).

`#EE2C68` is the brand and is not negotiable, but _using it as text on white_ and _using white as
text on it_ are separate decisions from the brand colour itself — both are one token change away
(a darker `text.brand` / `text.on-brand` pairing) without touching the brand primary. That call is
a design decision, so nothing here has been silenced or downgraded to `"todo"`.

## Visual tests (`@chromatic-com/storybook`)

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
