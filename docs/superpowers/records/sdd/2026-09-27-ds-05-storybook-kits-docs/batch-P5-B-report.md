# Batch P5-B report — Plan 5 Tasks 3, 4 (+ carried R59)

Base `5b0005f`. Commits: `31f4173` (R59), `9fa3f5f` (Task 3), `26ba97e` (Task 4).

## Carried fix — R59 (measures map to `max-w-*` only)

Built: `catalogue.ts` → `isMeasure(entry)`: a `spacing-*` token whose value ends in `ch` maps to
`max-w-<name>` only; every other named spacing token keeps `p-/m-/mt-/gap-`. The rule reads the
token's value, not a hand-kept list. `UtilitiesDeriveFromTheCatalogue` is extended: for every `ch`
spacing token, `utilitiesOf` must equal `[max-w-<name>]` exactly (and the list must contain
`spacing-text-measure-prose`), and `max-w-text-measure-prose` must compute the same `max-width` as
an element styled `var(--spacing-text-measure-prose)`.

- Red: `expected [ 'p-social-headline-tight', …(3) ] to deeply equal [ 'max-w-social-headline-tight' ]`, `Tests 1 failed | 12 passed (13)`.
- Green: `docs-kit.stories` `Tests 13 passed (13)`; typecheck + lint green; `format:check` exit 0.
- Covered: `spacing-text-measure-prose`, `-narrow`, `spacing-social-headline-tight`, `-default`, `-wide`.

Scope note: "width-only" was derived as "a `ch` measure". The px widths `spacing-logo-*` and
`spacing-switch-width` are width-only in practice (used as `w-logo-*`, `w-switch-width`) but are
indistinguishable from other px tokens without a name list, so they still show `p-/m-/mt-/gap-`.
See Concerns.

## Task 3 — Introduction and the Brand group

Built: `docs/introduction.mdx` (replaced, brief verbatim); `foundations/brand/company-details.tsx`
(`CompanyDetails`, `pendingFacts`, `OWNER_TO_SUPPLY`), `brand.stories.tsx` (11 specimens),
`logo.mdx`, `pattern.mdx`, `company-details.mdx`, `voice-and-content.mdx`, `iconography.mdx`.

Deviations:

1. **Fold item 4 — native `<dl>`.** `KeyValueList`/`KeyValueItem` absent → a local `FactList`
   (`<dl>` of `<div>`/`<dt>`/`<dd>`, token classes) over a local `FactItem { key; value }` (the
   `KeyValueItem` shape). Swap when 3b T13 lands. Play unchanged.
2. **Fold item 3 — deferred specimens** (table below): `ClearSpace` and `DietAndHeat` stories and
   their `<Canvas of>` removed (prose kept); `MarkLegibility` and `DiamondMotif` keep only the
   StatusDot row, with a one-line comment naming the deferred rows. Unused imports/consts
   (`SIZES`, `LEVELS`, `ORDER_STEPS`, the absent components) dropped.
3. **Fold item 8 — R56 copy play** on `PatternTokens`: clicks the `pattern-opacity-faint` chip
   (from `utilitiesOf`), asserts the clipboard write and the "Copied …" status.
4. `fact()` uses `value ?? <Badge…>` (the brief's `=== null ? … : value` fails
   `@typescript-eslint/prefer-nullish-coalescing`).

Dev parity (brief table; nothing extra found in `git show dev:packages/ui/src/docs/{introduction,voice-and-accessibility}.mdx` beyond it):

| Dev item                                                                                                  | Ruling        | Where                                                              |
| --------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------ |
| Intro hero: flooded pink panel, overline, display title, tagline, "pink is the whole identity"            | ADD / DROP    | line added as intro prose; hand-classed panel dropped              |
| "What this is": pure-veg café, Sector 57 / MKM Market                                                     | ALREADY       | Brand → Company details binds the outlet from content              |
| Personality: loud, warm, young, city-street; one pink, warm neutrals, one accent                          | ADD           | intro                                                              |
| Layer table + imports only go downward                                                                    | ADD           | intro "How it fits together"                                       |
| Barrel import + two-line CSS contract                                                                     | ALREADY       | intro "Consume it"                                                 |
| What `styles.css` pulls in                                                                                | ADD           | intro "Consume it" (7 animations — verified: 7 `@keyframes`)       |
| Stock Tailwind classes do not exist                                                                       | ADD           | intro (named tokens `shadow-2`, `text-body-sm`, … verified exist)  |
| "Before you add a component"                                                                              | ADD           | intro "For authors"                                                |
| Voice rows, casing, numbers, labels, no emoji, one "!", never-say, veg once                               | ALREADY       | `voice-and-content.mdx`                                            |
| **Pink Paprikaa** — two `a`s                                                                              | ADD           | `voice-and-content.mdx` Rules                                      |
| axe in every story, `a11y.test = "error"`                                                                 | ADD           | intro "Accessibility"                                              |
| Guarantees (focus ring, 44px, disabled fill, native/Radix, reduced motion)                                | ADD           | intro "Accessibility"                                              |
| Each use owns: name, never colour alone, heading order                                                    | ADD           | intro                                                              |
| `text-muted` only on light grounds                                                                        | ADD (adapted) | intro: `data-surface` remaps; Colors → Contrast lists the pairs    |

Deferred specimens:

| Specimen                                             | Needs                                   |
| ---------------------------------------------------- | --------------------------------------- |
| `ClearSpace` (story + Canvas)                        | LogoLockup (3b T7)                      |
| `MarkLegibility` rows SpiceLevel / Rating / Spinner  | 2b T12 / T11 / T8                       |
| `DiamondMotif` rows SpiceLevel / StepTracker / Rating / Spinner | 2b, 3a T19                   |
| `DietAndHeat` (story + Canvas)                       | DietMark (2b T13), SpiceLevel (2b T12)  |

Evidence:

- Red: `Failed to resolve import "./company-details" from "src/foundations/brand/brand.stories.tsx"`.
- First green attempt: `× Company Facts` after "[vitest] Vite unexpectedly reloaded a test" (cold
  dep optimisation — the known trap); rerun `Tests 1 passed (1)`.
- Probe (Review Focus 2), `ifsc` row deleted: `expected [ <span …(1)></span>, …(4) ] to have a length of 6 but got 5`, `Tests 1 failed (1)`. Restored (`cmp` byte-identical).
- Gate: `Successfully ran targets typecheck, lint for project @pink-paprikaa-web/storybook`;
  `brand.stories` `Tests 11 passed (11)` (13 − 2 deferred); `storybook:build` succeeded;
  `format:check` exit 0. Built index has `introduction--docs` and the five `brand-*--docs` pages.

## Task 4 — Colors group and the Contrast page

Built: `foundations/colors/colors.stories.tsx` (12 specimens) and `primary`, `ink`, `accents`,
`heat`, `semantic`, `surfaces`, `status`, `contrast` `.mdx` (brief verbatim bar deferrals).

Deviations:

1. **Fold item 3:** `HeatScale` is the heat Swatches only (SpiceLevel row deferred);
   `StatusAlerts` story and its `<Canvas of>` in `status.mdx` removed. `Alert`, `SpiceLevel`,
   `LEVELS` imports/consts dropped.
2. **Fold item 8 — R56 copy play** on `PinkRamp`: clicks each of `utilitiesOf("color-pink-500")`
   (`bg-/text-/border-pink-500`) and asserts each clipboard write.
3. Prose claims checked against `tokens.json`: `text-brand → pink.600`, `text-success → mint-strong`,
   `text-warning → turmeric-strong`, `text-subtle → ink.600`, `heat-4 → pink.600` — all true.

Dev parity (brief table, all confirmed; nothing missed):

| Dev item                                                          | Ruling  | Where                                              |
| ----------------------------------------------------------------- | ------- | -------------------------------------------------- |
| One primary at full strength; soft pink does the calm work        | ALREADY | `primary.mdx`                                      |
| Click any swatch name or value to copy it                         | ADD     | Task 2 `Swatch` + `PinkRamp` play (classes too)    |
| Neutrals warm, never blue-grey                                    | ALREADY | `ink.mdx`                                          |
| One spice accent per screen; two backgrounds per composition      | ALREADY | `accents.mdx`                                      |
| Only two gradients, both scrims                                   | ALREADY | `accents.mdx`                                      |
| Brand swatches with notes                                         | ALREADY | `PinkRamp` + `SemanticTokens` "Interaction"        |
| Surface swatches                                                  | ALREADY | `SemanticTokens` "Surfaces" + `FourGrounds`        |
| "`text-text-heading`, not `text-heading`"                         | ADD     | `semantic.mdx`                                     |
| Border swatches                                                   | ALREADY | `SemanticTokens` "Borders"                         |
| Status pairs; never colour without a message                      | ALREADY | `status.mdx` (Alert specimen deferred)             |
| Heat in order, only `SpiceLevel`                                  | ALREADY | `heat.mdx` (SpiceLevel row deferred)               |
| Primitives: prefer a semantic token                               | ALREADY | `semantic.mdx`                                     |
| August token names                                                | DROP    | D4                                                 |

Deferred specimens:

| Specimen                    | Needs              |
| --------------------------- | ------------------ |
| `HeatScale` SpiceLevel row  | SpiceLevel (2b T12) |
| `StatusAlerts`              | Alert (3a T7)      |

Evidence:

- `colors.stories` first run `Tests 12 passed (12)` (brief: acceptable — the Review Focus 4 test is
  proved by the probe).
- Probe (Review Focus 4), verdict Badge → `{VERDICT_LABEL.pass}`: `× Contrast Matrix Rates Each Pair`,
  `× Contrast`, `Unable to find an element with the text: Exception — brand fill, AA-large`,
  `Tests 2 failed | 23 passed (25)`. Reverted (`git diff --exit-code` clean); rerun `Tests 25 passed (25)`.
- Gate: typecheck + lint "Successfully ran targets typecheck, lint"; `storybook:build` "Successfully
  ran target build"; `format:check` exit 0; `sync:check` "All files are up to date."
- Built index has all eight `colors-*--docs` pages.

## Rendered MDX check (both tasks)

The static build served locally and each docs page opened in headless Chromium (Playwright): no
page errors, no console errors, no horizontal overflow at the default viewport, and the Canvas
count per page equals its `<Canvas of>` count — logo 5, pattern 3, company details 1,
iconography 2, primary 1, ink 1, accents 2, heat 1, semantic 2, surfaces 3, status 1, contrast 1
(Introduction and Voice & content have none). No visual screenshot review was done.

## Whole-suite

`pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache`: `Test Files 23 passed (23)`,
`Tests 211 passed (211)` (was 188: +11 Brand, +12 Colors). Founder guard over `apps/storybook/src`: clean.

## Concerns

- R59 covers `ch` measures only. `spacing-logo-*` and `spacing-switch-width` (px widths, used as
  `w-*`) still show `p-/m-/mt-/gap-` chips in Brand → Logo's `LogoTokens` table. Mapping them needs a
  ruling (a `w-*` rule, or a width marker in the token description/`$extensions`), since a name list
  would break R56's "derived, not hand-typed".
- Deferred specimens (tables above) need the follow-up pass after 2b/3a/3b land.
