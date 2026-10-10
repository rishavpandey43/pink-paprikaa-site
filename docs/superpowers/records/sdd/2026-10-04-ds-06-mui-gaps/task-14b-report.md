# Task 14b report — ToggleButton, ToggleButtonGroup (BASE 314a318)

Commit: 066c076 feat(ui): add the toggle button and toggle button group

## Built
- Tokens: `toggle-button.json` `toggle-button-h-sm/md/lg` (32/40/48, utility h + min-w), registered in `SPACING`.
- Atom `ToggleButton`: standalone = Radix `Toggle` (`selected`/`defaultSelected`/`onSelectedChange`, `aria-pressed`); inside a group = `ToggleGroup.Item`, picked by `lib/toggle-button-group-context.ts`. size/color fall back to the group's; child wins. Selected look on `data-[state=on]` gated by `not-disabled`. Icon-only = square (`px-0` + min-w), needs `aria-label` (JSDoc + test).
- Molecule `ToggleButtonGroup`: exclusive (`string|null`, Radix `""`↔null mapping, `isValueRequired` swallows `""`) and multiple (`string[]`), controlled/uncontrolled via `useControllableState`. Joined look by child selectors (shared 1px border, outer corners only); vertical stacks.
- Exports in `index.ts`; AUTHORING §13 one-liner (ToggleButtonGroup vs ChipGroup).
- Stories: ToggleButton Playground/Standalone/Sizes/Colors/IconOnly/Disabled; Group Exclusive, Multiple, EnforceValueSet, ViewSwitcher, Vertical, Sizes, Colors, FullWidth, Disabled, OnSurfaces, Mobile360 (plays: click, keyboard, null deselect, real-browser corner/overlap check).

## TDD
RED: both test files failed to resolve their modules. GREEN: 27 tests (11 atom, 16 group). Fixed along the way: exactOptionalPropertyTypes vs Radix props (default `disabled=false`, conditional spreads).

## Gate (this task only)
ui typecheck + lint (only the known menu.test max-lines warning) + test 116 files/1890; design-tokens 288; format:check, sync:check, web build green; `storybook:test -- toggle-button` 2 files/17 green (axe on, incl. OnSurfaces page/alt/soft).

## Plan vs code
- Radix roles: multiple root is `toolbar`, exclusive `radiogroup` (brief tests said only item roles).
- `BasePropsWithColor` + Omit of defaultValue/children/dir on the group (div `dir`/`defaultValue` clash).
- OnSurfaces omits the brand/ink grounds (selected look is the soft pink, same as ChoiceControls R67 — not designed for those).

## Rulings
- Heights 32/40/48 as the brief's numbers; Button is 36/44/54 — "matching" is only the sm/md/lg naming.
- Context in lib/ so the atom never imports the molecule.
- `isValueRequired` is exclusive-only (as MUI); ignored for multiple.
