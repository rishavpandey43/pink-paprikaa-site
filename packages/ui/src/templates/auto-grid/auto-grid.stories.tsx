import type { Meta, StoryObj } from "@storybook/react-vite";

import { AutoGrid } from "./auto-grid";

function CardSlab({ label }: { label: string }) {
  return (
    <div className="rounded-4 bg-surface-card p-4 shadow-elevation1">
      <p className="m-0 font-display text-subtitle1 font-bold text-text-heading">{label}</p>
      <p className="mt-1 mb-0 font-body text-caption text-text-muted">₹180–₹320</p>
    </div>
  );
}

const DISHES = [
  "Paprikaa Chilli Paneer",
  "Tandoori Momos",
  "Amritsari Chole Kulcha",
  "Masala Cold Brew",
  "Hakka Noodles",
  "Gulab Jamun",
];

const meta = {
  title: "Templates/AutoGrid",
  component: AutoGrid,
  args: {
    children: DISHES.slice(0, 4).map((label) => <CardSlab key={label} label={label} />),
  },
  argTypes: { as: { control: false } },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Every card grid in the system. Tracks are always `minmax(min(<floor>,100%),1fr)`, which " +
          "is what stops one long uppercase label from widening its column and overflowing the " +
          "row — the single most common layout bug this prevents.",
      },
    },
  },
} satisfies Meta<typeof AutoGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 180 · 260 · 320 — the floor a track has to lose before a column drops. */
export const Floors: Story = {
  render: () => (
    <div className="grid gap-8">
      {(["narrow", "card", "panel"] as const).map((size) => (
        <div key={size}>
          <p className="mt-0 mb-3 font-display text-overline tracking-overline text-text-muted uppercase">
            size={size}
          </p>
          <AutoGrid size={size}>
            {DISHES.map((label) => (
              <CardSlab key={label} label={label} />
            ))}
          </AutoGrid>
        </div>
      ))}
    </div>
  ),
};

/** A frozen count for an editorial grid. Reach for `size` first — this cannot reflow on its own. */
export const FixedColumns: Story = {
  render: () => (
    <AutoGrid columns={3}>
      {DISHES.slice(0, 3).map((label) => (
        <CardSlab key={label} label={label} />
      ))}
    </AutoGrid>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div className="grid gap-8">
      {([2, 6, 12] as const).map((space) => (
        <AutoGrid key={space} space={space}>
          {DISHES.slice(0, 3).map((label) => (
            <CardSlab key={label} label={label} />
          ))}
        </AutoGrid>
      ))}
    </div>
  ),
};

/** At 320px the grid is one column and a long name wraps inside its card, not past it. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  render: () => (
    <div className="w-80">
      <AutoGrid as="ul">
        <li>
          <CardSlab label="AMRITSARI CHOLE KULCHA WITH PICKLED ONION" />
        </li>
        <li>
          <CardSlab label="Masala Cold Brew" />
        </li>
      </AutoGrid>
    </div>
  ),
};
