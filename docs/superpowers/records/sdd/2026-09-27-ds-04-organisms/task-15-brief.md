### Task 15: CartPanel

**Dev reference:** `git show dev:packages/ui/src/organisms/cart-panel/cart-panel.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                               | Ruling  | Where / clause                                                                                                                                    |
| -------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| A Radix side sheet: `trigger`, open state, Escape, close glyph, `position="container"` | DROP    | D1 + spec §9.3 / contract §7 — the design system's CartPanel is a panel; an app that wants a sheet wraps it in `Dialog variant="sheet"` (Task 11) |
| Every line with its dish and options                                                   | ALREADY | test "lists every line with its name, note, unit price and the veg mark"                                                                          |
| Each line priced at its quantity (₹560 for 2 × ₹280)                                   | DROP    | D2 — the design system's `CartPanel.jsx` prints the unit price (`PriceTag amount={l.price}`)                                                      |
| GST added to the subtotal, the total paid                                              | ALREADY | `cart-totals.spec.ts` + test "totals through PriceSummary…"                                                                                       |
| A different GST rate, shown                                                            | ALREADY | test "takes its GST rate and summary labels from props"                                                                                           |
| A quantity change for the right line; stepping to 0 removes it                         | ALREADY | test "reports a quantity change for the right line"                                                                                               |
| `onPlaceOrder` / `onBrowse`                                                            | DROP    | spec §8.1 — `placeAction` / `browseAction` slots                                                                                                  |
| Its own empty state instead of an empty list                                           | ALREADY | test "renders its own empty state…"                                                                                                               |
| No pay bar on the empty cart                                                           | ADD     | the empty-state test passes a `placeAction` and asserts it is absent                                                                              |
| The fulfilment line; dropped when blank                                                | ALREADY | `meta ? …`                                                                                                                                        |
| A long dish name and its options truncate, so the stepper keeps its place              | ADD     | `name`/`nameText`/`note` slots + test "keeps a long dish name and its options on one line…"                                                       |
| The pay bar never scrolls away                                                         | ALREADY | bar outside the scrolling body                                                                                                                    |
| Stepper buttons named per dish                                                         | ALREADY | QuantityStepper `label` (Plan 3a)                                                                                                                 |
| Built-in kitchen-note Input; fixed labels and copy                                     | DROP    | D9 — `noteField`, the label props, `note`                                                                                                         |
| `diet: "egg"`                                                                          | DROP    | C10                                                                                                                                               |
| Merges a caller `className`                                                            | ADD     | test "merges a caller className"                                                                                                                  |
| axe                                                                                    | ALREADY | test "has no accessibility violations"                                                                                                            |
| Stories Filled · Empty                                                                 | ALREADY | Filled · Empty                                                                                                                                    |
| Story Default (a trigger-opened sheet)                                                 | DROP    | not a dialog (row 1)                                                                                                                              |
| Stories OneLine · DineIn · Smallest                                                    | ADD     | `OneLine`, `DineIn`, `Mobile`                                                                                                                     |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/design-tokens/tokens/component/cart-panel.json`
- Create: `packages/ui/src/organisms/cart-panel/cart-totals.ts`, `cart-totals.spec.ts`, `cart-panel.tsx` (client), `cart-panel.test.tsx`, `cart-panel.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Card`, `DietMark`, `Icon`, `PriceTag`, `Text`, `EmptyState`, `PriceSummary`, `QuantityStepper` (Plan 3a: a `group` named by `label`, then "Remove …" button, the count, "Add …" button), `componentVariants`, `headingTag`; stories: `Button`, `Input`, `formatRupees`.
- Produces: `CartPanel`, `CartPanelProps` (client); `cartTotals`, `CartTotals`, `CartLine` from the pure `cart-totals.ts` (not a client module, so server code can import it).

- [ ] **Step 1: Component token**

`packages/design-tokens/tokens/component/cart-panel.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "cart-panel-thumb": {
      "$value": "56px",
      "$description": "The dish tile beside each cart line (design system CartPanel).",
      "$extensions": { "pink-paprikaa": { "utility": ["size"] } }
    }
  }
}
```

Append to `SPACING`:

```ts
  "cart-panel-thumb",
```

- [ ] **Step 2: Write the failing tests**

`packages/ui/src/organisms/cart-panel/cart-totals.spec.ts`:

```ts
import { type CartLine, cartTotals } from "./cart-totals";

const line = (price: number, quantity: number): CartLine => ({
  id: `${String(price)}-${String(quantity)}`,
  name: "Dish",
  price,
  quantity,
});

describe("cartTotals", () => {
  it.each([
    { lines: [], rate: 0.05, expected: { subtotal: 0, tax: 0, total: 0 } },
    {
      lines: [line(280, 2), line(220, 1), line(180, 1)],
      rate: 0.05,
      expected: { subtotal: 960, tax: 48, total: 1008 },
    },
    {
      lines: [line(280, 2), line(220, 2), line(180, 1)],
      rate: 0.05,
      expected: { subtotal: 1180, tax: 59, total: 1239 },
    },
    { lines: [line(1010, 1)], rate: 0.05, expected: { subtotal: 1010, tax: 51, total: 1061 } },
    { lines: [line(999, 3)], rate: 0, expected: { subtotal: 2997, tax: 0, total: 2997 } },
  ])("totals $lines.length lines at $rate GST", ({ lines, rate, expected }) => {
    expect(cartTotals(lines, rate)).toEqual(expected);
  });
});
```

`packages/ui/src/organisms/cart-panel/cart-panel.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { CartPanel } from "./cart-panel";
import type { CartLine } from "./cart-totals";

const LINES: CartLine[] = [
  {
    id: "chilli-paneer",
    name: "Paprikaa Chilli Paneer",
    price: 280,
    quantity: 2,
    note: "Sharing · Hot",
  },
  { id: "cold-brew", name: "Masala Cold Brew", price: 220, quantity: 1, note: "Regular" },
  { id: "kulfi", name: "Gulkand Kulfi", price: 180, quantity: 1 },
];

const lineItem = (name: string) => {
  const item = screen
    .getAllByRole("listitem")
    .find((candidate) => within(candidate).queryByText(name) !== null);
  if (item === undefined) throw new Error(`no cart line for ${name}`);
  return item;
};

describe("CartPanel", () => {
  it("is a region named by its title, with the fulfilment line under it", () => {
    render(<CartPanel lines={LINES} title="Your order" meta="Pickup · Sector 57 · 12 min" />);
    expect(screen.getByRole("region", { name: "Your order" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Your order" })).toBeInTheDocument();
    expect(screen.getByText("Pickup · Sector 57 · 12 min")).toBeInTheDocument();
  });

  it("lists every line with its name, note, unit price and the veg mark", () => {
    render(<CartPanel lines={LINES} title="Your order" />);
    const paneer = lineItem("Paprikaa Chilli Paneer");
    expect(within(paneer).getByText("Sharing · Hot")).toBeInTheDocument();
    expect(within(paneer).getByText("₹280")).toBeInTheDocument();
    expect(within(paneer).getByRole("img", { name: "Vegetarian" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("reports a quantity change for the right line", async () => {
    const user = userEvent.setup();
    const onQuantityChange = vi.fn();
    render(<CartPanel lines={LINES} onQuantityChange={onQuantityChange} />);
    const stepper = within(lineItem("Masala Cold Brew")).getByRole("group", {
      name: "Masala Cold Brew",
    });
    const buttons = within(stepper).getAllByRole("button");
    await user.click(buttons[buttons.length - 1] ?? stepper);
    expect(onQuantityChange).toHaveBeenCalledWith("cold-brew", 2);
    await user.click(buttons[0] ?? stepper);
    expect(onQuantityChange).toHaveBeenLastCalledWith("cold-brew", 0);
  });

  it("totals through PriceSummary: subtotal, GST at the rate, total", () => {
    render(<CartPanel lines={LINES} note="Inclusive of all taxes." />);
    expect(screen.getByText("Subtotal")).toBeInTheDocument();
    expect(screen.getByText("₹960")).toBeInTheDocument();
    expect(screen.getByText("GST (5%)")).toBeInTheDocument();
    expect(screen.getByText("₹48")).toBeInTheDocument();
    expect(screen.getByText("₹1,008")).toBeInTheDocument();
    expect(screen.getByText("Inclusive of all taxes.")).toBeInTheDocument();
  });

  it("takes its GST rate and summary labels from props", () => {
    render(
      <CartPanel
        lines={LINES}
        gstRate={0.18}
        subtotalLabel="Items"
        taxLabel="Tax"
        totalLabel="To pay"
      />
    );
    expect(screen.getByText("Items")).toBeInTheDocument();
    expect(screen.getByText("Tax (18%)")).toBeInTheDocument();
    expect(screen.getByText("To pay")).toBeInTheDocument();
  });

  it("renders the note field and the place action", () => {
    render(
      <CartPanel
        lines={LINES}
        noteField={<input aria-label="Notes for the kitchen" />}
        placeAction={<button type="button">Pay ₹1,008</button>}
      />
    );
    expect(screen.getByRole("textbox", { name: "Notes for the kitchen" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pay ₹1,008" })).toBeInTheDocument();
  });

  it("renders its own empty state with the given copy and the browse action — and no pay bar", () => {
    render(
      <CartPanel
        lines={[]}
        title="Your order"
        emptyTitle="Nothing here yet."
        emptyBody="Let's fix that."
        browseAction={<a href="#menu">Browse the Menu</a>}
        placeAction={<button type="button">Pay ₹0</button>}
      />
    );
    expect(screen.getByRole("heading", { name: "Nothing here yet." })).toBeInTheDocument();
    expect(screen.getByText("Let's fix that.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse the Menu" })).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Pay/ })).not.toBeInTheDocument();
  });

  it("keeps a long dish name and its options on one line each, so the stepper keeps its place", () => {
    render(<CartPanel lines={LINES} />);
    expect(screen.getByText("Paprikaa Chilli Paneer")).toHaveClass("truncate");
    expect(screen.getByText("Sharing · Hot")).toHaveClass("truncate");
  });

  it("merges a caller className", () => {
    const { container } = render(<CartPanel lines={LINES} className="bg-surface-page" />);
    expect(container.firstElementChild).toHaveClass("flex", "bg-surface-page");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <CartPanel
        lines={LINES}
        title="Your order"
        meta="Pickup · Sector 57"
        placeAction={<button type="button">Pay ₹1,008</button>}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run them to verify they fail**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- cart- 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./cart-totals` and `./cart-panel`.

- [ ] **Step 4: Implement the totals**

`packages/ui/src/organisms/cart-panel/cart-totals.ts`:

```ts
export interface CartLine {
  id: string;
  name: string;
  /** Unit price in whole rupees. */
  price: number;
  quantity: number;
  /** Chosen options, e.g. "Sharing · Extra Hot". */
  note?: string | undefined;
}

export interface CartTotals {
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * The cart's money: subtotal, GST rounded to the rupee, and the total. CartPanel renders these
 * numbers; the app calls the same function to label its pay button, so the two never disagree.
 * Pure and outside the client module, so server code can import it too.
 */
export function cartTotals(lines: readonly CartLine[], gstRate: number): CartTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const tax = Math.round(subtotal * gstRate);
  return { subtotal, tax, total: subtotal + tax };
}
```

- [ ] **Step 5: Implement the panel**

`packages/ui/src/organisms/cart-panel/cart-panel.tsx`:

```tsx
"use client";

import { MapPin } from "lucide-react";
import { type ComponentProps, type ReactNode, useId } from "react";

import { Card } from "../../atoms/card/card";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { Icon } from "../../atoms/icon/icon";
import { PriceTag } from "../../atoms/price-tag/price-tag";
import { Text } from "../../atoms/text/text";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { EmptyState } from "../../molecules/empty-state/empty-state";
import { PriceSummary } from "../../molecules/price-summary/price-summary";
import { QuantityStepper } from "../../molecules/quantity-stepper/quantity-stepper";
import { type CartLine, cartTotals } from "./cart-totals";

/** Restaurant service GST (brand.js billing.gstRate). */
const DEFAULT_GST_RATE = 0.05;
const PERCENT = new Intl.NumberFormat("en-IN", { style: "percent", maximumFractionDigits: 2 });

const cartPanel = componentVariants({
  slots: {
    root: "flex min-h-0 flex-1 flex-col",
    header: "px-5 pt-1 pb-3",
    meta: "mt-1.5 flex items-center gap-2 text-text-muted",
    body: "min-h-0 flex-1 overflow-y-auto px-5",
    line: "flex items-center gap-3.5 border-b border-border-subtle py-4",
    thumb: "size-cart-panel-thumb shrink-0 rounded-md bg-surface-brand-soft",
    info: "flex min-w-0 flex-1 flex-col",
    // A long dish name or option line truncates rather than pushing the stepper off the line.
    name: "flex min-w-0 items-center gap-2",
    nameText: "min-w-0 truncate font-display",
    note: "mt-0.5 truncate",
    price: "mt-1.5",
    noteField: "mt-4.5",
    summary: "pt-4.5 pb-5",
    bar: "border-t border-border-subtle bg-surface-card px-5 pt-3 pb-3.5",
    empty: "grid flex-1 place-items-center p-8",
  },
});

export interface CartPanelProps extends Omit<ComponentProps<"section">, "title"> {
  lines: CartLine[];
  title?: ReactNode;
  /** The fulfilment line under the title, e.g. "Pickup · Sector 57 · 12 min". */
  meta?: ReactNode;
  gstRate?: number | undefined;
  /** Quantity 0 means remove the line — the app owns the cart state. */
  onQuantityChange?: ((id: string, quantity: number) => void) | undefined;
  /** The pay button — label it with `cartTotals(lines, gstRate).total`. */
  placeAction?: ReactNode;
  /** The empty state's action, e.g. "Browse the Menu". */
  browseAction?: ReactNode;
  /** The empty state's title, e.g. "Nothing here yet." */
  emptyTitle?: ReactNode;
  emptyBody?: ReactNode;
  /** A kitchen-notes field (an Input), set on a quiet card above the totals. */
  noteField?: ReactNode;
  subtotalLabel?: string | undefined;
  taxLabel?: string | undefined;
  totalLabel?: string | undefined;
  /** Under the total, e.g. "Inclusive of all taxes." */
  note?: ReactNode;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The cart, whole: lines with quantity steppers, an optional kitchen note, totals through
 * PriceSummary (so money formatting stays correct) and a pay bar. Renders its own empty state.
 */
export function CartPanel({
  lines,
  title,
  meta,
  gstRate = DEFAULT_GST_RATE,
  onQuantityChange,
  placeAction,
  browseAction,
  emptyTitle,
  emptyBody,
  noteField,
  subtotalLabel = "Subtotal",
  taxLabel = "GST",
  totalLabel = "Total",
  note,
  headingLevel = 2,
  className,
  ...props
}: CartPanelProps) {
  const titleId = useId();
  const slots = cartPanel();

  if (lines.length === 0) {
    return (
      <section className={slots.root({ className })} {...props}>
        <div className={slots.empty()}>
          {emptyTitle === undefined ? (
            browseAction
          ) : (
            <EmptyState
              variant="symbol"
              title={emptyTitle}
              body={emptyBody}
              action={browseAction}
              headingLevel={headingLevel}
            />
          )}
        </div>
      </section>
    );
  }

  const { subtotal, tax, total } = cartTotals(lines, gstRate);
  const hasTitle = title !== undefined && title !== null;
  return (
    <section
      aria-labelledby={hasTitle ? titleId : undefined}
      className={slots.root({ className })}
      {...props}
    >
      {hasTitle || meta ? (
        <div className={slots.header()}>
          {hasTitle ? (
            <Text as={headingTag(headingLevel)} id={titleId} variant="h3">
              {title}
            </Text>
          ) : null}
          {meta ? (
            <div className={slots.meta()}>
              <Icon icon={MapPin} size="sm" />
              <Text as="span" variant="body-sm" tone="muted">
                {meta}
              </Text>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className={slots.body()}>
        <ul>
          {lines.map((line) => (
            <li key={line.id} className={slots.line()}>
              <span aria-hidden className={slots.thumb()} />
              <div className={slots.info()}>
                <span className={slots.name()}>
                  <DietMark size="sm" />
                  <Text as="span" variant="body-sm" weight="bold" className={slots.nameText()}>
                    {line.name}
                  </Text>
                </span>
                {line.note ? (
                  <Text as="span" variant="caption" tone="subtle" className={slots.note()}>
                    {line.note}
                  </Text>
                ) : null}
                <PriceTag amount={line.price} size="sm" className={slots.price()} />
              </div>
              <QuantityStepper
                label={line.name}
                value={line.quantity}
                min={0}
                size="sm"
                onValueChange={(quantity) => {
                  onQuantityChange?.(line.id, quantity);
                }}
              />
            </li>
          ))}
        </ul>
        {noteField ? (
          <Card variant="quiet" padding="sm" className={slots.noteField()}>
            {noteField}
          </Card>
        ) : null}
        <PriceSummary
          className={slots.summary()}
          lines={[
            { label: subtotalLabel, amount: subtotal },
            { label: `${taxLabel} (${PERCENT.format(gstRate)})`, amount: tax },
          ]}
          total={total}
          totalLabel={totalLabel}
          note={note}
        />
      </div>
      {placeAction ? <div className={slots.bar()}>{placeAction}</div> : null}
    </section>
  );
}
```

- [ ] **Step 6: Run them to verify they pass**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- cart- 2>&1 | tail -8`
Expected: PASS (5 + 10 tests).

- [ ] **Step 7: Stories (card parity with `CartPanel.card.html`)**

`packages/ui/src/organisms/cart-panel/cart-panel.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { formatRupees } from "@pink-paprikaa-web/utils";
import { ArrowRight, Pencil } from "lucide-react";
import { useState } from "react";
import { expect, within } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { Input } from "../../atoms/input/input";
import { VIEWPORT_360 } from "../story-fixtures";
import { CartPanel } from "./cart-panel";
import { type CartLine, cartTotals } from "./cart-totals";

const GST_RATE = 0.05;

/** The design system card's cart. */
const LINES: CartLine[] = [
  {
    id: "chilli-paneer",
    name: "Paprikaa Chilli Paneer",
    price: 280,
    quantity: 2,
    note: "Sharing · Hot",
  },
  { id: "cold-brew", name: "Masala Cold Brew", price: 220, quantity: 1, note: "Regular" },
  { id: "kulfi", name: "Gulkand Kulfi", price: 180, quantity: 1, note: "Regular" },
];

const FRAME = "flex h-165 flex-col overflow-hidden rounded-lg border border-border-subtle";

const BROWSE = <Button>Browse the Menu</Button>;

/** A working cart: quantity 0 removes the line; the pay button uses the same totals. */
function WorkingCart() {
  const [lines, setLines] = useState(LINES);
  const { total } = cartTotals(lines, GST_RATE);
  return (
    <div className={`${FRAME} w-90`}>
      <CartPanel
        lines={lines}
        title="Your order"
        meta="Pickup · Sector 57 · 12 min"
        gstRate={GST_RATE}
        onQuantityChange={(id, quantity) => {
          setLines((current) =>
            quantity <= 0
              ? current.filter((line) => line.id !== id)
              : current.map((line) => (line.id === id ? { ...line, quantity } : line))
          );
        }}
        noteField={
          <Input
            aria-label="Notes for the kitchen"
            placeholder="Any notes for the kitchen?"
            icon={Pencil}
          />
        }
        note="Inclusive of all taxes."
        placeAction={
          <Button isFullWidth size="lg" iconAfter={ArrowRight}>
            {`Pay ${formatRupees(total)}`}
          </Button>
        }
        emptyTitle="Nothing here yet."
        emptyBody="Let's fix that."
        browseAction={BROWSE}
      />
    </div>
  );
}

const meta = {
  title: "Organisms/CartPanel",
  component: CartPanel,
  args: { lines: LINES, title: "Your order", meta: "Pickup · Sector 57 · 12 min" },
  parameters: {
    docs: {
      description: {
        component:
          "The cart, whole. Renders its own empty state. Quantity down to 0 removes the line (the app owns the state and gets `onQuantityChange`). Totals go through PriceSummary so money formatting stays correct; label the pay button with `cartTotals(lines, gstRate).total` so it always matches.",
      },
    },
  },
} satisfies Meta<typeof CartPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div className={`${FRAME} w-90`}>
      <CartPanel {...args} />
    </div>
  ),
};

/** Card row: the filled cart — change a quantity, the total follows. */
export const Filled: Story = {
  render: () => <WorkingCart />,
  play: async ({ canvas, userEvent }) => {
    const stepper = canvas.getByRole("group", { name: "Masala Cold Brew" });
    const buttons = within(stepper).getAllByRole("button");
    const add = buttons[buttons.length - 1];
    if (add === undefined) throw new Error("the stepper has no add button");
    await userEvent.click(add);
    await expect(canvas.getByRole("button", { name: "Pay ₹1,239" })).toBeInTheDocument();
  },
};

/** Card row: the empty state. */
export const Empty: Story = {
  args: {
    lines: [],
    emptyTitle: "Nothing here yet.",
    emptyBody: "Let's fix that.",
    browseAction: BROWSE,
  },
  render: (args) => (
    <div className={`${FRAME} w-75`}>
      <CartPanel {...args} />
    </div>
  ),
};

/** A single line, so the summary and the pay bar read against a short list. */
export const OneLine: Story = {
  args: { lines: LINES.slice(0, 1) },
  render: (args) => (
    <div className={`${FRAME} w-90`}>
      <CartPanel {...args} />
    </div>
  ),
};

/** Dine-in swaps the fulfilment line; everything else is the same panel. */
export const DineIn: Story = {
  args: { meta: "Dine-in · Table 4 · Sector 57" },
  render: (args) => (
    <div className={`${FRAME} w-90`}>
      <CartPanel {...args} />
    </div>
  ),
};

/** The smallest supported viewport: the panel runs full width and nothing truncates badly. */
export const Mobile: Story = {
  globals: VIEWPORT_360,
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <div className="flex h-165 flex-col">
      <CartPanel {...args} />
    </div>
  ),
};
```

- [ ] **Step 8: Export**

```ts
export { CartPanel, type CartPanelProps } from "./organisms/cart-panel/cart-panel";
export { type CartLine, cartTotals, type CartTotals } from "./organisms/cart-panel/cart-totals";
```

- [ ] **Step 9: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/cart-panel packages/design-tokens/tokens/component/cart-panel.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/cart-panel.json packages/ui/src/organisms/cart-panel packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): add the CartPanel organism

The whole cart as a client component: lines with the veg mark, note, unit
price and a quantity stepper that reports changes up, an optional kitchen
note, totals through PriceSummary and a pay bar, and its own symbol empty
state with the app's copy. The money maths is a pure cartTotals export the
app reuses to label the pay button.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

