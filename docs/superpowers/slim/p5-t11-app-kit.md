# P5 T11 — The App kit

**Files:** create `apps/storybook/src/kits/app/{item-sheet.tsx,app-screens.tsx,ordering-app.tsx,app.stories.tsx}`.

**What it is:** `ui_kits/app` inside AppShell. Flow: home → item sheet → add (pop toast) → cart → pay → tracking (advances every 2.6s) → home. The account screen is a signed-out Guest. No egg flag.

**Components**

- `OrderingApp({ initialScreen = "home", initialItem?, initialLines = [], size = "phone" })`
  - `initialScreen`: `"home" | "menu" | "cart" | "you" | "tracking"`
  - `size`: `"phone" | "phone-sm"`
- `ItemSheet({ item, portalContainer, onClose, onAdd(item, unitPrice, qty) })` — a Dialog sheet:
  - portion: Regular, or Sharing at 1.6×
  - 4 heat radios; mayo checkbox (+₹40); QuantityStepper
  - footer button "Add to Order · ₹…"
- `HomeScreen({ onOpenItem, onSeeMenu })`, `AccountScreen()`

**Stories** (`App/Ordering app`, centred)

- `Home`: play opens Customise → the sheet (named by the dish) → Add to Order → toast.
- `Menu`, `ItemSheetOpen`, `Cart`, `Tracking`, `Account`.
- `Home360`: phone-sm at viewport floor360, no overflow.
- Probe: setting `size: "phone"` must fail `Home360`.

**Reuse:** AppShell, TabBar, MenuList (`list`, `title={null}`), CartPanel, OrderTracker (`flush`), Dialog, ToastProvider, Toast, FilterBar, LoyaltyCard, MenuItemCard, SearchField, Avatar, ListRow, Switch, Divider, `formatRupees`, `brand.billing`.

**Gotchas (the built API differs from the plan)**

- `Toast` has no `portalContainer`. Put `<ToastProvider isContained>` in AppShell's `overlay` slot.
- Dialog's `portalContainer` is the AppShell frame, taken from `ref`.
- `Cluster isScrollable` sets `tabIndex=0`, so give it `role="group"` and an `aria-label`.
- `phone-sm` is exactly 360px wide. `Home360` needs `layout: "fullscreen"`: the preview's 1rem pad overflows.
- CartPanel, CartLine and `cartTotals` come from Plan 4 T15. Use built props; `cartTotals` for "Pay ₹…".
- Settings rows: no chevrons (parity note).

**Commit:** `feat(storybook): the App kit`
