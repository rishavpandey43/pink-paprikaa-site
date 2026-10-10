# P6-A — Box + Grid/GridItem (layouts)

**Files:** `packages/ui/src/layouts/box/box.{tsx,test.tsx,stories.tsx}`, `layouts/grid/grid.{tsx,test.tsx,stories.tsx}` (Grid + GridItem in one file). Export from `src/index.ts`.

## Box (MUI Box)

Polymorphic wrapper with token-only props. Not a style escape hatch: no `sx`, no arbitrary values.

- `as?`: div | section | article | aside | header | footer | main | nav | span | ul | ol | li (default div; narrow cast per the TS2322 trap).
- `padding?` / `paddingX?` / `paddingY?`: `SpaceStep` (reuse `lib/space`, like Stack's `space`).
- `surface?`: light | soft | brand | ink → sets `data-surface` + the surface background (copy Section's mapping; never an `on` prop).
- `radius?`: none | sm | md | lg | xl | pill. `border?`: boolean (border-default). `shadow?`: 0–4 tokens if they exist.
- Native props spread last, className merged.
  Stories: Playground, Surfaces (all four with text), Padding scale, AsElement (section/ul). Tests: element via `as`, each prop's class or `data-surface`, className merge, axe.

## Grid + GridItem (MUI Grid v2, 12 columns)

- `Grid`: `columns?` 12 (default) | 6 | 4; `gap?` SpaceStep (default = grid-gap token, AutoGrid's); `rowGap?`/`columnGap?`; `as?` like Box.
- `GridItem`: `span?` 1–12 | "full"; responsive object `{ base?, sm?, md?, lg?, xl? }` for `span` and `start?` (1–12). Static class maps only (`col-span-6 md:col-span-4` …): **never build class names by string concatenation** (Tailwind can't see them).
- Mobile-first: unspecified base = full width.
  Stories: Playground, TwelveColumn (spans 12/6/4/3), Responsive (12 → 6 → 4 at sm/lg), Asymmetric (8 + 4 page layout), Offset (start), NestedGrid, a 360px story whose play asserts no horizontal overflow. Tests: span/start classes for scalar and responsive values, columns variant, gap, as, axe.

Reuse: `lib/space`, AutoGrid's grid-gap token, Container for page width. Story titles: `Layouts/Box`, `Layouts/Grid`.
