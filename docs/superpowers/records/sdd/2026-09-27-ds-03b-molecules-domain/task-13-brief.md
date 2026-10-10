### Task 13: KeyValueList

**Files:**

- Create: `packages/ui/src/molecules/key-value-list/key-value-list.tsx`, `key-value-list.test.tsx`, `key-value-list.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: `componentVariants` only (semantic text/border tokens, so it follows any surface).
- Produces: `KeyValueList`, `type KeyValueListProps`, `type KeyValueItem` (contract §6 + deviation 4). `KeyValueItem` is also consumed by QuotePanel (Plan 4, `lines?: KeyValueItem[]`). Defaults: `density = "default"`, `hasDividers = true`, `emphasis = "value"`; without `keyWidth` the row is a split row.

- [ ] **Step 1: Tokens** — none new: key columns are `w-22` (88px, the calculator's "Your box") and `w-30` (120px, the booking rules / box compare); rows `py-2` / `py-3`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/key-value-list/key-value-list.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { KeyValueList } from "./key-value-list";

const BOX = [
  { key: "Dal", value: "1, from 8 dals incl. Rajma, Chole, Dal Makhani" },
  { key: "Rice", value: "200g · jeera rice Tue & Wed" },
  { key: "Add-on", value: "Sweet Lassi (250ml)", isEmphasised: true },
];

describe("KeyValueList", () => {
  it("is a description list of term and definition pairs", () => {
    render(<KeyValueList items={BOX} />);
    expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual([
      "Dal",
      "Rice",
      "Add-on",
    ]);
    expect(screen.getAllByRole("definition")).toHaveLength(3);
  });

  it.each([
    ["sm", "w-22"],
    ["md", "w-30"],
  ] as const)("gives the key a fixed %s column", (keyWidth, widthClass) => {
    render(<KeyValueList items={BOX} keyWidth={keyWidth} />);
    expect(screen.getAllByRole("term")[0]).toHaveClass(widthClass, "shrink-0");
    expect(screen.getAllByRole("definition")[0]).toHaveClass("flex-1");
  });

  it("sets key and value at either end of the row without a key width", () => {
    render(<KeyValueList items={BOX} />);
    const [firstValue] = screen.getAllByRole("definition");
    expect(firstValue).toHaveClass("text-end");
    expect(firstValue?.parentElement).toHaveClass("justify-between", "flex-wrap");
  });

  it("mutes the key and leads with the value by default, or leads with the key", () => {
    const { rerender } = render(<KeyValueList items={BOX} />);
    expect(screen.getAllByRole("term")[0]).toHaveClass("text-text-muted");
    expect(screen.getAllByRole("definition")[0]).toHaveClass("text-text-heading");
    rerender(<KeyValueList items={BOX} emphasis="key" />);
    expect(screen.getAllByRole("term")[0]).toHaveClass("font-bold", "text-text-heading");
    expect(screen.getAllByRole("definition")[0]).toHaveClass("text-text-muted");
  });

  it("picks out an emphasised value in the brand colour", () => {
    render(<KeyValueList items={BOX} />);
    const values = screen.getAllByRole("definition");
    expect(values[2]).toHaveClass("font-semibold", "text-text-brand");
    expect(values[0]).not.toHaveClass("text-text-brand");
  });

  it("rules every row by default and drops the rules on request", () => {
    const { rerender } = render(<KeyValueList items={BOX} />);
    expect(screen.getAllByRole("term")[0]?.parentElement).toHaveClass("border-t");
    rerender(<KeyValueList items={BOX} hasDividers={false} />);
    expect(screen.getAllByRole("term")[0]?.parentElement).not.toHaveClass("border-t");
  });

  it("tightens the rows when compact", () => {
    const { rerender } = render(<KeyValueList items={BOX} />);
    expect(screen.getAllByRole("term")[0]?.parentElement).toHaveClass("py-3");
    rerender(<KeyValueList items={BOX} density="compact" />);
    expect(screen.getAllByRole("term")[0]?.parentElement).toHaveClass("py-2");
  });

  it("takes any content as a value", () => {
    render(<KeyValueList items={[{ key: "Status", value: <strong>Confirmed</strong> }]} />);
    expect(screen.getByRole("definition")).toContainElement(screen.getByText("Confirmed"));
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<KeyValueList items={BOX} keyWidth="sm" density="compact" />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- key-value-list 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./key-value-list`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/key-value-list/key-value-list.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { componentVariants } from "../../lib/component-variants";

export interface KeyValueItem {
  key: ReactNode;
  value: ReactNode;
  /** Picks the value out in the brand colour (a changed or added item). */
  isEmphasised?: boolean | undefined;
}

export interface KeyValueListProps extends ComponentProps<"dl"> {
  items: KeyValueItem[];
  density?: "compact" | "default" | undefined;
  /** A fixed key column (88 / 120px). Without it, key and value sit at either end of the row. */
  keyWidth?: "sm" | "md" | undefined;
  hasDividers?: boolean | undefined;
  /** `value`: muted key, strong value. `key`: strong key, muted value. */
  emphasis?: "value" | "key" | undefined;
}

const keyValueList = componentVariants({
  slots: {
    root: "m-0 text-body-sm",
    row: "flex gap-x-3 gap-y-1",
    key: "m-0",
    value: "m-0 min-w-0",
  },
  variants: {
    density: { compact: { row: "py-2" }, default: { row: "py-3" } },
    keyWidth: { sm: { key: "w-22 shrink-0" }, md: { key: "w-30 shrink-0" } },
    isSplit: {
      true: { row: "flex-wrap justify-between", value: "text-end" },
      false: { value: "flex-1" },
    },
    hasDividers: { true: { row: "border-t border-border-subtle" }, false: {} },
    emphasis: {
      value: { key: "text-text-muted", value: "text-text-heading" },
      key: { key: "font-display font-bold text-text-heading", value: "text-text-muted" },
    },
    isEmphasised: { true: { value: "font-semibold text-text-brand" }, false: {} },
  },
});

/**
 * Label/value rows as a `<dl>`: the calculator's "Your box", booking rules, customisations,
 * price lists and quote lines. Semantic tokens only, so it reads on any surface.
 */
export function KeyValueList({
  items,
  density = "default",
  keyWidth,
  hasDividers = true,
  emphasis = "value",
  className,
  ...props
}: KeyValueListProps) {
  const styles = keyValueList({
    density,
    hasDividers,
    emphasis,
    isSplit: keyWidth === undefined,
    ...(keyWidth === undefined ? {} : { keyWidth }),
  });

  return (
    <dl className={styles.root({ className })} {...props}>
      {items.map((item, index) => (
        <div key={index} className={styles.row()}>
          <dt className={styles.key()}>{item.key}</dt>
          <dd className={styles.value({ isEmphasised: item.isEmphasised === true })}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- key-value-list 2>&1 | tail -8`
Expected: PASS (10 tests).

- [ ] **Step 6: Stories — "Your box", booking rules, customisations, add-on prices, quote lines, OnSurfaces**

`packages/ui/src/molecules/key-value-list/key-value-list.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { OnSurfaces } from "../../lib/story-surfaces";
import { KeyValueList } from "./key-value-list";

/** PlanCalculator "Your box" for Classic (`rates.js` → homely.plates[1].box). */
const YOUR_BOX = [
  { key: "Dal", value: "1, from 8 dals incl. Rajma, Chole, Dal Makhani" },
  { key: "Sabji", value: "1, from 18 sabjis incl. Mix Veg, Kofta, Gatte" },
  { key: "Rice", value: "200g · jeera rice Tue & Wed" },
  { key: "Roti", value: "3 fresh tawa roti" },
  { key: "Salad", value: "Salad + chutney" },
  { key: "Raita", value: "3× a week, incl. biryani day" },
  { key: "Paneer", value: "Mon lunch · Wed dinner — restaurant-style" },
  { key: "Dessert", value: "Biryani day only" },
  {
    key: "Biryani",
    value: "Veg Dum Biryani, Fri lunch · Tue dinner — with Salan, Raita, Gulab Jamun",
  },
  { key: "Add-on", value: "Sweet Lassi (250ml)", isEmphasised: true },
];

const meta = {
  title: "Molecules/KeyValueList",
  component: KeyValueList,
  args: { items: YOUR_BOX, keyWidth: "sm", density: "compact" },
  decorators: [
    (Story) => (
      <div className="w-full max-w-text-measure-prose">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Label/value rows as a `<dl>` — the calculator\'s "Your box", the catering booking rules, the customisation list, price lists and quote lines. `keyWidth` fixes a key column; without it key and value sit at either end of the row. `emphasis="key"` leads with the key; `isEmphasised` picks out a changed or added value. Semantic tokens only, so it reads on any surface.',
      },
    },
  },
} satisfies Meta<typeof KeyValueList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** PlanCalculator "Your box". */
export const YourBox: Story = {};

/** Catering "How to book" rules panel — strong keys on the ink section. */
export const BookingRules: Story = {
  args: {
    keyWidth: "md",
    density: "default",
    emphasis: "key",
    items: [
      {
        key: "Minimum",
        value: "15 guests for a Dawat · 50 pieces for snacks · 25 guests for setup and service",
      },
      { key: "Notice", value: "24 hours up to 50 guests · 48 hours above 50" },
      { key: "Advance", value: "50% to confirm the date, balance on delivery" },
      { key: "GST", value: "Prices exclude GST, charged at 5%" },
      { key: "Changes", value: "Menu and headcount free up to 24 hours before" },
      { key: "Trial Dawat", value: "Normal per-head rate, credited in full when you confirm" },
    ],
  },
  render: (args) => (
    <div data-surface="ink" className="rounded-xl bg-surface-inverse p-6">
      <div className="rounded-xl bg-surface-card px-6 py-1">
        <KeyValueList {...args} />
      </div>
    </div>
  ),
};

/** HomelyMeals "Make it yours" — split rows. */
export const Customisations: Story = {
  args: {
    keyWidth: undefined,
    density: "default",
    emphasis: "key",
    items: [
      { key: "Rice only, no roti", value: "Rice raised to 300g" },
      { key: "Roti only, no rice", value: "2 extra roti" },
      { key: "Less spicy, or no chilli", value: "Same food, cooked mild" },
      { key: "Skip a single meal", value: "No charge for that meal" },
      { key: "No onion, no garlic", value: `${formatRupees(30)} a meal · separate pan` },
    ],
  },
};

/** Catering "Upgrades, per head" — a price list. */
export const UpgradePrices: Story = {
  args: {
    keyWidth: undefined,
    density: "default",
    items: [
      { key: "Paneer gravy instead of Mix Veg", value: `+${formatRupees(25)}` },
      { key: "Dal Makhani instead of Dal Fry", value: `+${formatRupees(25)}` },
      { key: "Jeera Rice instead of Steamed Rice", value: `+${formatRupees(20)}` },
      { key: "Lachha Paratha in place of one roti", value: `+${formatRupees(25)}` },
      { key: "Gulab Jamun, 2 pc instead of 1", value: `+${formatRupees(15)}` },
    ],
  },
};

/** PlanCalculator quote lines on the brand panel (Classic launch price, Weekday plan). */
export const QuoteLines: Story = {
  args: {
    keyWidth: undefined,
    items: [
      { key: `${formatRupees(130)} × 24 meals`, value: formatRupees(3120) },
      { key: "Offer: free meals (1)", value: formatRupees(0) },
      { key: "GST 5%", value: formatRupees(156) },
      { key: "Meals delivered", value: "25" },
    ],
  },
  render: (args) => (
    <div data-surface="brand" className="rounded-xl bg-surface-brand p-6">
      <KeyValueList {...args} />
    </div>
  ),
};

export const OnSurfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <div className="min-w-0 flex-1">
        <KeyValueList {...args} />
      </div>
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export {
  type KeyValueItem,
  KeyValueList,
  type KeyValueListProps,
} from "./molecules/key-value-list/key-value-list";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/ui/src/molecules/key-value-list packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/molecules/key-value-list packages/ui/src/index.ts
git commit -m "feat(ui): KeyValueList molecule

Label/value rows as a real <dl> for the handoff's box contents, booking
rules, customisations, price lists and quote lines: fixed key column or
split row, muted-key or strong-key emphasis, an emphasised value, and
semantic tokens so it reads on every surface.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

