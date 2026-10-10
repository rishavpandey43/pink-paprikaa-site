# Task 4 report — Box and Grid on the new API

Status: DONE. Commits: adc608b `refactor(ui): move box onto surface and sx`; 28b8803 `feat(ui): add the 12-column grid layout` (base 1ebd380).

## Box (TDD)
- RED: rewrote box.test.tsx to the brief → `pnpm nx test ui -- box.test`: 4 failed | 30 passed (sx on the element; surface page/alt/sunken had no ground).
- GREEN: box.tsx now `as`/`surface`/`sx` only; PADDING* maps and radius/shadow/hasBorder variants deleted; `surface: SURFACE_BG`, `data-surface` from SURFACE_DATA, `withSx(sx, className)`. 34/34 pass.
- Stories: Playground, Surfaces (all six, h4 + body each), AsElement, Responsive (VIEWPORT_360, computed padding 16px, display block). `storybook:test -- box.stories` 4/4 pass.
- No other consumers of the old Box props (container.stories' `Box` is a local helper).

## Grid (TDD)
- Restored wip-grid/{grid.tsx,grid.test.tsx} into packages/ui/src/layouts/grid/.
- Tests: kept the matching WIP cases; dropped rowGap/columnGap (not in the brief's interface); added brief cases (default 12-col + gap-grid-gap, columns 6/4, mobile-first full span, scalar+responsive span/start, `gap={8} sx={{mt:4}}`), chosen element + sx on item, ref forwarding.
- RED: 2 failed | 39 passed (sx not applied on Grid / GridItem).
- GREEN: grid.tsx: SPAN/START static literal maps per breakpoint kept (complete strings); removed ROW_GAP/COLUMN_GAP; exports GridSpan, GridStart, GridResponsive<T>; GridProps {columns, gap (GAP_CLASS), as, sx}; GridItemProps {span, start, as, sx}; `withSx` on both. 41/41 pass.
- Stories (Layouts/Grid): Playground, TwelveColumn, Responsive, Asymmetric, Offset, Nested, At360 (scrollWidth <= clientWidth).
- index.ts: Grid, GridItem + types exported (alphabetical, after Container).
- component-variants.ts: unchanged (gap-grid-gap already merges correctly: `gap={8}` replaces it, tested).

## Final gates
- ui typecheck + lint + test: 1711 tests pass (112 files; baseline 1700).
- storybook:test full: 1002 pass (110 files; Task 3 was 996).
- nx format:check ok; sync:check ok.

## Concerns / notes
- First full storybook run showed `app.stories > Home` failing once; it passed in isolation and in the next full run (flaky, unrelated to this change; not investigated).
- My first At360 story used a 64-char unbroken word and overflowed (405 > 328): the Grid's min-w-0 stops the *track* widening but not the text itself overflowing its cell. Story changed to ordinary labels; real long-word handling remains the cell content's job.
- Grid's `Responsive` (WIP name) is now `GridResponsive` as the brief says; lib/sx.ts has its own `Responsive` with the same shape.
