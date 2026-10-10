# Plan 2c final-review fix wave (rides in 3a batch B, R74) — all Minor, do FIRST, fix commits
1. packages/ui/src/layouts/container/container.tsx:41 — `const Element: ElementType = as` → `const Element = as as "div"` (match the other layouts; restores spread-prop type checking).
2. cluster.tsx:26 + cluster.stories.tsx:187-189 — ScrollableRailAt360 asserts `document.documentElement.scrollWidth <= innerWidth`; JSDoc on isScrollable: the rail's -m-1 needs ≥4px parent padding (a Container gives it).
3. auto-grid.stories.tsx:116 ColumnsAt360 — render with data-testid="grid" + play asserting 1 column.
4. container.stories.tsx:102 AtDesktop — `expect(window.innerWidth).toBe(1280)`.
5. apps/storybook/src/foundations/spacing/spacing.stories.tsx — replace the vacuous runtime `expect(isEveryStepShown)` with `void isEveryStepShown`.
6. post-frame-scaler.tsx:33 — skip setScale when clientWidth === 0.
