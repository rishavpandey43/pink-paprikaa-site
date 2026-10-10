# P6-E — Fab (atom) + SpeedDial (molecule)

**Files:** `packages/ui/src/atoms/fab/fab.{tsx,test.tsx,stories.tsx}`, `molecules/speed-dial/speed-dial.{tsx,test.tsx,stories.tsx}`. Tokens `component/fab.json` (sizes 48/56, shadow-4, brand fill).

## Fab

Round floating action button. `icon` (Icon atom, required), `label` (required: the accessible name; visible only when `isExtended`), `isExtended?` (pill with icon + label), `size?` md | lg, `variant?` primary (brand) | secondary (card + brand icon). `position?`: none (default) | bottom-end | bottom-start → `fixed` placement that respects the safe area (`env(safe-area-inset-*)` via token/utility) and the dock clearance token. `asChild` for links (tel:, WhatsApp). Pointer cursor, focus ring, disabled.
Stories: Playground, Variants, Extended, Positions (inside a framed area), AsLink (Call us). Tests: name, extended label visible, variants, asChild anchor, axe.

## SpeedDial

A Fab that fans out actions. `icon?` (default Plus, rotates 45° open, motion-safe), `label` (trigger name, e.g. "Contact us"), `actions: { icon; label; href? ; onSelect? ; target? }[]`, `direction?` up | down | left | right (default up), `open?/defaultOpen?/onOpenChange?`, `position?` as Fab.
Each action = small round button + visible tooltip-style label (sr label always). Trigger `aria-expanded` + `aria-controls`; actions in a `role="menu"`-free list (`role="list"` of buttons/links). Escape closes and returns focus; arrow keys move between actions; click outside closes. New-tab actions announce "(Opens in a new tab)" (R44).
Stories: Playground (Call, WhatsApp, Directions), Directions (4), Controlled, Mobile360 with bottom-end position. Plays: open, arrow through actions, Escape → focus on trigger.
Tests: expanded state, actions render as links/buttons, onSelect, Escape, new-tab announce, axe.
