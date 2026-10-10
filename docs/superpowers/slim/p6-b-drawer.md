# P6-B — Drawer (Dialog variant)

**Files:** modify `packages/ui/src/organisms/dialog/dialog.{tsx,test.tsx,stories.tsx}` (+ `dialog.json` tokens). No new component folder: Drawer is `Dialog variant="drawer"`, sharing the focus trap, portal, close button, R82 focus return and `portalContainer`.

- `variant`: modal | sheet | **drawer** (new).
- `side?`: start | end (default end). Only for `drawer`. RTL-safe via `start-0`/`end-0`.
- `size` for drawer: sm | md | lg → widths from new tokens `dialog-drawer-sm/md/lg` (about 320/400/480px), always `max-w-full` so it fits 360px.
- Full height, slides in from its side (`motion-safe:` animation from tokens; add `animate-drawer-in-start/end` keyframes in styles.css next to `animate-sheet-in`, honouring reduced motion).
- Header/body/footer slots as in modal; only the body scrolls.
- Also export `Drawer` as a thin alias: `function Drawer(props) { return <Dialog variant="drawer" {...props} /> }` with `DrawerProps = Omit<DialogProps, "variant">`.

Stories (`Organisms/Dialog`): DrawerEnd, DrawerStart, DrawerSizes, DrawerWithFooter (filters + Apply/Reset), DrawerLongContent (body scroll), Drawer360. Plays: open by trigger, Escape closes, focus returns to the trigger, close button works.
Tests: side/size classes, the alias renders a drawer, role=dialog + accessible name, Escape + overlay close, focus return, axe.
