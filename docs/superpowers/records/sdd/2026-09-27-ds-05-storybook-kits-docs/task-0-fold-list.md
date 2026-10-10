# Plan 5 — Task 0 fold list (BINDING OVERLAY, R43 style)

Scope (R55): only what Tasks 1–6 and 8 consume. Base 6d9104c (dispatch said 542f891; 6d9104c is the
R55/R56 docs commit on top of it, no code). The plan file is NOT patched; these items override the
briefs. Checks on components from Plans 2b (batch D+), 2c, 3a, 3b and 4 are skipped, not failed —
what they would block is deferred below.

## Pre-flight

| Check                                             | Result                                                                                                                                                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Step 1 — `run-many -t typecheck lint test build`  | green, 12 projects, 35 tasks (2 lint warnings, 0 errors). Layer counts: atoms 20, molecules/organisms/layouts absent (expected for R55; the plan's 30/38/15/7 is the post-Plan-4 figure)                 |
| Step 2 — exports T1–6+8 use (scoped list)         | present: Badge BadgeProps Button Card Icon InstagramGlyph LinkedinGlyph YoutubeGlyph Input Logo PatternField RevealObserver StatusDot Text. Absent (not built yet): see item 3                          |
| Step 3 — Lucide names                             | `lucide: all present` (lucide-react 1.30.0)                                                                                                                                                             |
| Step 4 — token names/prefixes/surfaces/shadow doc | `{"missing":[],"empty":[],"surfaces":[],"undescribed":[]}`                                                                                                                                              |
| A6 Table                                          | absent (Plan 3b T20) → item 2                                                                                                                                                                           |
| A16 preview                                       | `floor360` present, `a11y.test = "error"`, storySort = Plan 1's flat 14-group order (Task 2 Step 2 nests it)                                                                                            |
| A17 containers                                    | `container-article` and `spacing-text-measure-prose` exist → `max-w-article`, `max-w-text-measure-prose` as the plan writes them; no patch                                                              |
| A19 optional props                                | every atom the T3–T8 specimens pass props to (Logo, PatternField, Text, StatusDot, Icon, Card, Badge, Button, Input) types optionals `?: T \| undefined` or via `VariantProps`; no fix                 |
| A20 dev parity tables                             | present in briefs 1, 2, 3, 4, 5, 6, 8                                                                                                                                                                   |
| A1–A5, A7–A15, A18, A21                           | out of scope (kits, form pattern, Tasks 7, 9–13) — re-run in the later Task 0 pass after Plan 4                                                                                                         |

## Items

1. **Task 1, probe revert.** Step 5 reverts `tokens/semantic/color.json` with `git checkout` — the
   implementer contract forbids `checkout --`. Revert by editing the value back, then show
   `git diff --exit-code` on the file.
2. **Task 2, `TokenTable` / `ContrastMatrix`.** `Table*` (Plan 3b T20) does not exist. Both render
   through `docs-kit/doc-table.tsx` (`DocTable`/`DocCell`): a native `<table>` with a `<caption>`
   (token classes only), with Plan 3b `Table`'s `minWidth` semantics — a non-`"none"` width wraps
   it in a focusable region named by the caption (`scrollable-region-focusable`). Row/caption
   semantics are the plan's, so plays querying `role="table"` by name, `role="row"` and
   `data-verdict` work unchanged. Swap `DocTable` for `Table` when 3b T20 lands.
3. **Specimens that need an unbuilt component are deferred, not stubbed.** Build every other
   specimen; drop the deferred story (or only the named row) and its `<Canvas of>` from the MDX,
   keep the prose; list each in the batch report under "Deferred specimens" with its unblocker.
   - Task 3: `ClearSpace` (LogoLockup, 3b T7); `MarkLegibility` rows SpiceLevel/Rating/Spinner
     (2b T12/T11/T8) — StatusDot row stays; `DiamondMotif` rows SpiceLevel/StepTracker/Rating/
     Spinner (2b, 3a T19) — StatusDot row stays; `DietAndHeat` (DietMark 2b T13, SpiceLevel).
   - Task 4: `HeatScale`'s SpiceLevel row (Swatches stay); `StatusAlerts` (Alert, 3a T7).
   - Task 6: `Rhythm` (Section/AutoGrid, 2c T5/T6).
   - Task 8: `FormStates` (Field, 3a T2) — Input without Field has no label and fails axe.
4. **Task 3, `CompanyDetails` (Review Focus 2) is not deferred.** `KeyValueList`/`KeyValueItem`
   (3b T13) are absent: render each fact box as a native `<dl>` (`<dt>`/`<dd>`, token classes)
   with the same `FactBox` data; `Badge`, `Card`, `Text` exist. The play is unchanged. Swap to
   `KeyValueList` when 3b T13 lands.
5. **Task 2, `kits/fixtures.ts`.** `TrackerStep` (3a T19) is absent: type `ORDER_STEPS` with a
   local `interface OrderStep { label: string; note: string }` (same shape). Retype to
   `TrackerStep` when 3a lands. Its only consumer (`DiamondMotif` StepTracker row) is deferred.
6. **Task 6, `SPACE_STEPS`.** `StackProps` / `lib/space.ts` (2c T1/T3) are absent: keep the list,
   drop `satisfies readonly SpaceStep[]` and `_isEveryStepShown`; re-add both when 2c lands.
7. **R56 — Task 2 builds the copy mechanism and the class mapping** (deviation, rationale R56):
   - `docs-kit/copy.tsx`: `CopyScope` (owns the `role="status"` "Copied …" line), `CopyButton`
     (a button whose accessible name is the text it copies), `CopyChips` (a scope of buttons for a
     list of strings). `Swatch` is rebuilt on it; the scale components use it.
   - `catalogue.ts` → `utilitiesOf(name)`: the utility class(es) a token produces, derived from its
     name's Tailwind namespace (colour → `bg-/text-/border-`, `radius-` → `rounded-`, `shadow-`,
     `text-`, `font-`, `font-weight-` → `font-`, `duration-`, `ease-`, `z-`, `container-` →
     `max-w-`, `aspect-`, `blur-`, `breakpoint-` → `<bp>:`, named spacing → `p-/m-/mt-/gap-`,
     `border-width-` → `border-<name>` + the numeric width from its value, `pattern-*`,
     `effect-scrim-*` → `scrim-*`); `[]` for tokens with no utility (canvas sizes, reveal
     distance). `stepUtilities(step)` gives `p-/m-/mt-/gap-<n>` for the 4px scale.
   - Every scale shows the class chips and the CSS custom property as copy buttons: `Swatch`,
     `TokenTable` (Token column), `SpacingScale`, `RadiusScale`, `ShadowLadder`, `TypeSpecimen`,
     `MotionDemo`. Contract stories in `docs-kit.stories.tsx`.
8. **R56 in Tasks 3–8 (P5-B / P5-C).** Each group's specimen file adds one play that clicks one
   class chip and asserts the clipboard write (spy as in `SwatchCopiesNameAndValue`). Plays that
   look up a token's text in a `TokenTable` keep working: the CSS variable is still the button's
   exact text.
9. **Task 8, `ANIMATIONS`.** Animations are `@theme` entries in `packages/ui/src/styles.css`, not
   tokens — `tokens.json` has no `animate-*`. Keep the plan's list (its play already fails a
   renamed utility via `animationName`) and render each utility name through `CopyChips`.
10. **Task 3/8 `lucide-react`.** Installed into `apps/storybook` in Task 2 Step 1 (also used by
    `CopyButton`'s copy/check icon — dev parity).
11. **Found in Task 2: `apps/storybook` is declared `nx.projectType: "application"`.** Nx inferred it
    as a library, so `enforceBuildableLibDependency` rejected every import of `ui`/`content` from
    `apps/storybook/src` ("Buildable libraries cannot import … non-buildable libraries"). It is
    tagged `type:app`; the declaration makes Nx agree. Tasks 3–15 inherit it.
