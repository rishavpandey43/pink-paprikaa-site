# Batch P5-A report — Plan 5 Tasks 0, 1, 2 (R55 early foundations)

Base: 6d9104c (the dispatch named 542f891; 6d9104c is the R55/R56 docs commit on top of it — no
code). Commits: `3c888cc` (Task 1), `5b0005f` (Task 2). Task 0 made no code change → no commit.

## Task 0 — reconcile (scoped to T1–T6 + T8)

Built: `W/task-0-fold-list.md` — a pre-flight table and 11 binding items. Plan file not patched.

Pre-flight summary:

- Step 1 `pnpm nx run-many -t typecheck lint test build`: **green** — "Successfully ran targets
  typecheck, lint, test, build for 12 projects" (35 tasks; 2 lint warnings, 0 errors). Layers:
  atoms 20; molecules/organisms/layouts absent (expected at R55).
- Step 2 (scoped export list): 14 present; 20 absent, all from later plans (Alert, AutoGrid,
  DietMark, Field, KeyValueItem/List, LogoLockup, Rating, Section, SpiceLevel, Spinner,
  StackProps, StepTracker, Table×6, TrackerStep).
- Step 3: `lucide: all present` (1.30.0).
- Step 4: `{"missing":[],"empty":[],"surfaces":[],"undescribed":[]}`.
- A6 Table absent → DocTable (item 2). A16 confirmed. A17 confirmed (`max-w-article`,
  `max-w-text-measure-prose` exist; no patch). A19 confirmed for every existing atom the
  specimens use. A20 parity tables present in briefs 1–6, 8. Other A-items out of scope.

Key overlay items for P5-B/P5-C: specimens needing unbuilt components are deferred (list below);
`CompanyDetails` (Review Focus 2) uses a native `<dl>` instead of KeyValueList; Task 6 drops the
`StackProps` compile check; every group adds one R56 copy play; Task 8's `ANIMATIONS` list stays
(animations are stylesheet `@theme`, not tokens).

### Deferred specimens (unblockers)

| Task | Specimen                                                  | Needs                                                  |
| ---- | --------------------------------------------------------- | ------------------------------------------------------ |
| 3    | `ClearSpace`                                              | LogoLockup (3b T7)                                     |
| 3    | `MarkLegibility` rows SpiceLevel / Rating / Spinner       | 2b T12 / T11 / T8 (StatusDot row stays)                |
| 3    | `DiamondMotif` rows SpiceLevel / StepTracker / Rating / Spinner | 2b, 3a T19 (StatusDot row stays)                 |
| 3    | `DietAndHeat`                                             | DietMark (2b T13), SpiceLevel                          |
| 4    | `HeatScale` SpiceLevel row                                | SpiceLevel (Swatches stay)                             |
| 4    | `StatusAlerts`                                            | Alert (3a T7)                                          |
| 6    | `Rhythm`; `SPACE_STEPS` type check                        | Section / AutoGrid / StackProps (2c)                   |
| 8    | `FormStates`                                              | Field (3a T2)                                          |

## Task 1 — one contrast evaluator

Built: `packages/design-tokens/src/catalogue.ts` (`TokenEntry`); `contrast.ts` gains `AA_NORMAL`,
`CatalogueEntry`, `PolicyGroup`, `ContrastPolicy`, `ContrastVerdict`, `ContrastResult`,
`resolveColor`, `pairsOf`, `verdictOf`, `evaluateContrastPolicy`; `policy.spec.ts` replaced; package
exports `./catalogue` and `./contrast-pairs.json`.

Deviations:

- `policy.spec.ts` `readJson` returns `unknown` and the call sites cast (the brief's generic
  `readJson<T>` fails `@typescript-eslint/no-unnecessary-type-parameters`).
- Probe reverted by editing the value back and `git diff --exit-code` (fold item 1; the brief's
  `git checkout` is forbidden by the implementer contract).

Dev parity (brief table, all confirmed, nothing missed):

| Dev item                                                                  | Ruling  | Where                                                         |
| ------------------------------------------------------------------------- | ------- | ------------------------------------------------------------- |
| Measured failing-pair table (on-brand 4.04, subtle 3.78, …)               | DROP    | evaluator re-measures every pair on every build               |
| Blanket `color-contrast` off, justified by ~460 failures                  | ALREADY | preview.tsx comment; the token gate replaces it               |
| White on the brand pink passes large, fails body; brand fill non-negotiable | ALREADY | `brand-fill` groups; new spec test rates it `"exception"`   |

Evidence:

- Red: `TypeError: evaluateContrastPolicy is not a function` (policy.spec.ts).
- Green: `Test Files 4 passed (4)`, `Tests 228 passed (228)`.
- Probe (`color.text.muted` → `{color.ink.400}`): `Tests 6 failed | 222 passed (228)`,
  `color-text-muted on color-surface-page (light) = 2.21:1: expected 2.21… to be greater than or equal to 4.5`.
  Reverted (`git diff --exit-code` clean), rerun `Tests 228 passed (228)`.
- Gate: `Successfully ran targets typecheck, lint, test, build for project @pink-paprikaa-web/design-tokens`;
  `nx format:check` exit 0; `nx sync:check` "All files are up to date."

## Task 2 — Storybook plumbing and the docs-kit

Built:

- Deps: `@pink-paprikaa-web/utils` (workspace), `lucide-react` dev (one version workspace-wide,
  1.30.0); `nx sync` added the utils reference to `apps/storybook/tsconfig.json`. `serve` gains
  `dependsOn: ["^build"]`. `preview.tsx` storySort nested per the brief.
- `docs-kit/`: `token-files.d.ts`, `catalogue.ts`, `dom.ts`, `specimen.tsx`, `swatch.tsx`,
  `token-table.tsx`, `type-specimen.tsx`, `contrast-matrix.tsx`, `spacing-scale.tsx`,
  `radius-scale.tsx`, `shadow-ladder.tsx`, `motion-demo.tsx`, `docs-kit.stories.tsx`, plus
  `copy.tsx` and `doc-table.tsx` (deviations). `kits/fixtures.ts` seed (`OUTLET`, `BUILD_YEAR`,
  `ORDER_STEPS`).

Deviations:

1. **R56 (binding, owner request) — copy chips + class mapping.** `copy.tsx` generalises Swatch's
   copy: `CopyScope` (one `role="status"` "Copied …" line), `CopyButton` (named by the text it
   copies; lucide Copy→Check icon, dev parity), `CopyChips`. `catalogue.ts` adds
   `utilitiesOf(name)` (classes derived from the token's Tailwind namespace + the `styles.css`
   `@utility` names; throws on an unknown token; `[]` where no utility reads the token) and
   `stepUtilities(step)` (`p-/m-/mt-/gap-<n>`). Swatch, TokenTable (Token column), SpacingScale
   (now one row per step: bar, `N · px`, chips incl. `calc(var(--spacing) * N)`), RadiusScale,
   ShadowLadder, TypeSpecimen (size, family, weight — weight found by matching the composite's
   `fontWeight` to a `font-weight-*` token — and both CSS vars) and MotionDemo show copyable
   classes + CSS variables. Contract stories added: `UtilitiesDeriveFromTheCatalogue` (mapping per
   namespace **and** that each derived class really paints its token's value in Chromium —
   literal class strings in the story are what Tailwind scans), `CopyChipsCopyAClass`; the existing
   Swatch/TokenTable/TypeSpecimen/SpacingScale/RadiusScale/ShadowLadder/MotionDemo stories also
   assert their class chips. 13 stories (brief: 11).
2. **Native tables.** `Table*` absent → `doc-table.tsx` (`DocTable`, `DocCell`) with Plan 3b
   `Table`'s `minWidth` semantics; the focusable region uses `tabIndex={isScrollable ? 0 : undefined}`
   exactly as the 3b Table does (a literal `tabIndex={0}` fails `jsx-a11y/no-noninteractive-tabindex`).
3. **`apps/storybook` `nx.projectType: "application"`.** Nx inferred "library", so
   `enforceBuildableLibDependency` rejected `ui`/`content` imports from the app. Declared, not
   disabled.
4. `ORDER_STEPS` typed by a local `OrderStep` (fold item 5). `ContrastMatrixProps.groups` and
   `TypeSpecimenProps` optionals take `| undefined` (R13).
5. Swatch's "copied" line does not reset after 1.2s as dev's did (a timer would race the plays);
   the icon on the last-copied button turns to a check instead.

Dev parity (brief table + additions):

| Dev item                                                             | Ruling  | Where                                                    |
| -------------------------------------------------------------------- | ------- | -------------------------------------------------------- |
| `remark-gfm`, addon-a11y, addon-vitest, chromatic, docgen options    | ALREADY | Plan 1 `main.ts`, unchanged                              |
| Viewports `floor360` + breakpoints + devices; token backgrounds      | ALREADY | Plan 1 `preview.tsx`                                     |
| `a11y.test = "error"`, `color-contrast` off                          | ALREADY | Plan 1 `preview.tsx`                                     |
| storySort Foundations → Atoms → … → Templates                        | DROP    | nested 13-group order (Step 2)                           |
| Decorator `font-body text-body1 leading-body1`                       | ALREADY | `font-body text-body`                                    |
| Google Fonts `@import`                                               | DROP    | `@fontsource/*`                                          |
| `@source` over library sources                                       | ALREADY | styles.css                                               |
| Swatch reads the live value                                          | ALREADY | `catalogue.ts`, throws on a missing name                 |
| Swatch: click name/value to copy, "copied" feedback                  | ADD     | `copy.tsx` + Swatch; `SwatchCopiesNameAndValue`          |
| Swatch copy icon (copy → check)                                      | ADD     | `CopyButton` lucide `Copy`/`Check` (missed by the plan)  |
| Swatch "copied" auto-reset after 1.2s                                | DROP    | deviation 5                                              |
| Per-swatch note; auto-fit grid; Space/Radius/Shadow/type rows        | ALREADY | description line; `Swatches`; the scale helpers          |
| Duration track per step                                              | ALREADY | `MotionDemo`, keyboard toggle, label names the duration  |
| Old class names (`rounded-3`, `text-body2`, `max-w-(--…)`)           | DROP    | D4 names only                                            |

Evidence:

- Red: `Failed to resolve import "./copy" from "src/docs-kit/docs-kit.stories.tsx"` (file fails to import).
- First green attempt: 12/13 — my `UtilitiesDeriveFromTheCatalogue` probed `text-pink-500` for
  `backgroundColor`; fixed to probe each class's own property.
- Green: `docs-kit.stories` `Tests 13 passed (13)` (axe included).
- Probe (Review Focus 1), `<Swatch name="color-pink-501" />`: `× Swatch Paints Its Token`,
  `docs-kit: no token "color-pink-501" in @pink-paprikaa-web/design-tokens/tokens.json. A token was
  renamed or removed — …`, `Tests 1 failed | 12 passed`. Reverted (byte-identical).
- Probe (R56 mapping), `container-` → `w-`: `× Utilities Derive From The Catalogue`,
  `expected [ 'w-article' ] to deeply equal [ 'max-w-article' ]`. Reverted (byte-identical).
- Full `storybook:test`: `Test Files 21 passed (21)`, `Tests 188 passed (188)` (was 175).
- Gate: `Successfully ran targets typecheck, lint for project @pink-paprikaa-web/storybook`;
  `storybook:build` "Successfully ran target build" (only Vite's stock >500 kB chunk warning);
  `nx format:check` exit 0; `nx sync:check` "All files are up to date."; founder guard over
  `apps/storybook/src` "clean".

## Concerns

- `utilitiesOf` is proven to paint in Chromium only for the 11 sampled tokens (one per namespace
  family); namespaces not sampled (`aspect-`, `blur-`, `breakpoint-`, `pattern-`, `effect-`,
  `motion-`) rely on the mapping rules plus the `styles.css` names they mirror.
- Deferred specimens (table above) need a follow-up pass once their plans land; R55 accepted that
  cost.
- Named spacing tokens show `p-/m-/mt-/gap-` like the numeric steps; measure tokens are mostly used
  as `max-w-*` in practice (Task 5 prose covers that).
