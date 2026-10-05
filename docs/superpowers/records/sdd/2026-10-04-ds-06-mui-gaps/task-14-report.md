# Task 14 report — Drawer, Popover, Menu (BASE 1f19df6)

Commits: 7871fd1 feat(ui): add the drawer variant of dialog · ada3008 feat(ui): add the popover molecule · f98ac27 feat(ui): add the menu molecule (mui menu, incl. the 3-dot menu) · 314a318 test(storybook): docs-kit lists fill-surface-card.

## Built
- Tokens: dialog.json `dialog-drawer-sm/md/lg` (320/400/480, utility max-w); popover.json `popover-pad` (p), `popover-max-w` (max-w); menu.json `menu-max-sm/md/lg` (216/320/400, utility max-h). All registered in `SPACING`; `drawer-in-start/end` in `ANIMATE` + styles.css keyframes.
- Drawer: `Dialog variant="drawer" side` + `Drawer`/`DrawerProps` export; 6 stories (DrawerEnd/Start/Sizes/WithFooter/LongContent/360).
- Popover (Radix): title via `headingTag`, close button, arrow, controlled/uncontrolled, portal container; 7 stories.
- Menu (Radix DropdownMenu): Menu, MenuTrigger, MenuContent, MenuItem (icon/shortcut/description/selected/divider/danger/asChild), MenuDivider, MenuLabel, MenuCheckboxItem, MenuRadioGroup/Item, SubMenu/Trigger/Content; 13 stories mirroring the MUI demos.

## TDD evidence
RED: `Drawer` import undefined (9 failed / 20 passed); popover/menu test files failed to resolve their modules. GREEN: dialog 29, popover 16, menu 24 tests.

## Gate
typecheck, lint (1 max-lines warning on menu.test.tsx, 532 lines), test (ui 114 files/1863), build, format:check, sync:check, guard:founder green; storybook:test 113 files/1055 green (first run: app kit `Home` toast flake, known; re-run green).

## Plan vs code
- Rulings are in the ledger (icon 20px not 18px; aria-label overrides aria-labelledby; SubMenuContent ignores side/align; drawer slide has no RTL flip).
- Extra: docs-kit DERIVED gains `fill-surface-card` (R65) — outside the brief's file list, needed by the catalogue story.
- LongMenu story disables axe `scrollable-region-focusable` (arrow-key roving focus is the access path); open-menu stories disable `aria-hidden-focus` like Dialog's.
