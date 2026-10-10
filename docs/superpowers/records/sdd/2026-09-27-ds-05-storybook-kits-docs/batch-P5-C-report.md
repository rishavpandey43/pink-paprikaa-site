# Batch P5-C report — carried fixes (R60/R61) + Plan 5 Tasks 5, 6, 8

Base `26ba97e`. Commits: `c507f4f` (carried fixes, tokens), `5b6517e` (carried fixes, storybook),
`3e1471b` (Task 5), `c674d7f` (Task 6), `163c7c1` (Task 8).

## Carried fixes (carried-fixes-P5-C.md)

| #   | Fix                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Test / evidence                                                                                                                                                                                                                                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Important.** `container-*` → `containerUtilities`: a container that a spacing token aliases (`spacing-text-measure-prose` → `{container.prose}`) is reached through that alias, so `container-prose` → `max-w-text-measure-prose` and `container-prose-narrow` → `max-w-text-measure-narrow`. The alias is found from `reference`, not a name list. Other containers stay `max-w-<name>`.                                                                        | Probe added to `UtilitiesDeriveFromTheCatalogue` + node spec "never offers Tailwind's static max-w-prose" (no class across the whole catalogue starts `max-w-prose`). Probe (rule reverted to `max-w-${step}`): `expected [ 'max-w-prose', 'max-w-prose-narrow' ] to deeply equal []`, `× Utilities Derive From The Catalogue`, 2 failed. Restored. |
| 2   | New node spec `apps/storybook/src/docs-kit/catalogue.spec.ts`: for every base token in `duration-/z-/pattern-/effect-/motion-`, each `utilitiesOf` class has an `@utility <class> {` in `packages/ui/src/styles.css`. It runs as a second Vitest project (`docs-kit`, `environment: "node"`, `src/**/*.spec.ts`) in `apps/storybook/vitest.config.mts`, beside the `storybook` browser project — the `projects` + `extends: true` form of addon-vitest 10.5's own template. Same `nx test` target. | 25 cases green.                                                                                                                                                                                                                                                                                         |
| 3   | `effect-` rule narrowed to `effect-scrim-` → `scrim-*`; any other effect token has no rule → `[]`.                                                                                                                                                                                                                                                                                                                                                             | Node spec `maps only the scrims`.                                                                                                                                                                                                                                                                       |
| 4   | **R61.** 38 component spacing tokens carry `"$extensions": { "pink-paprikaa": { "utility": [...] } }` (`size`, `w`, `h`, `h`+`min-w`, `max-w`), each derived from a grep of `packages/ui/src` (tests/stories excluded) and inserted textually, so only the touched objects re-wrap. `sd.config.mjs` emits `extensions: token.$extensions ?? null`; `TokenEntry.extensions` typed. `spacingUtilities`: marker wins → `<u>-<step>`; unmarked `ch` → `max-w-` (R59 kept); else p/m/mt/gap. | Red→green `theme.spec` "carries each token's authored $extensions" (`expected undefined to deeply equal { 'pink-paprikaa': … }`). Node spec per spacing token (53 cases): marker exists **iff** the library uses the token only as `size/w/h/min-*/max-*`, and it names exactly those utilities; `utilitiesOf` then returns them. Red before the reader: 34 failed. Contract story adds `size-icon-sm` (width) and `h-/min-w-button-h-md` painting their token. Probe (reader disabled): `ComponentSizes` `Unable to find … "size-icon-sm"`. |
| 5   | `verdictOf`: `ratio < min` → "fail" first, then pass at AA, else exception.                                                                                                                                                                                                                                                                                                                                                                                      | Red: `rates 5 against a minimum of 7 as fail` and a min-7 group fixture (`color-text-muted` on `color-surface-page`, ≥4.5 and <7) both `expected 'pass' to be 'fail'`. Green 231/231 (then 232 with #4).                                                                                              |
| 6   | `SpacingScale` bar gets `shrink-0`.                                                                                                                                                                                                                                                                                                                                                                                                                              | `Scale` play (step 6 = 24px) green.                                                                                                                                                                                                                                                                     |
| 7   | `CopyScope.copy`: `navigator.clipboard as Clipboard \| undefined`; undefined → copy nothing, no throw.                                                                                                                                                                                                                                                                                                                                                         | New `CopyWithoutAClipboard` story (clipboard getter → undefined, click, status stays empty). Red against the old copy.tsx: `Unhandled error TypeError: Cannot read properties of undefined (reading 'writeText')`, run `Errors 1 error`. Green 14/14, no errors.                                         |
| —   | `doc-table.tsx` comments: "the semantics of the library `Table`'s `minWidth`, not its values"; on the swap `article` → `md`, `narrow` → `lg`.                                                                                                                                                                                                                                                                                                                     | —                                                                                                                                                                                                                                                                                                       |

Marker scope: only component-tier tokens got markers, as the fix asks. No primitive spacing token
(`spacing-hit`, `-header`, `-tabbar`, `-card-min`, `-dock-clearance`) is used as a class in
`packages/ui` yet (`h-header-compact` appears only in a story), so each keeps p/m/mt/gap. The spec
will require a marker the moment one of them is used only as a size.

## Task 5 — Type group

Built: `foundations/type/{type.stories.tsx, display, headings, body, overline-and-mono, devanagari, fluid}.mdx`,
taken from the brief as written except for the changes below.

Deviations:

1. **R56 play (fold item 8)** on `HeadingSteps`: it clicks the `text-h1` chip and the first
   `font-display` chip (both from `utilitiesOf`) and asserts each clipboard write.
2. **Heading prose corrected.** The brief said headings "use `text-wrap: balance` (`Text isBalanced`)".
   In fact `Text` balances display and heading steps by default, and `isBalanced` is for body copy
   (text.tsx). The prose now says that.
3. **R56 `leading-*`/`tracking-*`.** The type steps have no leading or tracking tokens: those
   namespaces are cleared and each `text-*` composite carries them. A line in `headings.mdx`
   says so. I checked the built CSS: `.text-h1{font-size:…;line-height:var(--tw-leading,var(--text-h1--line-height));letter-spacing:…;font-weight:…}`.
   The chips per specimen are `text-*`, `font-<family>`, `font-<weight>`, `--text-*` and `--font-*`
   (TypeSpecimen from Task 2).

Dev parity (brief table confirmed; additions from `git show dev:packages/ui/src/docs/typography.mdx`):

| Dev item                                                                                          | Ruling  | Where                                                                    |
| ------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------ |
| Poppins structural (carries Devanagari), DM Sans body/UI, Space Mono codes only; final, no swaps  | ALREADY | `display.mdx`, `overline-and-mono.mdx`                                   |
| "Every piece of text goes through `Text`, which locks each step's size, line-height and tracking" | ADD     | `headings.mdx`                                                           |
| The 12-step ramp, each captioned with size / line-height / tracking / family                      | ALREADY | TypeSpecimen captions from `tokens.json`                                 |
| Step names `display1`, `subtitle1`, `subtitle2`, `body1`, `body2`                                 | DROP    | D4                                                                       |
| Seven fluid twins                                                                                 | ALREADY | `FluidTokens`                                                            |
| "Set `isFluid` in every responsive layout" + example                                              | ADD     | `fluid.mdx`                                                              |
| Why the small end has no fluid twin                                                               | ADD     | `fluid.mdx`                                                              |
| "Resize the panel" h1-fluid demo                                                                  | ALREADY | `FluidSteps` at `floor360` + play                                        |
| Display: negative tracking, line-height ≈ 1.0; body generous                                      | ALREADY | `display.mdx`, `body.mdx`                                                |
| ALL CAPS only for overlines and heat labels                                                       | ALREADY | `overline-and-mono.mdx`                                                  |
| Headlines ≤ 6 words; body avg 12 / max 24                                                         | ALREADY | `headings.mdx`, `body.mdx`                                               |
| Line length: prose / narrow measure                                                               | ADD     | `body.mdx`                                                               |
| Headings balance, running text avoids orphans                                                     | ALREADY | `headings.mdx` (corrected, deviation 2), `body.mdx`                      |
| Devanagari only for logo, display moments, dish names                                             | ALREADY | `devanagari.mdx`                                                         |
| Dev classes `leading-<step>` / `tracking-<step>` alongside `text-<step>`                          | DROP    | missed by the plan. `text-*` carries both (deviation 3), noted in `headings.mdx` |

Evidence:

- `type.stories` `Tests 8 passed (8)`.
- Probe (`FluidSteps` without the `floor360` global): `× Fluid Steps`, `Tests 1 failed | 7 passed`.
  Restored.
- Gate: typecheck + lint "Successfully ran targets typecheck, lint"; `storybook:build` "Successfully
  ran target build"; `format:check` exit 0. The index has all six `type-*--docs` pages.
- Devanagari (headless Chromium, built Storybook): the `Poppins 700 U+900-97F` face is `loaded`,
  and a screenshot shows the Devanagari glyphs set in Poppins.

## Task 6 — Spacing group

Built: `foundations/spacing/{spacing.stories.tsx, scale.mdx, layout-rhythm.mdx, shape.mdx}` and
`preview.tsx` storySort (`Spacing` → `["Scale", "Layout rhythm", "Shape"]`).

Deviations:

1. **Fold item 6:** `SPACE_STEPS` is kept as a plain `as const` list. `satisfies readonly SpaceStep[]`
   and `_isEveryStepShown` are dropped (`StackProps` is absent), so the brief's compile-time probe
   is not run. Re-add both when Plan 2c lands.
2. **Fold item 3:** the `Rhythm` story and its `<Canvas>` are deferred (Section/AutoGrid/Card
   layout, 2c). The prose stays, and `AutoGrid`, `Card`, `Section` and `StackProps` are not imported.
3. **R56 play (fold item 8)** on `Scale`: the `mt-3` chip (from `stepUtilities(3)`) copies `mt-3`.
   `SpacingScale` shows `p-/m-/mt-/gap-<n>` plus `calc(var(--spacing) * n)` for every step, so
   `mt-3`, `mt-4` and the rest are all copyable.
4. **R56/R61, added:** a `ComponentSizes` story (the `spacing-*` component tier in a TokenTable)
   under a "Named sizes" section in `scale.mdx`. Its play asserts `size-icon-sm` is offered and
   `p-icon-sm` is not. `RhythmTokens`' container table now offers `max-w-text-measure-prose` for
   `container-prose` (carried fix 1).
5. **R56 deviation — a Shape page (`Spacing/Shape`).** Border widths, radii and shadows belong to
   Task 7 (Layout → Radii / Borders / Elevation), which R55 defers until Plan 2c. So that the
   owner's `border-2` / `rounded-*` / `shadow-*` examples are copyable now, `shape.mdx` renders
   `Radii` (RadiusScale), `BorderWidths` (TokenTable, with a play: `border-width-strong`'s numeric
   chip is `border-2` and copies it), `Elevation` (ShadowLadder `shadow-1…4`, `shadow-brand`) and
   `Stacking` (the `z-*` TokenTable, since R56 lists z-index too). Prose is limited to one line per
   scale (from the dev reference and the token descriptions). **When Task 7 lands, its Layout pages
   own these scales: fold or delete the Shape page then.**

Dev parity (brief table confirmed; additions from `git show dev:…/space-shape-motion.mdx`):

| Dev item                                                                         | Ruling  | Where                                                   |
| -------------------------------------------------------------------------------- | ------- | ------------------------------------------------------- |
| 4px base; the step number is the multiple                                        | ALREADY | `scale.mdx` + `Scale` play                              |
| Steps 1–12, then 14 · 16 · 18 · 20 · 24 · 32; half steps for nudges only         | ALREADY | `scale.mdx`; `SPACE_STEPS` (type check deferred, dev. 1) |
| "16 / 24 / 40 do most of the work"                                               | ALREADY | `scale.mdx`                                             |
| Container max, fluid gutter, fluid section rhythm                                | ALREADY | `RhythmTokens`                                          |
| `--layout-header-h` 72px                                                         | DROP    | C1, `ChromeTokens`                                      |
| Tab bar height and hit minimum                                                   | ADD     | `ChromeTokens` + `layout-rhythm.mdx`                    |
| Card minimum (AutoGrid track)                                                    | ALREADY | Layout → AutoGrid (Task 7)                              |
| `--layout-*` names                                                               | DROP    | D4                                                      |
| Honest grids, columns 1 → 4                                                      | ALREADY | Layout (Task 7)                                         |
| Radius / Elevation scales with class names                                       | ADD     | missed by the plan for this batch. `Spacing/Shape` (dev. 5); Task 7 owns the full pages |

Evidence:

- `spacing.stories` `Tests 8 passed (8)`.
- Probe (marker reader disabled): `× Component Sizes`, `Unable to find an accessible element with
  the role "button" and name "size-icon-sm"`. Restored.
- Gate: typecheck + lint green; `storybook:build` succeeded; `format:check` exit 0. The index has
  `spacing-scale`, `spacing-layout-rhythm` and `spacing-shape` docs.

## Task 8 — Motion group

Built: `foundations/motion/{motion.stories.tsx, motion.mdx, states.mdx, form-states.mdx, section-reveal.mdx}`.

Deviations:

1. **Fold item 3:** the `FormStates` story and its `<Canvas>` are deferred (Field, 3a T2).
   `form-states.mdx` keeps its table and prose and imports only `Meta`. `Field`, `Input`, `Phone`,
   `Search` and `OUTLET` imports are dropped.
2. **Fold item 9:** the `ANIMATIONS` list is kept, with a comment on why it is a list. Each utility
   renders through `CopyChips`.
3. **R56 play:** `Animations` also clicks the `animate-mark-pulse` chip and asserts the write.
   `Durations`/`Easings` show `duration-*`, `ease-*` and both CSS variables through MotionDemo.
4. I checked the prose claims against the source: Button's disabled state is `bg-ink-200 text-ink-400
   cursor-not-allowed shadow-none` (control-states.ts), press is `active:press-scale`, and hover/active
   use the brand-hover/active aliases.

Dev parity: the brief table is confirmed in full (durations side by side ADD, animations running
ADD, "play once" ADD, OS reduce-motion check ADD, August keyframes and arbitrary classes DROP).
Nothing further was found in dev § Motion / § Reduced motion.

Evidence:

- `motion.stories` `Tests 7 passed (7)` (8 in the brief, minus the deferred `FormStates`).
- Probe (`animate-skeleton` renamed): `× Animations`, `expected 'none' to be 'pp-skeletn'`. Restored.
- Gate: typecheck + lint green; `storybook:build` succeeded; `format:check` exit 0. The index has the
  four `motion-*--docs` pages.

### Deferred specimens

| Task | Specimen                          | Needs                        |
| ---- | --------------------------------- | ---------------------------- |
| 6    | `Rhythm`; `SPACE_STEPS` type check | Section / AutoGrid / Card / StackProps (2c) |
| 8    | `FormStates`                      | Field (3a T2)                |

## Rendered MDX check

I served the built Storybook locally and opened each new docs page in headless Chromium at
1280×900. No page had page errors, console errors or horizontal overflow, and each page's Canvas
count equals its `<Canvas of>` count: display 2, headings 1, body 1, overline & mono 1, devanagari 1,
fluid 2, scale 2, layout rhythm 2, shape 4, motion 4, states 2, form states 0, section reveal 1.

## Whole batch

`pnpm nx run-many -t typecheck lint test -p storybook design-tokens ui --skip-nx-cache`:
"Successfully ran targets typecheck, lint, test for 3 projects". Results: design-tokens
`Tests 232 passed (232)`, ui `465 passed (465)`, storybook `Test Files 27 passed`,
`Tests 314 passed (314)`. The storybook figure is 235 stories (211 + 1 clipboard + 8 Type +
8 Spacing + 7 Motion) plus 79 docs-kit node specs. `format:check` exit 0; `sync:check` "All files
are up to date."; founder guard (`apps/storybook/src`, `packages/design-tokens`) clean.

## Concerns

- **Shape page overlap.** It will overlap Task 7's Radii/Borders/Elevation pages. Fold or delete
  it when Task 7 runs.
- **Structural change to `apps/storybook/vitest.config.mts`.** It now has two projects. The
  `storybookTest` `configDir` became `join(import.meta.dirname, ".storybook")`. I made it absolute
  as a precaution, because a relative path inside a project entry could resolve against another
  root. I did not test whether the relative form breaks.
- **The R61 spec reads library source with a regex** (`<prefix>-<step>` classes). A class built
  dynamically (`` `size-${x}` ``) would be invisible to it, as it would be to Tailwind. The library
  currently writes every class literally.
