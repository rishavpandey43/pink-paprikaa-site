# Batch F report — Task 13 StatusDot, Task 14 Avatar

Base `a6008b4`. Commits: `d20811a` (StatusDot), `4443700` (Avatar), `5a9b82d` (docs: plan re-sort).

---

## Task 13: StatusDot (`d20811a`)

### What I built

- `tokens/component/status-dot.json`: `spacing.status-dot-{sm,md}` (14/16px), `text.status-dot-label`
  (13.5px, medium) and, per the CONTROLLER DELTA / overlay item 4, **`radius.diamond` (2px)**, not
  `radius.status-dot`. Its description names it as the corner of every small brand diamond
  (StatusDot, Plan 2b's brand-diamond).
- `component-variants.ts`: `TEXT` += `status-dot-label`, `RADIUS` += `diamond`, `SPACING` +=
  `status-dot-sm`, `status-dot-md`.
- `atoms/status-dot/status-dot.{tsx,test.tsx,stories.tsx}` plus the barrel export (between
  SocialHeadline and Tag).
- Built theme.css has `--spacing-status-dot-sm: 14px`, `--spacing-status-dot-md: 16px`,
  `--text-status-dot-label: 13.5px` with `--font-weight: 500`, and `--radius-diamond: 2px`.

### Deviations

1. **CONTROLLER DELTA.** The token is `radius.diamond` and the class `rounded-diamond`, in both the
   pulse and diamond slots. The diamond test uses `rounded-diamond` and
   `querySelector(".mask-symbol")` where the brief had `svg` (overlay item 3).
2. **Token placement.** `radius.diamond` lives in `component/status-dot.json`, since the ruling says
   it is created in StatusDot's task. It is a shared value, so moving it to `primitive/shape.json`
   later would be defensible. That is the controller's call.
3. **R13 (overlay 1).** `tone`, `label`, `isPulsing` and `size` are all `| undefined`.
4. **Prettier re-sorts.** In `pulse`, `rounded-diamond` moved after `animate-dot-pulse` (it had been
   first). In `diamond`, it was also reordered. In `label`, the order became
   `font-body text-status-dot-label text-text-body`. The new tokens register these as known
   utilities, and the plugin sorts them.
5. **Plan-doc side effect.** The new `status-dot-label` token made Prettier re-sort one class string
   in the plan's Task 13 code block (line 6919), which failed `nx format:check`. I fixed it in a
   separate one-line commit, `5a9b82d`, following the pattern of controller commit `a6008b4`.
   Nothing else in the plan changed.
6. The commit body adds one sentence noting the shared `radius-diamond` token.

### Dev parity

| Dev item                                                                                                                  | Ruling  | Where / reason                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------- |
| Sizes `xs`/`sm`/`md`/`lg`                                                                                                 | DROP    | contracts §2 (`sm`/`md`; plan deviation 4)                                                        |
| The whole dot throbs (`animate-pp-pulse`)                                                                                 | ALREADY | the pulse ring (`animate-dot-pulse`), hidden under reduced motion                                 |
| A bare danger dot is named "Unavailable"                                                                                  | ALREADY | named "Attention"; a bare dot is always named                                                     |
| `rounded-1`, `size-2…5`, `text-body2`                                                                                     | DROP    | D4; `status-dot-*` tokens + shared `rounded-diamond`                                              |
| Tests: label beside the dot, dot hidden when labelled, bare dot named by tone, tones, diamond, pulse only when asked, axe | ALREADY | Step 2                                                                                            |
| Test: caller className replaces the gap                                                                                   | ADD     | done                                                                                              |
| Story `Tones` includes a labelled `danger`                                                                                | ADD     | done                                                                                              |
| Story `Sizes` (labelled dots side by side)                                                                                | ADD     | done                                                                                              |
| Stories `Default`, `Live`, `Bare`                                                                                         | ALREADY | `Playground`, `Pulse`, `Bare`                                                                     |
| Story `OutletStrip`                                                                                                       | ADD     | done                                                                                              |
| _Missed by the plan:_ dev `Omit<…, "color">` + `extends VariantProps`                                                     | DROP    | contracts §2 is `extends ComponentProps<"span">`; the Props rule bans `VariantProps`              |
| _Missed by the plan:_ dev put the role/label on the inner dot, not the root                                               | DROP    | the brief puts `role="img"` on the root so a consumer `aria-label` overrides it (tested)          |
| _Missed by the plan:_ the dev dot was a flat fill with no brand mark inside                                               | ALREADY | readme §3.4: the counter-rotated `SymbolMark` (`mask-symbol`) inside, tested                      |

### Gate

```
pnpm exec prettier --write packages/ui/src/atoms/status-dot packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/status-dot.json
  → status-dot.tsx re-sorted; everything else unchanged
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
  → design-tokens Tests 188 passed (4 files); ui Test Files 22 passed, Tests 362 passed;
    "Successfully ran targets typecheck, lint, test for 2 projects and 2 tasks they depend on"
pnpm nx run @pink-paprikaa-web/storybook:build → exit 0
```

Red step: `Failed to resolve import "./status-dot"`. The index.spec folder/barrel checks also
failed, as expected.

---

## Task 14: Avatar (`4443700`)

### What I built

- `tokens/component/avatar.json` verbatim: `spacing.avatar-{xs..xl}`, `text.avatar-{xs..xl}` and
  `shadow.avatar-ring`. The built value is
  `--shadow-avatar-ring: 0 0 0 2px #FFFFFF, 0 0 0 4px #EE2C68;`, resolved in `dist/` only.
- `contrast-pairs.json`: an `avatar` group (pink-700 on pink-100, min 4.5). Tokens tests went from
  188 to 189.
- `component-variants.ts`: `TEXT` and `SPACING` += the five `avatar-*` names, and `SHADOW` +=
  `avatar-ring`.
- `atoms/avatar/avatar.{tsx,test.tsx,stories.tsx}` plus the barrel export (first, before Badge).

### Deviations

1. **R13 (overlay 1).** `name`, `src`, `size`, `icon` and `hasRing` are all `| undefined`.
2. No Prettier re-sorts. The code is verbatim from the brief, apart from item 1.
3. The union and R35 do not apply. Avatar has no image/fallback union: `src` is layered over the
   initials. `...props` is spread on the root after the computed a11y attributes, as the brief
   specifies.
4. Story `Photo` imports `../../assets/brand/symbol-pink.svg`, which ruling R46 permits.

### Dev parity

| Dev item                                                              | Ruling  | Where / reason                                                                                                                                       |
| --------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Radix `Avatar` + `"use client"`                                       | DROP    | D6/D7 (Radix only for Dialog/Sheet, Tabs, Tooltip, Toast, ToggleGroup and Slot)                                                                      |
| The initials stay up while the photo loads, and for good if it fails  | ADD     | done: photo layered `absolute inset-0` over the initials, server-safe; photo test                                                                    |
| The photo carries the name as `alt`                                   | ALREADY | the root is `role="img"` named by `name`; the photo is presentational (`alt=""`)                                                                     |
| A glyph wins over a name                                              | ALREADY | `icon ? … : initials`; ADD test for `icon` + `name`: done                                                                                            |
| Ring as `ring-2 ring-offset-2`, never a border                        | ALREADY | `shadow-avatar-ring` (two box-shadows, no border)                                                                                                    |
| `size-6…20`, `rounded-6`, `text-h3`                                   | DROP    | D4; `avatar-*` tokens                                                                                                                                |
| `select-none` on the root                                             | ADD     | done (root slot; className test)                                                                                                                     |
| Tests: one-, two- and three-word initials, sizes, ring, circular, axe | ALREADY | Step 2                                                                                                                                               |
| Test: caller className replaces the radius                            | ADD     | done                                                                                                                                                 |
| Stories `Default`, `Sizes`, `Initials`, `GlyphFallback`, `Ring`       | ALREADY | `Playground`, `Sizes`, `Initials`, `IconFallback`, `Ring`                                                                                            |
| Story `Photo` (with the failed-photo fallback)                        | ADD     | done                                                                                                                                                 |
| Story `InAReviewRow`                                                  | ADD     | `InAGuestRow` (no review copy: spec §10.1 bars fabricated testimonials)                                                                              |
| _Missed by the plan:_ dev `Omit<…, "children">`                       | DROP    | contracts §2 is `extends ComponentProps<"span">`. A passed `children` loses to the explicit JSX children, so it is inert. Same for StatusDot         |
| _Missed by the plan:_ dev ring offset was `ring-offset-surface-card`  | DROP    | the design system's ring is fixed white (`ink-000`) + pink-500, a fixed-primitive skin per the surfaces rule                                         |
| _Missed by the plan:_ dev initials used `charAt(0)` (UTF-16 unit)     | ALREADY | code-point safe (`Array.from(word)[0]`), with a Devanagari test                                                                                     |
| _Missed by the plan:_ dev typed `icon` as `LucideIcon`                | DROP    | `IconComponent` (lucide + brand glyphs)                                                                                                              |

### Gate

```
pnpm exec prettier --write packages/ui/src/atoms/avatar packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/avatar.json packages/design-tokens/contrast-pairs.json
  → all unchanged
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
  → design-tokens Tests 189 passed (4 files); ui Test Files 23 passed, Tests 381 passed;
    "Successfully ran targets typecheck, lint, test for 2 projects and 2 tasks they depend on"
pnpm nx run @pink-paprikaa-web/storybook:build → exit 0
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache → Test Files 15 passed, Tests 127 passed
  (status-dot.stories 6 tests, avatar.stories 7 tests, chromium)
```

Red step: `Failed to resolve import "./avatar"`.

---

## Extra checks

- `pnpm nx format:check` exits 0 after `5a9b82d`.
- `pnpm guard:founder` reports "Founder-name guard: clean."
- lint-staged ran on each commit. The tree is clean.
- I did not need the TS2322 `ElementType` cast, and `dist` produced no phantom errors.

## Concerns

- The plan's Task 13 code block still says `rounded-status-dot` / `radius.status-dot` (the delta
  overrides it). Plan hygiene is left to the controller.
- Avatar's ring is fixed white + pink. On a pink field (`data-surface="brand"`), the outer pink ring
  merges into the field. The design gives no on-brand ring, so I have not changed it.

---

## Fix round 1 (`0231f72`, `e0485e7`, `ecbcad1`)

1. **R47, `0231f72` fix(tokens).** I moved `radius.diamond` (2px, $description kept) out of
   `tokens/component/status-dot.json` and into `tokens/primitive/shape.json`, after `pill`. The
   class is still `rounded-diamond`, and `diamond` is still in componentVariants `RADIUS`. The built
   theme.css has `--radius-diamond: 2px;`. The `twMergeConfig` spec still matches the catalogue.
2. **Blank label, `e0485e7` fix(ui).** `status-dot.tsx` now sets
   `const hasLabel = label !== undefined && label.trim() !== ""` and uses it both for the bare-name
   (`role="img"` + tone name) branch and for the label span. New test:
   "treats a blank label as no label, so the dot is still named by its tone" (`label="   "` gives
   role img named "Busy", and the root has one child, so no label span).
3. **Plan hygiene, `ecbcad1` docs.** In Task 13 of the plan:
   - Files adds "Modify `primitive/shape.json`". Produces lists `radius-diamond` (primitive).
   - Step 1 replaces the "if found" note with the `shape.json` `radius.diamond` snippet (R19, R47),
     and removes the `radius` block from the component JSON.
   - RADIUS += `"diamond"`, and the expected theme.css now shows `--radius-diamond: 2px;`.
   - In the test, `rounded-diamond` replaces `rounded-status-dot`, `.mask-symbol` replaces `svg`,
     and the blank-label test is added.
   - Implementation: the pulse and diamond slots use `rounded-diamond` (in Prettier order), with
     `hasLabel`.
   - The R19 amendment line now says "in `primitive/shape.json` (R47)".
   - Line 159 (Task 0's historical pre-flight wording) is unchanged.

### Commands

```
pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- status-dot
  → Test Files 1 passed (1); Tests 21 passed (21)
pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
  → design-tokens Tests 189 passed (4 files); ui Test Files 23 passed, Tests 382 passed;
    "Successfully ran targets typecheck, lint, test for 2 projects and 2 tasks they depend on"
pnpm nx format:check → exit 0
```
