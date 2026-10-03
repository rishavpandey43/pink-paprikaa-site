# P4 T16 — Real components in the layout stories, then parity

**Files:** `packages/ui/src/layouts/{app-shell/app-shell,post-frame/post-frame}.stories.tsx`. Organism files only for parity fixes.

**What it is:** Plan 2c's AppShell and PostFrame stories use stand-ins built from atoms. Swap in the real components. Then compare every organism with its card or handoff page at 360 and 1280. Fix each gap, or list it with a reason.

**AppShell stories**

- Delete `TABS`, `DemoTabBar`, `DemoMenuScreen` and `DemoSheet`. Keep `DemoHomeScreen`, but reword its "Stand-in" comment.
- `AppTabBar({ current, label })` → `TabBar` with tabs home / menu / cart (count 2) / you, each with an `href`.
- `MenuScreen` → `FilterBar`, `LoyaltyCard`, and two `MenuItemRow`.
- `SheetInFrame` → AppShell `ref` held in state, then `Dialog variant="sheet" defaultOpen portalContainer={frame}`. "Remove this item?", Keep It / Remove.
- Wire `meta.args`, `WithOverlaySheet` (axe `aria-hidden-focus` off), `StatusTones` and `Sizes` to these. Rewrite the stand-in docs sentence.

**PostFrame stories**

- OfferBoard: `LogoLockup tone="white" size="lg"`, then `OfferSeal value="50%" label="Off" size="lg" tone="light" corner="top-right" bleed="none"` as the last child.
- StatementBoard: `LogoLockup tone="white" size="md"`.
- Keep the `Logo` import; other boards use it.

**Parity:** story ids and sources are in brief Steps 5–6. Leave these differences alone: AA text colours, untrue copy replaced, the drawer below 1024, autogrid snapping, the extra rings, skip link and dock clearance, and font rendering.

**Tests:** none new. `rtk proxy grep -rn "Stand-in\|stand-in" packages/ui/src/layouts` returns nothing. All story plays and axe checks stay green.

**Gotchas**

- `StatusTones` and `Sizes` each show two TabBars. Give each a distinct `label`, or `landmark-unique` fails.
- CartPanel's parity check waits for P4 T15.
- Commit `test(ui):`, or `fix(ui):` if organism code changed. The body lists fixes and deliberate differences. No reviewer of its own (R117).
