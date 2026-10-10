# P4 T14 — MenuList (FINISH the WIP)

**Files:** `packages/ui/src/organisms/menu-list/{menu-list,menu-list-filter,menu-list.test,menu-list.stories}.tsx` (WIP) and `src/index.ts` (export already in place).

**What it is:** a server organism with one panel per filter option; a client leaf `MenuListFilter` holds the chosen option.

**Checked against task-14-brief + fold items 7, 8, 18, 19, 20 — already correct, don't redo:**

- Props:
  - content: `items`, `categories`, `defaultCategory`, `lede`, `note`, `emptyState`, `action`
  - chrome labels: `allLabel="All"`, `filterLabel="Filter the menu"`, `overflowLabel`
  - layout: `variant`, `gridCount=4`, `headingLevel=2`
  - links and actions: `renderItemAction`, `getItemHref`, `linkAs`
- `isShown` gates on `title` and `emptyState`; `role="list"` on both lists.
- 20 tests: the brief's 18, plus list semantics and the empty-slot test.
- Stories:
  - Playground, GridWebsite, ListApp, GridOnly, SmallGrid, WithLede
  - with plays: FilterByCategory, PreselectedCategory, EmptyCategory
  - Mobile (360), Tablet, Desktop
  - `proveRingsWhole` ring play on GridWebsite, ListApp, Mobile

**Missing or wrong — the only work left**

1. **Lint:** `menu-list.test.tsx:143-144` uses `lists[0]!` / `lists[1]!` (`no-non-null-assertion`). Destructure `const [cards, rows] = lists`, throw if either is `undefined`, then query within them. Never eslint-disable.
2. **Story plays never run.** Run them. If `proveRingsWhole` fails, fix the room rather than the assertion: padding inside the clip, or an inset ring.
3. Run `prettier --write` and `lint --fix`; nothing beyond that is needed.

**Done when**

- `pnpm nx test ui -- menu-list` passes (20 tests).
- `pnpm nx lint ui` reports 0 errors.
- typecheck is clean.
- `pnpm nx run storybook:test -- menu-list` is green (axe and every play).
- `pnpm nx format:check` passes.
- One commit, `feat(ui): add the MenuList organism`, covering tests, stories and the index line.
