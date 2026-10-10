# P4 T15 — CartPanel + cartTotals

**Files (none exist yet):**

- `design-tokens/tokens/component/cart-panel.json`
- `ui/src/organisms/cart-panel/{cart-totals.ts,cart-totals.spec.ts,cart-panel.tsx,.test.tsx,.stories.tsx}`
- `lib/component-variants.ts` (`SPACING`), `src/index.ts`

**What it is:** the whole cart (`"use client"`): lines with a stepper, then note field, PriceSummary totals and a pay bar outside the scroll. Empty → its own EmptyState. `cartTotals` lives in a pure file.

**Types**

- `CartLine`: `id`, `name`, `price` (unit ₹), `quantity`, `note?`
- `CartTotals`: `subtotal`, `tax` (rounded), `total`

**Props**

- `lines`, `title?`, `meta?`, `gstRate=0.05`
- `onQuantityChange(id, qty)` — 0 means remove
- Slots: `placeAction`, `browseAction`, `emptyTitle`, `emptyBody`, `noteField`, `note`
- Labels: `subtotalLabel`, `taxLabel="GST"`, `totalLabel`
- `headingLevel=2`

**Token:** `cart-panel-thumb`, 56px, marker `["size"]`. Add it to `SPACING`.

**Tests**

- `cartTotals`: empty; 960 → 48 / 1008; 1180 → 1239; 1010 → 51; rate 0.
- Region named by `title`; `meta` shown. Lines show note, ₹ unit, "Vegetarian" img.
- The stepper reports `(id, 2)` and `(id, 0)`.
- "GST (5%)" is ₹48; the total is ₹1,008. Rate and label props apply.
- `noteField` and `placeAction` render.
- Empty: the empty state and its browse action show, with no list and no pay bar.
- `truncate` on name/note; `className` merges; axe; empty-string slot → no wrapper.

**Stories:** Playground · Filled (play adds one → "Pay ₹1,239") · Empty · OneLine · DineIn · Mobile (360).

**Reuse:** EmptyState, PriceSummary, QuantityStepper, PriceTag, DietMark, Card, `headingTag`, `isShown`, `ringClippers`.

**Gotchas**

- Stepper buttons are "Remove one"/"Add one" in a group named by the dish; query within it.
- Gate slots with `isShown`, not truthiness. Lines `ul` gets `role="list"`.
- Framed stories get a ring-clip play (steppers, note field), and the frame must fit its content.

**Commit:** `feat(ui): add the CartPanel organism`
