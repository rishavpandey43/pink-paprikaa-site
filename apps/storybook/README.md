# Storybook

This app is the design system's "Design System tab" (spec D13): foundations, every component in
every variant, and the reference kits. Component stories live beside their components in
`packages/ui/src`. Foundations, kits and docs pages live here, in `src/`. The component authoring
rules are in `packages/ui/AUTHORING.md`.

Every Storybook CLI command must run from **this directory** (or be given `--config-dir`). There is
no `.storybook` at the workspace root, so `npx storybook <cmd>` from the repo root fails with
`SB_CORE-SERVER_0006 MainFileMissingError`. The Nx targets below already set `cwd`.

## Commands

| What                                    | Command                                                     |
| --------------------------------------- | ----------------------------------------------------------- |
| Dev server (port 6006)                  | `pnpm nx run storybook:serve`                               |
| Static build (`storybook-static/`)      | `pnpm nx run storybook:build`                               |
| Serve the static build                  | `pnpm nx run storybook:serve-static`                        |
| **Story tests** (every story, once)     | `pnpm nx run storybook:test`                                |
| Story tests, watch mode                 | `pnpm nx run storybook:test -- --watch`                     |
| One story file                          | `pnpm nx run storybook:test -- icon.stories`                |
| Visual tests (Chromatic), needs a token | `CHROMATIC_PROJECT_TOKEN=… pnpm nx run storybook:chromatic` |

`build` and `serve-static` are aliases (`nx:noop` + `dependsOn`) of the inferred `build-storybook`
and `static-storybook`, so every app answers to the same `serve` / `build` / `serve-static` / `lint`
targets.

## Sidebar: Introduction, then the design system's 13 groups

`preview.tsx` sets `options.storySort` to the design system's own tab order:

| #   | Group     | Holds                                                  | Lives in             |
| --- | --------- | ------------------------------------------------------ | -------------------- |
| 1   | Brand     | Logo, pattern, company details, voice, iconography     | `apps/storybook/src` |
| 2   | Colors    | Ramps, semantic, surfaces, status, contrast matrix     | `apps/storybook/src` |
| 3   | Type      | Display, headings, body, overline and mono, Devanagari | `apps/storybook/src` |
| 4   | Spacing   | Scale, layout rhythm                                   | `apps/storybook/src` |
| 5   | Layout    | Breakpoints, AutoGrid, radii, borders, elevation       | `apps/storybook/src` |
| 6   | Motion    | Motion, states, form states, section reveal            | `apps/storybook/src` |
| 7   | Marketing | Canvas formats, canvas type, marketing kit artboards   | `apps/storybook/src` |
| 8   | Atoms     | One story file per component                           | `packages/ui/src`    |
| 9   | Molecules | One story file per component                           | `packages/ui/src`    |
| 10  | Organisms | One story file per component                           | `packages/ui/src`    |
| 11  | Layouts   | One story file per component                           | `packages/ui/src`    |
| 12  | Website   | The website reference kit                              | `apps/storybook/src` |
| 13  | App       | The app kit screens at 390×844                         | `apps/storybook/src` |

Groups fill in plan by plan (spec §10.1). Today the sidebar holds `Introduction`, `Atoms/Icon` and
`Atoms/Logo`.

## How it consumes the design system

The same way an app will (spec §6.5). `.storybook/styles.css` imports `tailwindcss` and then
`@pink-paprikaa-web/ui/styles.css`. The library scans its own sources. This app adds `@source` only
for its own `src/` and for the library's `*.stories.tsx`, which the library excludes from its own
scan so a shipping app never pays for demo-only classes. `.storybook/fonts.ts` self-hosts Poppins,
DM Sans and Space Mono through `@fontsource/*` (D11).

## Accessibility: the contrast policy

WCAG 2.2 AA everywhere, with **one declared exception**: white text on the brand pink fill, held to
the AA-large floor (3:1). That pairing measures 4.04:1, and the brand fill is not negotiable (spec
§5, D3).

- **Contrast is gated at the token level.** `packages/design-tokens/contrast-pairs.json` lists every
  text/background pair the components paint. `pnpm nx test design-tokens` (`policy.spec.ts`)
  measures each one on its surface. The minimum is 4.5, and 3 is allowed only for pairs tagged
  `exception: "brand-fill"`. A component that paints a new pair adds it there.
- **axe's `color-contrast` rule is off in stories.** axe cannot scope an exception to a single
  pair: it would either fail every brand button or have to be switched off for the whole palette.
  The token gate replaces it. The library's jsdom suite switches it off too
  (`packages/ui/vitest.setup.ts`), since jsdom resolves no stylesheet.
- **Every other axe rule fails the story.** `preview.tsx` sets `parameters.a11y.test = "error"`, so a
  violation fails `storybook:test` rather than sitting in a panel.

## Story tests (`@storybook/addon-vitest`)

`vitest.config.mts` turns every story into a Vitest test. It renders the story, runs the story's
`play` function if it has one, and then runs axe against the rendered DOM. The tests run in
**headless Chromium via Playwright**, not jsdom, because focus visibility and computed roles and
names need real layout and a resolved stylesheet. The library's own jsdom suite
(`pnpm nx test ui`) is separate. The two complement each other and neither config touches the other.

The `test` target's cache inputs include `^default`, so a change to any `packages/ui` component or
story re-runs it. Watch mode also starts a Storybook dev server (if none is on port 6006), so failure
output can deep-link to the failing story.

## The founder guard covers this build

`pnpm guard:founder` scans `storybook-static` along with the apps' output. Two things would
otherwise leak the builder's home directory into the build, and `.storybook/main.ts` handles both:

- `relativeDocgenPaths()` rewrites react-docgen-typescript's absolute `filePath` to a
  workspace-relative one.
- `env` blanks `NODE_PATH`, which pnpm's bin shims export and Storybook bakes into the manager
  bundles.

Never narrow the guard to make a build pass.

## Visual tests (`@chromatic-com/storybook`)

The addon is registered and appears in the sidebar. The `chromatic` target builds Storybook and
hands the static output to the Chromatic CLI. Everything up to the network call is wired. What is
**not** wired, because it cannot be created from here, is the project token. Public hosting is out
of scope this phase (D16), and no Chromatic project exists yet (spec §3.3).

To take the first baseline:

1. Sign in at <https://www.chromatic.com/start> and create a project for this repository.
2. Copy the project token from the project's **Manage** screen.
3. Put it where the tooling looks for it. Either is fine; `.env` is gitignored:

   ```bash
   # apps/storybook/.env
   CHROMATIC_PROJECT_TOKEN=<token>
   ```

   …or export `CHROMATIC_PROJECT_TOKEN` in the shell, or add it as a CI secret.

4. Run the first baseline from the workspace root: `pnpm nx run storybook:chromatic`. The first
   build accepts every snapshot as the baseline, and later runs diff against it.

The in-Storybook **Visual Tests** panel uses the same token. It writes a `chromatic.config.json`
here containing the `projectId` (not the token), and that file is safe to commit. Nothing in this
repo fabricates a token or a project id.
