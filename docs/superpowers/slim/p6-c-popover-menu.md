# P6-C — Popover + DropdownMenu (molecules)

**Files:** `packages/ui/src/molecules/popover/popover.{tsx,test.tsx,stories.tsx}`, `molecules/dropdown-menu/dropdown-menu.{tsx,test.tsx,stories.tsx}`. Use `radix-ui` (`Popover`, `DropdownMenu`), as Tabs/Toast already do. Tokens in `component/popover.json` (shared panel: surface-card, border-subtle, radius-lg, shadow-3, padding, z-popover or the existing overlay z).

## Popover

Props: `trigger` (ReactNode, asChild), `children` (content), `title?` (heading, R83 `headingLevel`), `side?` top | right | bottom | left (default bottom), `align?` start | center | end, `open?/defaultOpen?/onOpenChange?`, `hasCloseButton?` (IconButton X, chrome label "Close"), `portalContainer?`. Arrow optional (`hasArrow?`).
Stories: Playground, Sides, WithTitle, InfoPopover (icon trigger, "what's in a thali"), Controlled, OnSurfaces, Mobile360 (collision padding keeps it on screen). Tests: opens on click, Escape closes + focus returns to trigger, title names it, side/align passthrough, axe.

## DropdownMenu (MUI Menu)

Compound API: `DropdownMenu` (root: open/defaultOpen/onOpenChange), `DropdownMenu.Trigger` (asChild), `.Content` (side/align/portalContainer), `.Item` (icon?, shortcut?, `tone?` default | danger, disabled, onSelect), `.Label`, `.Separator`, `.CheckboxItem`, `.RadioGroup` + `.RadioItem`, `.Sub` / `.SubTrigger` / `.SubContent`.
Items 44px min tap height; check/radio indicator uses the Icon atom.
Stories: Playground (sort menu: Popular, Price low→high, Newest as RadioItems), AccountMenu (icons + separator + danger "Sign out"), WithCheckboxes (veg filters: Jain, No onion-garlic), WithSubmenu, Disabled item. Plays: arrow keys move, Enter selects, Escape closes + focus returns, type-ahead.
Tests: roles menu/menuitem/menuitemradio/menuitemcheckbox, onSelect fires, disabled not selectable, danger tone class, axe.
