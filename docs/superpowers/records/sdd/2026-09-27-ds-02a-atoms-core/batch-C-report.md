# Batch C report — Tasks 5 (SocialHeadline), 6 (Button)

Base 0b6300c. Status: **DONE**. Commits: `777b67f` (Task 5), `a4180e9` (Task 6).

Overlay applied (fold list 1–11 + global-constraints amendments): R13 on every optional custom prop
of `SocialHeadlineProps` and `ButtonProps`; the barrel export went in before each gate (item 10);
no `max-w-prose` (item 9); no file-reading tests (R15 n/a); no SymbolMark/pattern usage (R19/R25 n/a).

---

## Task 5 — SocialHeadline (`777b67f`)

**Built**

- `tokens/primitive/typography.json`: the six `canvas-*` composites now carry line height, tracking
  and weight (verbatim values from the brief).
- `tokens/component/social-headline.json`: `spacing-social-headline-{tight,default,wide}` (12/18/30ch).
- `component-variants.ts` `SPACING` += the three names.
- `packages/ui/src/atoms/social-headline/social-headline.{tsx,test.tsx,stories.tsx}`; barrel export.

**Deviations from the brief**

1. R13 overlay: `size`, `align`, `measure`, `as` declared `?: … | undefined`.
2. `const Component: ElementType = as ?? DEFAULT_ELEMENT[size]` replaced by the Task 2 fix,
   `(as ?? DEFAULT_ELEMENT[size]) as "h2"` with a comment (the controller warned of TS2322 under
   `tsc -b` with the spread `ref`; same pattern as Text). The `ElementType` import is gone.
   Test and stories are verbatim from the brief.

**Dev parity** (brief table, copied and extended)

| Dev item | Ruling | Where / reason |
| --- | --- | --- |
| `on` prop (brand/ink/soft/light) | DROP | D5 — colour follows the artboard's `data-surface` |
| Body and caption at 88% white on dark grounds | DROP | spec §3.2.2; `/88` is not a token |
| Soft ground ink `pink-800` | ALREADY | the soft surface's `text-heading` |
| Default element `p` for every size | DROP | plan deviation 4: hero/h1/h2 default to `h2` |
| Measures `narrow`/`wide`/`none`, size-dependent default | DROP | contracts §2 (`tight`/`default`/`wide`, one default 18ch) |
| `align="end"` pushes the block (`ms-auto`) | DROP | `SocialHeadline.jsx` moves the block only for `center`; test pins it |
| Arbitrary `leading-[…]`, `tracking-[…]`, `max-w-[…]` | DROP | AUTHORING §6; canvas composites + measure tokens |
| Tests: sizes, overline caps, balance, measures, centring, `as`, axe | ALREADY | test file |
| Test: caller className replaces the size step | ADD | done |
| Stories `Ramp`, `Grounds` | ALREADY | the four size-row stories; `OnSurfaces` |
| Story `Alignment` | ADD | done |
| Story `OnACanvas` | ADD | done (brand field, `p-18` = 72px) |
| Half-scale `Artboard` wrapper | DROP | Task 15 accepted difference |
| *(extended)* Dev props were only `children`/`className` (no native props) | ADD | contract `extends ComponentProps<"h2">`; `...props` spread on the root |
| *(extended)* Dev `as?: ElementType` (any element) | DROP | contract narrows it to `h1`/`h2`/`h3`/`p`/`span` |
| *(extended)* Dev `text-left`/`text-right` | DROP | logical `text-start`/`text-end` (RTL-safe) |

**Gates**

- `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && grep text-canvas-hero dist/theme.css`:
  four lines (`132px`, `--line-height: 0.96`, `--letter-spacing: -0.035em`, `--font-weight: 800`).
- TDD red: `Failed to resolve import "./social-headline"` (plus the 3 index.spec barrel/trio checks).
- `pnpm exec prettier --write …` then
  `pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static`:
  `Successfully ran targets typecheck, lint, test for 2 projects`; design-tokens 146 passed, ui 212 passed.
- `pnpm nx run @pink-paprikaa-web/storybook:build`: `Successfully ran target build`. The built CSS has
  `.max-w-social-headline-*{max-width:var(--spacing-social-headline-*)}` and a four-part `.text-canvas-hero`.

---

## Task 6 — Button (`a4180e9`)

**Built**

- `primitive/color.json`: `white-alpha.16`.
- `component/button.json` (verbatim): `spacing-button-h-{sm,md,lg}`, `text-button-{sm,md,lg}`,
  `color-button-primary-{bg,bg-hover,bg-active,fg}`, `color-button-secondary-{bg,border}`,
  `color-button-hover-tint`, `shadow-button-primary`.
- Surface overrides: `brand.json` (primary + secondary + tint + `shadow-button-primary: shadow.2`),
  `ink.json` (secondary + tint only; primary stays pink), `light.json` restores every one to its
  base value (incl. `shadow-button-primary: shadow.brand`). `dist/surfaces.css` has all of them.
- `contrast-pairs.json`: the six groups from the brief.
- `component-variants.ts`: `SPACING` += `button-h-*`, `TEXT` += `button-*`, `SHADOW` += `button-primary`.
- `packages/ui/src/atoms/button/button.{tsx,test.tsx,stories.tsx}`; barrel exports `Button`, `ButtonProps`, `buttonVariants`.

**Deviations from the brief**

1. R13 overlay: all seven custom optional props declared `?: … | undefined`.
2. None otherwise. `const Component: ElementType = asChild ? Slot.Root : "button"` type-checks clean
   under `tsc -b` (same as Link), so the cast workaround was not needed.
3. R44 (external links): Button has no `isExternal` prop in the contract, so there is nothing to
   announce. An `asChild` `<a target="_blank">` is the caller's markup. Flagged below as a question.

**Dev parity** (brief table, copied and extended)

| Dev item | Ruling | Where / reason |
| --- | --- | --- |
| `on="brand"` compound skins | DROP | D5 — surface tokens flip primary, secondary and ghost |
| Loader is the pulsing brand diamond (`Spinner`) | DROP | D14; spec §9.1 (LoaderCircle + `animate-rotate`) |
| `rounded-6`, `shadow-elevation2`, `h-(--button-h-*)`, `text-body1` | DROP | D4; AUTHORING §6 |
| `not-disabled:` guards on hover and press | ALREADY | `controlStates` disabled/aria-disabled classes |
| Tests: type, onClick, variants, sizes, on-brand flip, glyphs, loading, grey disabled, className, axe | ALREADY | test file; the flip is proved in the `NestedSurfaces` play (passes in the Storybook browser run) |
| Test: a disabled button does not call `onClick` | ADD | done |
| Stories `Default`, `Variants`, `Sizes`, `WithIcons`, `OnBrand`, `States`, `FullWidth` | ALREADY | Playground, card-row stories, OnSurfaces, Loading + Disabled, FullWidth |
| *(extended)* Dev `Omit<…, "color">` on the props | DROP | contract is plain `ComponentProps<"button">` |
| *(extended)* Dev `ComponentPropsWithoutRef` | DROP | React 19: `ref` is a prop |
| *(extended)* Dev on-brand secondary hover turns text pink on a glass-white fill | DROP | brief: white text on a 16% white tint (3.43, brand-fill exception, listed in contrast-pairs) |
| *(extended)* Dev had no `asChild` and no `aria-busy` | ADD | contract (Slot) and brief |
| *(extended)* Dev `icon?: LucideIcon` | DROP | `IconComponent` (lucide or brand glyph), AUTHORING §4 |

**Gates**

- `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache`:
  159 passed. The contrast groups, the light restore and the alias guard all hold.
- TDD red: `Failed to resolve import "./button"`.
- Prettier, then
  `pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static`:
  `Successfully ran targets typecheck, lint, test for 2 projects`; design-tokens 159 passed, ui 241 passed.
- `pnpm nx run @pink-paprikaa-web/storybook:build`: `Successfully ran target build`.
- Extra, beyond the brief: `pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache`, which runs
  the play functions in Chromium. The first cold run failed 34 stories across old files too, with
  `Failed to fetch dynamically imported module … sb-vitest/deps/@storybook_react-dom-shim.js`. That
  is Vite dependency pre-bundling on a cold cache, not a code failure. The re-run passed:
  7 files, 66 tests, including Button `NestedSurfaces` (computed backgrounds) and `LongLabel`
  (it stays in the 360px frame at a 44px height).

---

## Concerns / questions for the controller

- None blocking.
- R44 applied to Button? If an `asChild` external `<a target="_blank">` Button must announce
  "Opens in a new tab", that needs an `isExternal` prop, which is outside the contract. Nothing was added.
- The Storybook browser test cold-start flake above is pre-existing tooling behaviour. It is worth
  knowing about if CI ever runs `storybook:test` on a cold cache.
