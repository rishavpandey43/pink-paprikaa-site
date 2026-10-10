### Task 20: Table

**Files:**

- Create: `packages/design-tokens/tokens/component/table.json`
- Modify: `packages/design-tokens/contrast-pairs.json`, `packages/ui/src/lib/component-variants.ts` (`TEXT`, `SPACING`)
- Create: `packages/ui/src/molecules/table/table.tsx`, `table.test.tsx`, `table.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: `useId`; semantic tokens (the frame is a light island: `data-surface="light"`).
- Produces (one file, compound): `Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell` and `type TableProps`, `TableHeadProps`, `TableBodyProps`, `TableRowProps`, `TableHeaderCellProps`, `TableCellProps` (contract §6 + deviation 2). Server-safe. Defaults: `isCaptionVisible = false`, `minWidth = "none"`, `TableHeaderCell scope = "col"`. With a `minWidth`, the frame is a named (`aria-labelledby` the caption), focusable (`tabIndex=0`) `role="region"` that scrolls horizontally.

- [ ] **Step 1: Component tokens and contrast pairs**

Create `packages/design-tokens/tokens/component/table.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "table-sm": { "$value": "460px", "$description": "Min width: offers / glance tables." },
    "table-md": { "$value": "620px", "$description": "Min width: the price matrix." },
    "table-lg": { "$value": "720px", "$description": "Min width: the box comparison." }
  },
  "text": {
    "$type": "typography",
    "table-head": {
      "$value": { "fontSize": "13px", "lineHeight": 1.3, "fontWeight": "{font-weight.bold}" },
      "$description": "Column headers (handoff 12–14px Poppins 700)."
    }
  }
}
```

Append `"table-head",` to `TEXT` and `"table-sm", "table-md", "table-lg",` to `SPACING`.

Append to `groups` in `contrast-pairs.json`:

```json
{
  "id": "table-head",
  "surface": null,
  "pairs": [
    ["color-text-heading", "color-surface-brand-soft"],
    ["color-pink-700", "color-surface-brand-soft"]
  ],
  "min": 4.5
}
```

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6`
Expected: PASS (ink-900 on pink-100 ≈ 14.5:1; pink-700 on pink-100 5.66:1).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/table/table.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  type TableProps,
} from "./table";

function PriceList(props: Partial<TableProps>) {
  return (
    <Table caption="Homely Meals price list" minWidth="md" {...props}>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Plate</TableHeaderCell>
          <TableHeaderCell>Trial</TableHeaderCell>
          <TableHeaderCell isHighlighted>Weekday plan</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableHeaderCell scope="row">Classic</TableHeaderCell>
          <TableCell>₹650</TableCell>
          <TableCell isHighlighted>
            <button type="button">₹3,120</button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

describe("Table", () => {
  it("is a semantic table named by its caption", () => {
    render(<PriceList />);
    expect(screen.getByRole("table", { name: "Homely Meals price list" })).toBeInTheDocument();
  });

  it("wraps a wide table in a named, focusable scroll region", () => {
    render(<PriceList />);
    const region = screen.getByRole("region", { name: "Homely Meals price list" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toHaveClass("overflow-x-auto");
    expect(within(region).getByRole("table")).toHaveClass("min-w-table-md");
  });

  it("adds no scroll region or extra tab stop when the table never needs to scroll", () => {
    render(<PriceList minWidth="none" />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(screen.getByRole("table").parentElement).not.toHaveAttribute("tabindex");
  });

  it("keeps header association: column headers and row headers", () => {
    render(<PriceList />);
    expect(screen.getAllByRole("columnheader").map((cell) => cell.getAttribute("scope"))).toEqual([
      "col",
      "col",
      "col",
    ]);
    expect(screen.getByRole("rowheader", { name: "Classic" })).toHaveAttribute("scope", "row");
  });

  it("highlights the chosen column cell by cell", () => {
    render(<PriceList />);
    expect(screen.getByRole("columnheader", { name: "Weekday plan" })).toHaveClass("text-pink-700");
    expect(screen.getByRole("button", { name: "₹3,120" }).closest("td")).toHaveClass(
      "font-semibold"
    );
    expect(screen.getByRole("cell", { name: "₹650" })).not.toHaveClass("font-semibold");
  });

  it("reaches the scroll region, then the interactive cells, by keyboard", async () => {
    const user = userEvent.setup();
    render(<PriceList />);
    await user.tab();
    expect(screen.getByRole("region")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "₹3,120" })).toHaveFocus();
  });

  it("hides the caption visually by default and shows it on request", () => {
    const { rerender } = render(<PriceList />);
    expect(screen.getByText("Homely Meals price list")).toHaveClass("sr-only");
    rerender(<PriceList isCaptionVisible />);
    expect(screen.getByText("Homely Meals price list")).not.toHaveClass("sr-only");
  });

  it("is a light island even on dark sections", () => {
    render(<PriceList />);
    expect(screen.getByRole("region")).toHaveAttribute("data-surface", "light");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<PriceList />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- table 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./table`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/table/table.tsx`:

```tsx
import { type ComponentProps, type ReactNode, useId } from "react";

import { componentVariants } from "../../lib/component-variants";

const table = componentVariants({
  slots: {
    frame: "overflow-x-auto rounded-xl border border-border-subtle bg-surface-card shadow-1",
    table: "w-full border-collapse text-left text-body-sm text-text-body",
    caption: "px-5 pt-4 pb-2 text-left font-display text-body font-bold text-text-heading",
  },
  variants: {
    minWidth: {
      none: {},
      sm: { table: "min-w-table-sm" },
      md: { table: "min-w-table-md" },
      lg: { table: "min-w-table-lg" },
    },
    isCaptionVisible: { true: {}, false: { caption: "sr-only" } },
  },
});

const tableHead = componentVariants({
  base: "border-b border-border-subtle bg-surface-brand-soft",
});
const tableBody = componentVariants({ base: "divide-y divide-border-subtle" });

const tableHeaderCell = componentVariants({
  base: "px-3 first:pl-5 last:pr-5",
  variants: {
    isRowHeader: {
      false: "text-table-head py-3.5 align-bottom font-display text-text-heading",
      true: "py-3 align-top font-display font-bold text-text-heading",
    },
    isHighlighted: { true: "", false: "" },
  },
  compoundVariants: [{ isRowHeader: false, isHighlighted: true, class: "text-pink-700" }],
});

const tableCell = componentVariants({
  base: "px-3 py-3 align-top first:pl-5 last:pr-5",
  variants: { isHighlighted: { true: "font-semibold text-text-heading", false: "" } },
});

export interface TableProps extends ComponentProps<"table"> {
  /** Names the table (and its scroll region). Visually hidden unless `isCaptionVisible`. */
  caption: ReactNode;
  isCaptionVisible?: boolean | undefined;
  /** Below this width the table scrolls sideways inside its frame (460 / 620 / 720px). */
  minWidth?: "none" | "sm" | "md" | "lg" | undefined;
}

export type TableHeadProps = ComponentProps<"thead">;
export type TableBodyProps = ComponentProps<"tbody">;
export type TableRowProps = ComponentProps<"tr">;

export interface TableHeaderCellProps extends ComponentProps<"th"> {
  /** Marks the recommended column (its header turns brand). */
  isHighlighted?: boolean | undefined;
}

export interface TableCellProps extends ComponentProps<"td"> {
  /** Marks a cell of the recommended column. */
  isHighlighted?: boolean | undefined;
}

/**
 * A semantic table in a white frame (the handoff's price matrix, box comparison, offers and glance
 * tables — div grids there). `className` styles the frame. With a `minWidth`, a narrow screen
 * scrolls the table inside a named, keyboard-focusable region instead of squashing its columns.
 */
export function Table({
  caption,
  isCaptionVisible = false,
  minWidth = "none",
  className,
  children,
  ...props
}: TableProps) {
  const captionId = useId();
  const styles = table({ minWidth, isCaptionVisible });
  const isScrollable = minWidth !== "none";

  return (
    <div
      data-surface="light"
      role={isScrollable ? "region" : undefined}
      aria-labelledby={isScrollable ? captionId : undefined}
      tabIndex={isScrollable ? 0 : undefined}
      className={styles.frame({ className })}
    >
      <table className={styles.table()} {...props}>
        <caption id={captionId} className={styles.caption()}>
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ className, ...props }: TableHeadProps) {
  return <thead className={tableHead({ className })} {...props} />;
}

export function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody className={tableBody({ className })} {...props} />;
}

export function TableRow(props: TableRowProps) {
  return <tr {...props} />;
}

/** `scope="col"` by default; `scope="row"` for the first cell of a body row. */
export function TableHeaderCell({
  scope = "col",
  isHighlighted = false,
  className,
  ...props
}: TableHeaderCellProps) {
  const isRowHeader = scope === "row" || scope === "rowgroup";
  return (
    <th
      scope={scope}
      className={tableHeaderCell({ isRowHeader, isHighlighted, className })}
      {...props}
    />
  );
}

export function TableCell({ isHighlighted = false, className, ...props }: TableCellProps) {
  return <td className={tableCell({ isHighlighted, className })} {...props} />;
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- table 2>&1 | tail -8`
Expected: PASS (9 tests).

- [ ] **Step 6: Stories — the five handoff tables with `rates.js` data, and the 360px scroll check**

`packages/ui/src/molecules/table/table.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "./table";

const LENGTHS = [
  { label: "Trial", sub: "5 meals · any days within a week", meals: 5, note: "5 meals, any days" },
  { label: "Weekday plan", sub: "24 meals · Mon–Sat", meals: 24, note: "24 meals · offer +1 free" },
  { label: "Full month", sub: "30 meals · every day", meals: 30, note: "30 meals · offer +1 free" },
] as const;

/** `rates.js` → homely.plates at today's per-meal price (Classic at its launch price). */
const PLATES = [
  { name: "Everyday", perMeal: 120, per: `${formatRupees(120)} a meal` },
  {
    name: "Classic",
    perMeal: 130,
    per: `${formatRupees(130)} a meal · launch price`,
    isRecommended: true,
  },
  { name: "Signature", perMeal: 200, per: `${formatRupees(200)} a meal` },
] as const;

/** A price cell that loads the builder: a real button, highlighted on the recommended plan. */
function PriceButton({
  amount,
  note,
  isHighlighted,
}: {
  amount: number;
  note: string;
  isHighlighted: boolean;
}) {
  return (
    <button
      type="button"
      className={
        isHighlighted
          ? "shadow-selected flex min-h-13 w-full flex-col items-start gap-0.5 rounded-md border border-border-brand bg-pink-50 px-3 py-2.5 text-left"
          : "flex min-h-13 w-full flex-col items-start gap-0.5 rounded-md border border-transparent px-3 py-2.5 text-left hover:bg-surface-page-alt"
      }
    >
      <span className="font-display text-body-lg font-black text-text-heading">
        {formatRupees(amount)}
      </span>
      <span className="text-caption text-text-muted">{note}</span>
    </button>
  );
}

function PriceMatrix() {
  return (
    <Table caption="Homely Meals price list" minWidth="md">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Plate</TableHeaderCell>
          {LENGTHS.map((length) => (
            <TableHeaderCell key={length.label}>
              {length.label}
              <span className="block font-body text-caption font-regular text-text-muted">
                {length.sub}
              </span>
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {PLATES.map((plate) => (
          <TableRow key={plate.name}>
            <TableHeaderCell scope="row">
              {plate.name}
              <span className="block font-body text-caption font-regular text-text-muted">
                {plate.per}
              </span>
            </TableHeaderCell>
            {LENGTHS.map((length) => {
              const isHighlighted = "isRecommended" in plate && length.label === "Weekday plan";
              return (
                <TableCell key={length.label} isHighlighted={isHighlighted}>
                  <PriceButton
                    amount={plate.perMeal * length.meals}
                    note={length.note}
                    isHighlighted={isHighlighted}
                  />
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const meta = {
  title: "Molecules/Table",
  component: Table,
  args: { caption: "Homely Meals price list", minWidth: "md" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'A semantic `<table>` for the handoff\'s price matrix, box comparison, offers, catering glance and plan-vs-app tables (div grids in the handoff). Compose `TableHead` / `TableBody` / `TableRow` / `TableHeaderCell` (`scope="col"`, or `"row"` for row headers) / `TableCell`. `minWidth` makes a narrow screen scroll the table inside a named, keyboard-focusable region. `isHighlighted` on the cells marks the recommended column. The caption names the table and is visually hidden unless `isCaptionVisible`.',
      },
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Homely Meals "The full price list" — interactive price cells. */
export const PriceList: Story = { render: () => <PriceMatrix /> };

/** The matrix at 360px: it scrolls inside its region; headers stay associated. */
export const ScrollsAt360: Story = {
  render: () => (
    <div className="w-90">
      <PriceMatrix />
    </div>
  ),
  play: async ({ canvas }) => {
    const region = canvas.getByRole("region", { name: "Homely Meals price list" });
    await expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
    region.focus();
    await expect(region).toHaveFocus();
    await expect(canvas.getAllByRole("columnheader")).toHaveLength(4);
    await expect(canvas.getAllByRole("rowheader")).toHaveLength(3);
  },
};

/** Catering "At a glance" (`rates.js` → catering.glance), Signature highlighted. */
export const CateringGlance: Story = {
  render: () => (
    <Table caption="Dawats at a glance" minWidth="sm">
      <TableHead>
        <TableRow>
          <TableHeaderCell>At a glance</TableHeaderCell>
          <TableHeaderCell>Classic {formatRupees(149)}</TableHeaderCell>
          <TableHeaderCell isHighlighted>Signature {formatRupees(199)}</TableHeaderCell>
          <TableHeaderCell>Maharaja {formatRupees(269)}</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {[
          ["Sabji", "Mix Veg", "Mix Veg + Paneer", "Mix Veg + premium Paneer"],
          ["Dal", "Dal Fry", "Dal Fry", "Dal Makhani"],
          ["Bread", "4 Tandoori Roti", "4 Tandoori Roti", "3 Roti + Lachha Paratha"],
          ["Rice", "Steamed", "Steamed", "Jeera Rice"],
          ["Raita", "Boondi Raita", "Boondi Raita", "Mix Veg Raita"],
          ["Salad", "Sirka Pyaaz", "Kachumber", "Kachumber"],
          ["Sweet", "—", "Gulab Jamun 1 pc", "Gulab Jamun 2 pc"],
        ].map(([course, classic, signature, maharaja]) => (
          <TableRow key={course}>
            <TableHeaderCell scope="row">{course}</TableHeaderCell>
            <TableCell>{classic}</TableCell>
            <TableCell isHighlighted>{signature}</TableCell>
            <TableCell>{maharaja}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** Homely Meals "Plate by plate, side by side." — the box comparison, Classic highlighted. */
export const BoxCompare: Story = {
  render: () => (
    <Table caption="What is in each box" minWidth="lg">
      <TableHead>
        <TableRow>
          <TableHeaderCell>
            <span className="sr-only">Item</span>
          </TableHeaderCell>
          <TableHeaderCell>Everyday · {formatRupees(120)}</TableHeaderCell>
          <TableHeaderCell isHighlighted>Classic · {formatRupees(130)}</TableHeaderCell>
          <TableHeaderCell>Signature · {formatRupees(200)}</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {[
          [
            "Dal",
            "1, from 4 home dals",
            "1, from 8 dals incl. Rajma, Chole, Dal Makhani",
            "1, rotating — lighter, the gravy carries the plate",
          ],
          [
            "Sabji",
            "1, from 7 seasonal home sabjis",
            "1, from 18 sabjis incl. Mix Veg, Kofta, Gatte",
            "Seasonal sabji + restaurant paneer gravy daily",
          ],
          ["Rice", "200g steamed", "200g · jeera rice Tue/Wed", "200g · jeera rice Tue/Wed"],
          ["Roti", "2 fresh tawa roti", "3 fresh tawa roti", "3 fresh tawa roti"],
          ["Salad & chutney", "Yes", "Yes", "Yes"],
          ["Raita", "Twice a week, one with biryani", "3× a week, incl. biryani day", "Every day"],
          [
            "Paneer day",
            "Mon lunch · Wed dinner — home-style Matar Paneer",
            "Mon lunch · Wed dinner — restaurant-style",
            "Every day, bigger portion",
          ],
          ["Soup", "—", "—", "Twice a week"],
          ["Dessert & papad", "—", "Biryani day only", "Every day"],
          [
            "Biryani day",
            "Fri lunch · Tue dinner — with Salan + Raita",
            "Fri lunch · Tue dinner — with Salan, Raita, Gulab Jamun",
            "Fri lunch · Tue dinner — with Salan, Raita, Gulab Jamun",
          ],
        ].map(([row, everyday, classic, signature]) => (
          <TableRow key={row}>
            <TableHeaderCell scope="row">{row}</TableHeaderCell>
            <TableCell>{everyday}</TableCell>
            <TableCell isHighlighted>{classic}</TableCell>
            <TableCell>{signature}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** Homely Meals "Live together? Eat for less." — offers, mono figures. */
export const Offers: Story = {
  render: () => (
    <Table caption="Pay less per meal" minWidth="sm">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Offer</TableHeaderCell>
          <TableHeaderCell>Classic</TableHeaderCell>
          <TableHeaderCell>Signature</TableHeaderCell>
          <TableHeaderCell>Weekday plan</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {[
          ["Regular price", formatRupees(140), formatRupees(200), `Classic ${formatRupees(3360)}`],
          ["Launch price · first 50", formatRupees(130), "—", `Classic ${formatRupees(3120)}`],
          [
            "2 people at one address",
            `${formatRupees(130)} each`,
            `${formatRupees(185)} each`,
            `Classic ${formatRupees(3120)} each`,
          ],
          ["Pay 3 months upfront", formatRupees(125), "—", `72 meals ${formatRupees(9000)}`],
          [
            "3–7 people at one address",
            `${formatRupees(125)} each`,
            `${formatRupees(180)} each`,
            `Classic ${formatRupees(3000)} each`,
          ],
          [
            "8–10 people (11–19 too)",
            `${formatRupees(120)} each`,
            `${formatRupees(170)} each`,
            `Classic ${formatRupees(2880)} each`,
          ],
          [
            "20+ · PG, hostel, office",
            `${formatRupees(119)} each`,
            "—",
            `Everyday ${formatRupees(99)} · ${formatRupees(2376)} each`,
          ],
        ].map(([offer, classic, signature, example]) => (
          <TableRow key={offer}>
            <TableHeaderCell scope="row">{offer}</TableHeaderCell>
            <TableCell className="font-mono">{classic}</TableCell>
            <TableCell className="font-mono">{signature}</TableCell>
            <TableCell className="font-mono text-text-muted">{example}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** Homely Meals "Decide once, for the whole month." — narrow enough not to scroll. */
export const PlanVsApp: Story = {
  render: () => (
    <Table caption="A plan against a food app" minWidth="none">
      <TableHead>
        <TableRow>
          <TableHeaderCell>
            <span className="sr-only">Question</span>
          </TableHeaderCell>
          <TableHeaderCell isHighlighted>Pink Paprikaa plan</TableHeaderCell>
          <TableHeaderCell>Food app, daily</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {[
          [
            "One meal costs",
            `${formatRupees(120)}–${formatRupees(200)}, fixed for your plan`,
            `${formatRupees(250)}–${formatRupees(350)} after delivery, packaging, fees`,
          ],
          ["Who cooks it", "One kitchen, every day", "A different restaurant each time"],
          ["What you do daily", "Nothing — it just arrives", "Open, browse, decide, pay"],
          [
            "Consistency",
            "Same quality, same hygiene, same hands",
            "Changes with whoever you pick",
          ],
          ["Variety", "Planned through the month", "Random, based on what looks good"],
          ["Delivery", "Fixed slot, no ordering", "Depends on restaurant and rider"],
        ].map(([question, plan, app]) => (
          <TableRow key={question}>
            <TableHeaderCell scope="row">{question}</TableHeaderCell>
            <TableCell isHighlighted>{plan}</TableCell>
            <TableCell className="text-text-muted">{app}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const CaptionVisible: Story = {
  render: () => (
    <Table caption="Upgrades, per head" isCaptionVisible>
      <TableBody>
        <TableRow>
          <TableHeaderCell scope="row">Paneer gravy instead of Mix Veg</TableHeaderCell>
          <TableCell className="font-mono">+{formatRupees(25)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
```

(Ranges use `formatRupees` twice joined by an en dash — the same output as `formatRupeeRange`; use `formatRupeeRange(120, 200)` if Task 0 shows it exported, which Plan 1 does.)

- [ ] **Step 7: Export**

```ts
export {
  Table,
  TableBody,
  type TableBodyProps,
  TableCell,
  type TableCellProps,
  TableHead,
  TableHeaderCell,
  type TableHeaderCellProps,
  type TableHeadProps,
  type TableProps,
  TableRow,
  type TableRowProps,
} from "./molecules/table/table";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/design-tokens/tokens/component/table.json packages/design-tokens/contrast-pairs.json packages/ui/src/molecules/table packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts`; then the 360px check in Chromium:

```bash
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache -- table 2>&1 | tail -10
```

Expected: every Table story passes, including `ScrollsAt360`'s play.

- [ ] **Step 9: Commit**

```bash
git add packages/design-tokens/tokens/component/table.json packages/design-tokens/contrast-pairs.json packages/ui/src/molecules/table packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): Table molecule

Compound semantic table replacing the handoff's div grids (price matrix,
box comparison, offers, catering glance, plan vs app): caption-named,
th scope col/row, a highlighted column marked cell by cell, and a
minWidth that turns the frame into a named, focusable scroll region so
360px scrolls the table instead of squashing it.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

