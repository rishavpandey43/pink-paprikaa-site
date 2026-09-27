### Task 18: PriceSummary

Design-system sources: `components/molecules/PriceSummary.*`; organism `CartPanel.jsx`. Card rows: simple · discount · inverse (on ink).

**Files:**

- Create: `packages/design-tokens/tokens/component/price-summary.json`
- Create: `packages/ui/src/molecules/price-summary/price-summary.tsx`, `price-summary.test.tsx`, `price-summary.stories.tsx`
- Modify: `packages/design-tokens/tokens/surface/{brand,ink,light}.json`, `packages/design-tokens/contrast-pairs.json`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/price-summary/price-summary.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                   | Ruling  | Where / why                                                                                               |
| -------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| Indian digit grouping (`₹1,20,000`)                                        | ADD     | test "groups digits the Indian way"                                                                       |
| a total with no lines; note only when given                                | ADD     | test "renders a total with no lines…" (`lines={[]}`) + `TotalOnly` story                                  |
| caller `className` merges                                                  | ADD     | test "merges a caller className…"                                                                         |
| `WithStrongLine`, `Receipt` (renamed total + fine print), `Narrow` stories | ADD     | `WithStrongLine`, `Receipt`, `Narrow` stories                                                             |
| figures in Space Mono so digits line up                                    | ALREADY | `tabular-nums` + assertion; the design system's `PriceSummary.jsx` sets amounts in body-sm, not mono (D2) |
| `tone="inverse"` (75% / 90% white lines, soft-mint saving on ink)          | DROP    | spec D5, deviation 7 — lines follow the surface; the discount is a surface-overridden token               |
| `lines` optional (default `[]`)                                            | DROP    | contracts §5 `lines: PriceLine[]` is required; `[]` is covered                                            |
| rupee sign, no space, no decimals; discount minus in mint; strong line     | ALREADY | tests "lists each line…", "prints a discount…", "emphasises a strong line"                                |
| total label renamed; fine print                                            | ALREADY | test "takes another total label and a note"                                                               |
| `Default`, `WithDiscount`, `OnInk` stories                                 | ALREADY | `Playground`, `WithDiscount`, `OnInk`, `Surfaces`                                                         |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `formatRupees` (`@pink-paprikaa-web/utils`); `PriceTag` (Plan 2b — its default `ink` tone paints `text-text-heading`, so the total follows the surface); `OnSurfaces` (Plan 2a, stories).
- Produces: `PriceSummary`, `PriceSummaryProps`, `PriceLine` — contract §5 without `tone` (deviation 7). A `<dl>`: every line is a `<div>` of `<dt>` + `<dd>`, the total is the last group. Discounts print with a true minus (`−₹100`), never a hand-typed hyphen.

- [ ] **Step 1: Component token, surface skin and contrast pairs**

`packages/design-tokens/tokens/component/price-summary.json`:

```json
{
  "color": {
    "$type": "color",
    "price-summary-discount": {
      "$value": "{color.mint-strong}",
      "$description": "A discount line's amount. White on brand and ink fields, where the minus sign carries the meaning."
    }
  }
}
```

(It aliases the primitive, not `text-success`: Plan 2a's `surface-aliases.spec.ts` forbids aliasing a semantic token a surface may override.)

Inside `surface-brand` → `color` (`tokens/surface/brand.json`) and `surface-ink` → `color` (`tokens/surface/ink.json`) add:

```json
"price-summary-discount": { "$value": "{color.ink.000}" }
```

Inside `surface-light` → `color` (`tokens/surface/light.json`) add:

```json
"price-summary-discount": { "$value": "{color.mint-strong}" }
```

Append to `contrast-pairs.json` → `groups`:

```json
{
  "id": "price-summary",
  "surface": null,
  "foregrounds": ["color-price-summary-discount"],
  "backgrounds": [
    "color-surface-page",
    "color-surface-page-alt",
    "color-surface-card",
    "color-surface-brand-soft"
  ],
  "min": 4.5
},
{
  "id": "price-summary-ink",
  "surface": "ink",
  "pairs": [["color-price-summary-discount", "color-surface-inverse"]],
  "min": 4.5
},
{
  "id": "price-summary-brand",
  "surface": "brand",
  "pairs": [["color-price-summary-discount", "color-surface-brand"]],
  "min": 3,
  "exception": "brand-fill"
}
```

Rebuild and run the token tests (policy, light-restore and surface-alias suites). Expected: PASS (≈ 6.4 / 6.0 / 6.4 / 5.0 on light grounds; 18.4 on ink; 4.04 on the brand fill).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/price-summary/price-summary.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { type PriceLine, PriceSummary } from "./price-summary";

const LINES: PriceLine[] = [
  { label: "Subtotal", amount: 1180 },
  { label: "GST (5%)", amount: 59 },
  { label: "First order", amount: 100, isDiscount: true },
];

describe("PriceSummary", () => {
  it("lists each line as a term and its amount, formatted the brand way", () => {
    render(<PriceSummary lines={LINES} total={1139} />);
    const terms = screen.getAllByRole("term").map((term) => term.textContent);
    const amounts = screen.getAllByRole("definition").map((amount) => amount.textContent);
    expect(terms).toEqual(["Subtotal", "GST (5%)", "First order", "Total"]);
    expect(amounts.slice(0, 3)).toEqual(["₹1,180", "₹59", "−₹100"]);
    // Tabular figures, so the column's digits line up.
    expect(screen.getByText("₹1,180")).toHaveClass("tabular-nums");
  });

  it("groups digits the Indian way", () => {
    render(<PriceSummary lines={[{ label: "Subtotal", amount: 120000 }]} total={126000} />);
    expect(screen.getByText("₹1,20,000")).toBeInTheDocument();
  });

  it("renders a total with no lines, and a note only when given", () => {
    const { rerender } = render(<PriceSummary lines={[]} total={280} />);
    expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual(["Total"]);
    expect(screen.queryByText("Inclusive of all taxes.")).not.toBeInTheDocument();
    rerender(<PriceSummary lines={[]} total={280} note="Inclusive of all taxes." />);
    expect(screen.getByText("Inclusive of all taxes.")).toBeInTheDocument();
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(<PriceSummary lines={LINES} total={1139} className="gap-4" />);
    expect(container.firstElementChild).toHaveClass("gap-4");
    expect(container.firstElementChild).not.toHaveClass("gap-2");
  });

  it("prints a discount with a true minus in the discount colour, whatever sign it is given", () => {
    render(
      <PriceSummary lines={[{ label: "First order", amount: -100, isDiscount: true }]} total={0} />
    );
    const amount = screen.getByText("−₹100");
    expect(amount).toHaveClass("text-price-summary-discount");
  });

  it("emphasises a strong line", () => {
    render(<PriceSummary lines={[{ label: "Plates", amount: 960, isStrong: true }]} total={960} />);
    expect(screen.getByText("Plates")).toHaveClass("text-text-heading");
    expect(screen.getByText("₹960", { selector: "dd" })).toHaveClass("font-medium");
  });

  it("closes with the total, under a hairline, in a large price", () => {
    render(<PriceSummary lines={LINES} total={1139} />);
    const totalGroup = screen.getByText("Total").parentElement;
    expect(totalGroup).toHaveClass("border-t");
    expect(within(totalGroup as HTMLElement).getByText("₹1,139")).toBeInTheDocument();
  });

  it("takes another total label and a note", () => {
    render(
      <PriceSummary lines={LINES} total={1139} totalLabel="To pay" note="Inclusive of all taxes." />
    );
    expect(screen.getByText("To pay")).toBeInTheDocument();
    expect(screen.getByText("Inclusive of all taxes.")).toHaveClass("text-text-subtle");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <PriceSummary lines={LINES} total={1139} note="Inclusive of all taxes." />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/price-summary 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./price-summary`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/price-summary/price-summary.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { PriceTag } from "../../atoms/price-tag/price-tag";
import { componentVariants } from "../../lib/component-variants";

const priceSummary = componentVariants({
  slots: {
    root: "grid gap-2",
    list: "m-0 grid gap-2",
    line: "flex justify-between gap-4 text-body-sm",
    label: "text-text-muted",
    amount: "m-0 text-text-body tabular-nums",
    totalLine: "mt-1 flex items-center justify-between gap-4 border-t border-border-subtle pt-3",
    totalLabel: "font-display text-h4 text-text-heading",
    total: "m-0",
    note: "m-0 text-caption text-text-subtle",
  },
  variants: {
    isStrong: { true: { label: "text-text-heading", amount: "font-medium" } },
    isDiscount: { true: { amount: "text-price-summary-discount" } },
  },
  defaultVariants: { isStrong: false, isDiscount: false },
});

export interface PriceLine {
  label: ReactNode;
  /** Whole rupees. */
  amount: number;
  /** Prints with a leading minus in the discount colour (the sign given is ignored). */
  isDiscount?: boolean | undefined;
  isStrong?: boolean | undefined;
}

export interface PriceSummaryProps extends ComponentProps<"div"> {
  lines: PriceLine[];
  /** Whole rupees. */
  total: number;
  totalLabel?: string | undefined;
  /** Fine print under the total, e.g. "Inclusive of all taxes." */
  note?: ReactNode;
}

/**
 * Cart totals, checkout summary, order receipts — and, with PriceTag, the only correct source of a
 * rupee amount. Follows the surface: on an ink or pink field every line turns light.
 */
export function PriceSummary({
  lines,
  total,
  totalLabel = "Total",
  note,
  className,
  ...props
}: PriceSummaryProps) {
  const styles = priceSummary();

  return (
    <div className={styles.root({ className })} {...props}>
      <dl className={styles.list()}>
        {lines.map((line, index) => {
          const isDiscount = line.isDiscount === true;
          const isStrong = line.isStrong === true;
          return (
            <div key={index} className={styles.line()}>
              <dt className={styles.label({ isStrong })}>{line.label}</dt>
              <dd className={styles.amount({ isStrong, isDiscount })}>
                {formatRupees(isDiscount ? -Math.abs(line.amount) : line.amount)}
              </dd>
            </div>
          );
        })}
        <div className={styles.totalLine()}>
          <dt className={styles.totalLabel()}>{totalLabel}</dt>
          <dd className={styles.total()}>
            <PriceTag amount={total} size="lg" />
          </dd>
        </div>
      </dl>
      {note === undefined || note === null ? null : <p className={styles.note()}>{note}</p>}
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/price-summary 2>&1 | tail -8`
Expected: PASS (9 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/price-summary/price-summary.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { PriceSummary } from "./price-summary";

const SUBTOTAL_AND_GST = [
  { label: "Subtotal", amount: 1180 },
  { label: "GST (5%)", amount: 59 },
];

const meta = {
  title: "Molecules/PriceSummary",
  component: PriceSummary,
  args: { lines: SUBTOTAL_AND_GST, total: 1239 },
  parameters: {
    docs: {
      description: {
        component:
          "Cart totals, checkout summary and order receipts, as a definition list. Never hand-format a rupee amount — this component and PriceTag are the only correct sources: `₹` with no space, Indian grouping, discounts with a true minus in mint. On an ink or pink field it follows the surface (no `tone` prop): every line turns light and the discount turns white, the minus carrying its meaning.",
      },
    },
  },
} satisfies Meta<typeof PriceSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "simple". */
export const Playground: Story = {};

/** Card row "discount". */
export const WithDiscount: Story = {
  args: {
    total: 1139,
    note: "Inclusive of all taxes.",
    lines: [...SUBTOTAL_AND_GST, { label: "First order", amount: 100, isDiscount: true }],
  },
};

/** Card row "inverse" — on an ink field. */
export const OnInk: Story = {
  render: (args) => (
    <div data-surface="ink" className="rounded-lg bg-surface-inverse p-6">
      <PriceSummary {...args} />
    </div>
  ),
};

export const Surfaces: Story = {
  args: {
    total: 1139,
    lines: [...SUBTOTAL_AND_GST, { label: "First order", amount: 100, isDiscount: true }],
  },
  render: (args) => (
    <OnSurfaces>
      <PriceSummary {...args} className="w-full" />
    </OnSurfaces>
  ),
};

/** Dev parity: `isStrong` pulls a running subtotal up to heading weight above the taxes. */
export const WithStrongLine: Story = {
  args: {
    total: 1239,
    lines: [
      { label: "Two thalis", amount: 560 },
      { label: "Paneer tikka masala", amount: 320 },
      { label: "Chilli garlic momos", amount: 300 },
      { label: "Items", amount: 1180, isStrong: true },
      { label: "GST (5%)", amount: 59 },
    ],
  },
};

/** Dev parity: the receipt shape — a renamed total and the fine print under it. */
export const Receipt: Story = {
  args: { totalLabel: "Amount paid", note: "Inclusive of all taxes. Paid by UPI." },
};

/** Dev parity: a total with no lines — the smallest useful summary. */
export const TotalOnly: Story = {
  args: { lines: [], total: 280, note: "Inclusive of all taxes." },
};

/** Dev parity: at 360px the label gives way first; the amount never wraps. */
export const Narrow: Story = {
  args: {
    total: 1139,
    lines: [
      { label: "Subtotal before the counter discount", amount: 1180 },
      { label: "GST (5%)", amount: 59 },
      { label: "First order", amount: 100, isDiscount: true },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-80">
        <Story />
      </div>
    ),
  ],
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export {
  type PriceLine,
  PriceSummary,
  type PriceSummaryProps,
} from "./molecules/price-summary/price-summary";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/price-summary packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/price-summary packages/ui/src/index.ts packages/design-tokens/tokens packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): PriceSummary molecule

Money lines as a definition list, formatted by formatRupees, discounts
with a true minus, the total as a large PriceTag under a hairline. The
discount colour is a surface component token, so there is no tone prop.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

