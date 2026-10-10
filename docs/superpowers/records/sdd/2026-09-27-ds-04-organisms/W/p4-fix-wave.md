# P4 final fix wave — all findings

Minors + the one Important. One implementer. Never edit plans. Re-run covering tests. Full RULES.md gauntlet once before last commit.

## Important
1. `packages/ui/src/organisms/review-carousel/review-carousel.stories.tsx:126-129` — Paging asserts Previous `aria-disabled="false"` outside `waitFor` after `scrollLeft > 0`. Wrap the aria-disabled check in `waitFor`. Covering: `pnpm nx run storybook:test -- review-carousel`

## Minor (fix now — this is the Plan 4 final wave)
2. `menu-list.tsx:84` — `variant` should be `Pick<VariantProps<typeof menuList>, "variant">`. Covering: `pnpm nx test ui -- menu-list`
3. `cart-panel.tsx:45` — optional ReactNode slots `?: T | undefined`. Covering: `pnpm nx test ui -- cart-panel`
4. `cart-panel.stories.tsx:627` — Playground in overflow frame needs `play: proveRingsWhole`. Covering: storybook:test cart-panel
5. `cart-panel.stories.tsx:550` — `LiveCart` after qty 0 must move focus to next stepper or cart heading. Covering: storybook:test cart-panel + unit tests
6. Molecule stories using `w-full max-w-*` frames (tabs, accordion, pagination, list-row, filter-bar, and same pattern) — give explicit widths like organism stories (`2aee512`). Covering: storybook:test for each touched story file
7. `app-shell.stories.tsx:20-33` — T16 required deleting `TABS` / inlining TabBar; `TABS` + `AppTabBar` remain. Delete those names; keep distinct labels. Covering: storybook:test app-shell
8. `review-carousel.stories.tsx:44` — empty-state new-tab copy must be `(Opens in a new tab)` not `" Opens in a new tab"`. Covering: storybook:test + unit if any
9. `cart-panel.tsx:97-99` — emptyTitle="" must not emit empty heading; `isShown` / R79 fallback `"Nothing here yet."`. Covering: `pnpm nx test ui -- cart-panel`

Commits: accurate Conventional Commit per logical group (or one `fix(ui):` if small). Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Report: append to W/batch-J-report.md (fix-wave section) or write W/p4-fix-wave-report.md
