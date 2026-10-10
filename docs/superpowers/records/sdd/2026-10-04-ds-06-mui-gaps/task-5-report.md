# Task 5 report — every layout takes `sx`; Section/PostFrame `surface`; AppShell `frame`

Commit: 425aafe `refactor(ui): give every layout sx and a surface prop` (base 28b8803)

## TDD
- Red: added "takes sx on its root" to stack/cluster/auto-grid/container/section/post-frame/app-shell tests, Section `surface="brand"` test, renamed existing tone/size tests to `surface` (PostFrame `light`→`page`) and `frame="phone-sm"`. `pnpm nx test ui -- stack cluster auto-grid container section post-frame app-shell` → 23 failed.
- Green: root `className: withSx(sx, className)` in all seven; Section `SectionTone` deleted, `tone`→`surface` (SURFACE_BG/SURFACE_DATA); PostFrame variant key `tone`→`surface`, `light`→`page`; AppShell `size`→`frame`. → 10 files, 184 tests pass. Classes unchanged (parity).
- Call sites: 3 stories + apps/storybook kits (marketing, spacing, website, ordering-app) rewritten; Stack `WithSx` story added. ui+storybook typecheck PASS.

## Batch gate (after commit) — exit 0
`pnpm nx run-many -t typecheck lint test build && pnpm nx format:check && pnpm nx sync:check && pnpm nx run storybook:test && pnpm guard:founder`
- ui: 112 files / 1719 tests; storybook: 110 files / 1003 tests; founder guard clean. Lint: 0 errors (2 pre-existing playwright warnings in e2e apps).

## Notes
- Layout files live in `layouts/<name>/`, not flat. Historical docs under docs/ still mention `tone=`; left as records.
- OrderingApp kit keeps its own `size` prop, maps to `frame`.
