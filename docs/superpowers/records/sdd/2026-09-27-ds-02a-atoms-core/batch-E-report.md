# Batch E report: Tasks 10 (Divider), 11 (ImageSlot), 12 (Badge)

Base `a22e287`, branch `feat/design-system`. One commit per task, no `--no-verify`, no eslint-disable, no subagents.

| Task | Commit    | Subject                                                                 |
| ---- | --------- | ----------------------------------------------------------------------- |
| 10   | `fb2afdd` | feat(ui): add the Divider atom with the diamond section break           |
| 11   | `72b8c0d` | feat(ui): add the ImageSlot atom, a real image or a named placeholder   |
| 12   | `0593701` | feat(ui): add the Badge atom, seven tones of uppercase status marker    |

Test counts: ui 295 (base, before the divider test) → 303 → 328 → 342; design-tokens 177 → 180 → 188.

---

## Task 10: Divider (`fb2afdd`)

### What I built

- `packages/design-tokens/tokens/component/divider.json`: `spacing.divider-mark` (16px) and `color.divider.mark` (pink-500), verbatim.
- Surface skin: `divider.mark` goes to `{color.ink.000}` in `surface/brand.json` and `surface/ink.json`, and back to `{color.pink.500}` in `surface/light.json`. Each is one line at the end of the surface's `color` block, so the diff is 2+/1- per file.
- `component-variants.ts` `SPACING` += `"divider-mark"`.
- `atoms/divider/divider.{tsx,test.tsx,stories.tsx}`, plus the barrel export (alphabetical, after Card).
- `contrast-pairs.json` is unchanged, as the brief says.

### Deviations

1. **Controller delta (mask span).** The diamond test queries `rule.querySelector(".mask-symbol")`, not `svg`. I also added `expect(rule.querySelector("svg")).toBeNull()`, which pins that there is no inline SVG (R19).
2. **R13 (overlay 1).** `variant`, `label` and `orientation` are declared as `?: … | undefined`.
3. **Prettier re-sort.** The mark slot `"size-divider-mark text-divider-mark shrink-0 opacity-90"` became `"size-divider-mark shrink-0 text-divider-mark opacity-90"`.
4. Everything else is verbatim from the brief.

### Dev parity

| Dev item                                                                           | Ruling  | Where / reason                                                                                              |
| ---------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| A labelled divider is a plain row of decorative rules, so the label stays readable | ALREADY | the label names the separator (`aria-label`), plan deviation 4                                              |
| `on="brand"` (white 30% rule, white label and mark)                                | DROP    | D5: `border-subtle`, `text-subtle` and `color-divider-mark` follow the surface; Task 15 accepts 22%         |
| Radix `Separator` + `"use client"`                                                 | DROP    | D6/D7: a native `role="separator"` needs no JS                                                              |
| `min-w-0` rules, so a long label cannot push them out                              | ALREADY | the rules are empty `flex-1` spans (zero min-content width)                                                 |
| `diamond` ignores `label`                                                          | ALREADY | the label names the diamond break without printing it                                                       |
| Tests: hairline + separator role, overline caps, two rules, decorative mark, axe   | ALREADY | test file                                                                                                   |
| Test: caller className replaces the rule colour                                    | ADD     | done ("lets a consumer className replace the rule colour")                                                  |
| Stories `Default`, `Variants`                                                      | ALREADY | `Line`, `Label`, `Diamond`                                                                                  |
| Story `OnBrand` includes the plain line                                            | ADD     | done (`OnBrand`: line, label "Company", diamond)                                                            |
| Story `BetweenMenuRows`                                                            | ADD     | done                                                                                                        |
| _Missed by the plan:_ dev used the `Text` atom for the label                       | DROP    | an atom may import only Icon among atoms; the label is a span with the token classes                        |
| _Missed by the plan:_ dev inlined `SYMBOL_PATHS` svg for the mark                  | DROP    | R19/R25: `SymbolMark` mask span, `var(--pp-symbol-mask)`                                                    |

### Gate

```
pnpm exec prettier --write packages/ui/src/atoms/divider packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens
  → divider.tsx re-sorted (above); every other file unchanged
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
  → exit 0; design-tokens Test Files 4 passed, Tests 177 passed; ui Test Files 19 passed, Tests 303 passed;
    "Successfully ran targets typecheck, lint, test for 2 projects and 2 tasks they depend on"
pnpm nx run @pink-paprikaa-web/storybook:build → exit 0
```

The red step failed as expected: `Failed to resolve import "./divider"`. The built CSS has `--spacing-divider-mark: 16px`, `--color-divider-mark: var(--color-pink-500)` on `:root`, `var(--color-ink-000)` in the brand and ink blocks, and pink-500 in the light block.

---

## Task 11: ImageSlot (`72b8c0d`)

### What I built

- `tokens/component/image-slot.json`: `text.image-slot-label` (10.5px / 0.12em / bold, no line height), verbatim. The build emits `--text-image-slot-label` plus its `--letter-spacing` and `--font-weight`.
- A `contrast-pairs.json` group `image-slot` with the three placeholder pairs at min 4.5. It adds 3 passing tests (177 → 180).
- `TEXT` += `"image-slot-label"`.
- `atoms/image-slot/image-slot.{tsx,test.tsx,stories.tsx}`, plus the barrel export `ImageSlot, type ImageSlotBase, type ImageSlotProps` (after IconButton/Icon, before Link).

### Deviations

1. **R35 (overlay 5).** `ImageSlotBase extends Omit<ComponentProps<"div">, "children" | "role" | "aria-label">`. The explicit `className` is gone (it is inherited), and the rest props spread on the root. The brief's implementation read everything off `props`, so it had to be restructured to keep the image-only keys (`src`, `alt`, `width`, `height`, `sizes`, `srcSet`, `loading`, `fetchPriority`, `label`) off the `<div>`:
   - The base props are destructured in the signature.
   - The function then branches on `props.src !== undefined`. Each branch destructures its own union member and spreads `...rest` onto the root. TypeScript cannot destructure `alt` across both union members.
   - The discarded keys are named `label: _label` in the photo branch and `src: _src` in the placeholder branch. That is the repo's `varsIgnorePattern: "^_"`, and naming-convention allows a leading underscore.
   - `loading` defaults through `loading = "lazy"` in the destructure, not `?? "lazy"`.
   - The behaviour is unchanged: children win over both the img and the label, and `role="img"` + `aria-label` appear only when it is a placeholder with no children.
2. **R35 test (added).** "forwards native div props to the root, as a placeholder and as a photo (R35)". It checks that `id` and `data-testid` reach the root div in both branches, that the placeholder root is still the `role="img"` element, and that the photo's `<img>` is the root's child.
3. **R13 (overlay 1).** `ratio`, `radius`, `tone`, `isFill` and `children` are `| undefined`, and so are the photo branch's optionals `sizes`, `srcSet`, `loading` and `fetchPriority`. `label?: never` stays as it is: `never` already admits only `undefined`.
4. **Prettier re-sort.** The label slot `"text-image-slot-label px-3 text-center font-display text-balance uppercase"` became `"px-3 text-center font-display text-image-slot-label text-balance uppercase"`.
5. The stories import `../../assets/brand/symbol-pink.svg`. This is the first `.svg` module import in `packages/ui`. It typechecks and lints clean, and Storybook emits `symbol-pink-*.svg`.

### Dev parity

| Dev item                                                                                                     | Ruling  | Where / reason                                                                                  |
| ------------------------------------------------------------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------- |
| `label` defaults to "Dish photo"                                                                             | DROP    | D9 (no content defaults); a placeholder requires `label` (contracts §2)                         |
| The placeholder is not announced                                                                             | ALREADY | the plan names it (`role="img"` + `label`), so the crop brief is not silent                     |
| `alt` defaults to `""`                                                                                       | ALREADY | `alt` is required; a decorative photo passes `alt=""` explicitly                                |
| Arbitrary `aspect-[4/3]`; radius `thumb`/`card`/`sheet`; labels pink-400 / pink-700 / ink-500                | DROP    | AUTHORING §6 (aspect tokens); contracts §2 radius enum (D4); spec §5.3 re-pointing              |
| `isFullHeight` drops the ratio                                                                               | ALREADY | `isFill` (`aspect-auto h-full`, exactly one aspect class, tested)                               |
| The caption is dropped once a photo is given                                                                 | ALREADY | the union forbids `label` with `src` (`label?: never`)                                          |
| Native `div` props (`id`, `data-*`, `ref`, `aria-*`) forwarded to the root                                   | ADD     | **done under R35** (contracts §2 amended); new R35 test                                         |
| Tests: placeholder, photo + `object-cover`, ratios, no collapse, tones, radii, fill, className override, axe | ALREADY | test file                                                                                       |
| Stories `Default`, `Tones`, `Radii`, `NamingTheCrop`, `FullHeight`                                           | ALREADY | `Playground`, `Tones`, `Radii`, `Label`, `Fill`                                                 |
| Story `Ratios` shows 4:5 and 21:9 too                                                                        | ADD     | done (`Ratios`, all seven)                                                                      |
| _Missed by the plan:_ dev had no intrinsic `width`/`height`/`loading`/`decoding` on the img                  | ALREADY | now required / defaulted (lazy, async), tested                                                  |
| _Missed by the plan:_ dev's `NO_RATIO` null-cast to suppress the ratio                                       | DROP    | the `isFill` variant is declared after `ratio`, so `aspect-auto` wins in the merge; no cast     |

### Gate

```
pnpm exec prettier --write packages/ui/src/atoms/image-slot packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/image-slot.json packages/design-tokens/contrast-pairs.json
  → image-slot.tsx re-sorted (above); rest unchanged
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
  → exit 0; design-tokens Tests 180 passed (4 files); ui Test Files 20 passed, Tests 328 passed;
    "Successfully ran targets typecheck, lint, test for 2 projects and 2 tasks they depend on"
pnpm nx run @pink-paprikaa-web/storybook:build → exit 0
```

The red step failed as expected: `Failed to resolve import "./image-slot"`. The `@ts-expect-error` photo-without-alt test still compiles under `tsc -b`, so the union rejects it. I did not need the TS2322 `ElementType` cast, and `dist` had no phantom errors.

---

## Task 12: Badge (`0593701`)

### What I built

- `tokens/component/badge.json`: `spacing.badge-icon` (12px) and `color.badge.brand.{bg,fg}` aliasing `{color.surface.brand}` / `{color.text.on-brand}`, verbatim. This follows Button's primary pattern. Neither target is overridden by a surface today, and `surface-aliases.spec.ts` passes on all four surfaces.
- Surface skin: brand.json gets `badge.brand.bg` = ink-000 and `fg` = pink-600. light.json restores `{color.surface.brand}` / `{color.text.on-brand}`. There is no ink override, because pink on an ink field reads.
- `contrast-pairs.json` gets the groups `badge` (6 pairs, 4.5), `badge-brand` (3, brand-fill exception) and `badge-brand-on-brand` (brand surface, 4.5). That adds 8 passing tests (180 → 188).
- `SPACING` += `"badge-icon"`.
- `atoms/badge/badge.{tsx,test.tsx,stories.tsx}`, plus the barrel export (first, before Button).

### Deviations

1. **R13 (overlay 1).** `tone` and `icon` are `| undefined`.
2. No Prettier re-sorts. Everything else is verbatim from the brief.

### Dev parity

| Dev item                                                               | Ruling  | Where / reason                                                                                            |
| ---------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `rounded-6`, `bg-brand-soft`, status colours as text (`text-status-*`) | DROP    | D4; spec §5.3 (status text uses the AA `text-text-*` tokens)                                              |
| `brand` is a fixed pink                                                | ALREADY | the surface-aware `badge-brand-*` pair (white on a pink field)                                            |
| Tests: caps, not a control, seven tones, soft default, axe             | ALREADY | test file                                                                                                 |
| Test: the glyph is decorative (one svg, `aria-hidden`)                 | ADD     | done                                                                                                      |
| Test: caller className replaces the radius                             | ADD     | done                                                                                                      |
| Stories `Default`, `Tones`, `StatusTones`, `WithIcons`                 | ALREADY | `Playground`, `Tones`, `StatusTones`, `WithIcon`                                                          |
| Story `OnAMenuCard`                                                    | ADD     | done                                                                                                      |
| _Missed by the plan:_ dev `Omit<…, "color">` on the span props         | DROP    | contracts §2 is `extends ComponentProps<"span">`; the legacy `color` attribute is harmless and not a prop |
| _Missed by the plan:_ dev typed `icon` as `LucideIcon`                 | DROP    | `IconComponent` (accepts lucide and brand glyphs)                                                         |
| _Missed by the plan:_ dev had no truncating label span                 | ALREADY | pill rule: `whitespace-nowrap max-w-full shrink-0` root + `min-w-0 truncate` label, tested                |

### Gate

```
pnpm exec prettier --write packages/ui/src/atoms/badge packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens packages/design-tokens/contrast-pairs.json
  → all unchanged
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
  → exit 0; design-tokens Tests 188 passed (4 files); ui Test Files 21 passed, Tests 342 passed;
    "Successfully ran targets typecheck, lint, test for 2 projects and 2 tasks they depend on"
pnpm nx run @pink-paprikaa-web/storybook:build → exit 0
```

The red step failed as expected: `Failed to resolve import "./badge"`. The built CSS has `--color-badge-brand-bg: var(--color-ink-000)` and `-fg: var(--color-pink-600)` in the brand block, with the `:root` and light values re-aliased.

---

## Extra checks and concerns

- `pnpm guard:founder` reports "Founder-name guard: clean."
- `pnpm nx format:check` flags one file, `docs/superpowers/plans/2026-09-27-ds-02a-atoms-core.md`. This batch did not touch it: it was last changed in `980c6b3`. The failure is pre-existing and left for the controller.
- ImageSlot's structure differs from the brief (two destructuring branches with `_label` / `_src` discards). R35 makes this necessary, so review it against the contract.
- lint-staged ran eslint --fix and prettier on every commit, and the tree was clean after each commit.
