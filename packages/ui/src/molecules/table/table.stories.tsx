import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { formatRupeeRange, formatRupees } from "@pink-paprikaa-web/utils";

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
          ? "flex min-h-13 w-full flex-col items-start gap-0.5 rounded-md border border-border-brand bg-pink-50 px-3 py-2.5 text-left shadow-selected"
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
            `${formatRupeeRange(120, 200)}, fixed for your plan`,
            `${formatRupeeRange(250, 350)} after delivery, packaging, fees`,
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
