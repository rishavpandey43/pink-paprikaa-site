# Rules — binding for every remaining task

Detail: `packages/ui/AUTHORING.md`. Built code beats plan text. Never edit the plans.

**Files**

- `packages/ui/src/<layer>/<kebab>/`: `<kebab>.tsx`, `.test.tsx`, `.stories.tsx` (+ a client leaf if needed). Export by name from `src/index.ts` only.
- Layers import upward only (LAW): atoms → molecules → organisms → layouts. Atoms: only `atoms/icon` + `lib`. Nothing imports a layout. No barrel imports in ui.

**Shape** (AUTHORING §3)

- `componentVariants` (never bare `tv`), `slots` for parts. Public variant props via `Pick<VariantProps<…>>`.
- Extend `ComponentProps<"el">`, spread `...props` last, pass `className` into the variant fn. Named function, no default export, no `forwardRef`.
- Optional props `?: T | undefined`. Booleans `is/has/should/can`. `onValueChange`; `open/defaultOpen/onOpenChange`.
- `data-surface`, never an `on` prop. `"use client"` only in the smallest leaf. No copy defaults except overridable chrome labels.
- Titled → `headingLevel` via `createElement(headingTag(level))`. Link lists → `linkAs`. With `asChild`, classes go on the component.

**Tokens first** (AUTHORING §5): a missing value becomes a component token, registered in `lib/component-variants.ts`; new text pairs go in `contrast-pairs.json`; size-only spacing tokens get the `utility` marker. No arbitrary values, raw hex or `max-w-prose`.

**Reuse** (`src/lib`): `isShown`, `StruckPrice`, `headingTag`, `LinkAs`, `SymbolMark`, `controlStates`, `FieldMessage`, `useControllableState`, `useFocusReturn`, `OnSurfaces`, `ringClippers` (story-ring); `organisms/story-fixtures`: `BRAND`, `GOOGLE_REVIEWS`, `VIEWPORT_360`.

**Conventions**: `role="list"` on `ul`/`ol` outside `nav`. New-tab links say "(Opens in a new tab)". A blank label falls back to its default. Overlays return focus. Never wrap ChipGroup or ChoiceCardGroup in Field. ui never imports `@pink-paprikaa-web/content`.

**Tests**: write them first and see them fail. Query by role and label. Cover every variant, the keyboard paths, and that an empty slot renders no wrapper. End with `await expectNoA11yViolations(container)`.

**Stories**: `"<Tier>/<Name>"`, `satisfies Meta`. One story per `.card.html` row, plus `Playground`, `OnSurfaces`, a 360px story and plays. Add a ring-clip play under any `overflow` ancestor.

**Storybook app**: MDX holds prose and `<Canvas of>` only, with no `className`. Values come from `docs-kit/catalogue`. Inline `style` uses only `var(--…)`. Kits use public ui exports and facts from `content`.

**Brand**: "Pink Paprikaa" (two a's) · pure veg, no egg · no founder identity · no invented reviews.

**Commit and gates**: one commit per component, `feat(ui): add the <Name> <tier>`. End every message with the harness `Co-Authored-By` line. pnpm only. Never `--no-verify`, LAW eslint-disables or destructive git. Per batch:
`pnpm nx run-many -t typecheck lint test build && pnpm nx format:check && pnpm nx sync:check && pnpm nx run storybook:test && pnpm guard:founder`
