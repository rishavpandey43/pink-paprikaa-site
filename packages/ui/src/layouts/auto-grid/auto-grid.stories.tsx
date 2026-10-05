import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";

import { expect, within } from "storybook/test";

import { Card } from "../../atoms/card/card";
import { Typography } from "../../atoms/typography/typography";
import { GAP_CLASS } from "../../lib/space";
import { AutoGrid, type AutoGridMin } from "./auto-grid";

function DemoCard({ children }: { children: ReactNode }) {
  return (
    <Card padding="sm">
      <Typography variant="caption" as="div" color="muted">
        {children}
      </Typography>
    </Card>
  );
}

const cards = (count: number, label = "card") =>
  Array.from({ length: count }, (_value, index) => (
    <DemoCard key={index}>{`${label} ${String(index + 1)}`}</DemoCard>
  ));

const LONG_WORD = "Paprikaa".repeat(8);

const MINS: { min: AutoGridMin; px: string }[] = [
  { min: "xs", px: "140px" },
  { min: "sm", px: "200px" },
  { min: "card", px: "240px" },
  { min: "md", px: "260px" },
  { min: "lg", px: "320px" },
  { min: "xl", px: "380px" },
  { min: "2xl", px: "420px" },
];

/** Columns the grid actually laid out: its cells' distinct left edges. */
const columnCount = (canvasElement: HTMLElement) =>
  new Set(
    Array.from(
      within(canvasElement).getByTestId("grid").children,
      (cell) => (cell as HTMLElement).offsetLeft
    )
  ).size;

const meta = {
  title: "Layouts/AutoGrid",
  component: AutoGrid,
  args: { min: "md", children: cards(4) },
  argTypes: {
    columns: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    space: { control: "select", options: Object.keys(GAP_CLASS).map(Number) },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Every card grid in the system. Tracks are always minmax(0, 1fr) — or the auto-fit min pattern minmax(min(step, 100%), 1fr) — so a long label wraps instead of widening the column: the single most common layout bug this prevents. `min` steps: xs 140 · sm 200 · card 240 (design card rows) · md 260 (default panels) · lg 320 · xl 380 · 2xl 420. `columns` fixes the count instead. The gap is the fluid clamp(16px, 2vw, 24px) unless `space` picks a step.",
      },
    },
  },
} satisfies Meta<typeof AutoGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const MinCard: Story = {
  name: 'min="card" · 240px design card track',
  args: { min: "card", children: cards(4) },
};

export const MinMd: Story = {
  name: 'min="md" · 260px panel track',
  args: { min: "md", children: cards(4) },
};

export const MinXs: Story = {
  name: 'min="xs" · the card\'s min={160}, snapped to 140',
  args: { min: "xs", children: cards(5) },
};

export const Columns3: Story = {
  name: "columns={3} · minmax(0, 1fr)",
  args: { columns: 3, children: cards(3, "fixed") },
};

/** Every `min` step, labelled: the width a track must lose before a column drops (dev parity). */
export const Mins: Story = {
  name: "min — xs 140 · sm 200 · md 260 · lg 320 · xl 380 · 2xl 420",
  render: () => (
    <div className="grid gap-8">
      {MINS.map(({ min, px }) => (
        <div key={min} className="grid gap-3">
          <Typography variant="overline" as="div" color="muted">
            {`min="${min}" · ${px}`}
          </Typography>
          <AutoGrid min={min}>{cards(6)}</AutoGrid>
        </div>
      ))}
    </div>
  ),
};

/** `space` swaps the fluid gap for a step: 8px · 24px · 48px (dev parity). */
export const Spacing: Story = {
  name: "space — 2 · 6 · 12",
  render: () => (
    <div className="grid gap-8">
      {([2, 6, 12] as const).map((space) => (
        <AutoGrid key={space} space={space}>
          {cards(3, `space={${String(space)}}`)}
        </AutoGrid>
      ))}
    </div>
  ),
};

export const ColumnsAt360: Story = {
  name: "360px — one column",
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => <AutoGrid data-testid="grid">{cards(8)}</AutoGrid>,
  play: async ({ canvasElement }) => {
    await expect(columnCount(canvasElement)).toBe(1);
  },
};

export const ColumnsAt768: Story = {
  name: "768px — two columns",
  globals: { viewport: { value: "md", isRotated: false } },
  render: () => <AutoGrid data-testid="grid">{cards(8)}</AutoGrid>,
  play: async ({ canvasElement }) => {
    await expect(columnCount(canvasElement)).toBe(2);
  },
};

export const ColumnsAt1280: Story = {
  name: "1280px — four columns",
  globals: { viewport: { value: "xl", isRotated: false } },
  render: () => <AutoGrid data-testid="grid">{cards(8)}</AutoGrid>,
  play: async ({ canvasElement }) => {
    await expect(columnCount(canvasElement)).toBe(4);
  },
};

/**
 * Review Focus 1: a 64-character word in one cell overflows that cell — the three tracks stay
 * equal. (A bare `1fr` track would take the word's min-content width and squeeze the others.)
 */
export const LongWordHoldsTracks: Story = {
  name: "long unbreakable word — tracks hold",
  render: () => (
    <AutoGrid columns={3}>
      <div data-testid="cell">{LONG_WORD}</div>
      <div data-testid="cell">Chai</div>
      <div data-testid="cell">Kulfi</div>
    </AutoGrid>
  ),
  play: async ({ canvasElement }) => {
    const widths = within(canvasElement)
      .getAllByTestId("cell")
      .map((cell) => cell.getBoundingClientRect().width);
    const [first = 0, ...rest] = widths;
    for (const width of rest) {
      await expect(width).toBeCloseTo(first, 0);
    }
  },
};

/** Review Focus 1 at the floor: a 380px step inside a 328px column — min(step, 100%) wins. */
export const NarrowerThanMinAt360: Story = {
  name: '360px — min="xl" never outgrows its parent',
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <AutoGrid min="xl" data-testid="grid">
      {cards(3)}
    </AutoGrid>
  ),
  play: async ({ canvasElement }) => {
    const grid = within(canvasElement).getByTestId("grid");
    const gridWidth = grid.getBoundingClientRect().width;
    for (const cell of grid.children) {
      await expect(cell.getBoundingClientRect().width).toBeLessThanOrEqual(gridWidth + 0.5);
    }
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};
