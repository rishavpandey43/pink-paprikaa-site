import type { Meta, StoryObj } from "@storybook/react-vite";

import { Cluster } from "./cluster";

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex h-9 shrink-0 items-center rounded-6 bg-brand-tint px-4 font-display text-body2 font-medium text-text-body">
      {label}
    </span>
  );
}

const CATEGORIES = [
  "All",
  "Small Plates",
  "All Day",
  "Chai & Coffee",
  "Momos",
  "Sweets",
  "Breakfast",
];

const meta = {
  title: "Templates/Cluster",
  component: Cluster,
  args: {
    children: (
      <>
        <Chip label="All" />
        <Chip label="Small Plates" />
        <Chip label="Sweets" />
      </>
    ),
  },
  argTypes: { as: { control: false } },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Any horizontal run of small things — buttons, tags, badges, meta. It wraps by default " +
          "so a row can never clip, and `isScrollable` swaps wrapping for a sideways rail, which is the " +
          "mobile filter pattern.",
      },
    },
  },
} satisfies Meta<typeof Cluster>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Wrapping is the default, and the reason a long run of categories never overflows. */
export const Wrap: Story = {
  render: () => (
    <div className="max-w-105">
      <Cluster>
        {CATEGORIES.map((label) => (
          <Chip key={label} label={label} />
        ))}
      </Cluster>
    </div>
  ),
};

export const Justify: Story = {
  render: () => (
    <div className="grid gap-4">
      {(["start", "center", "end", "between"] as const).map((justify) => (
        <Cluster justify={justify} key={justify}>
          <Chip label={`justify=${justify}`} />
          <Chip label="Sweets" />
        </Cluster>
      ))}
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div className="grid gap-4">
      {([1, 2, 3, 6] as const).map((space) => (
        <Cluster key={space} space={space}>
          <Chip label={`space=${String(space)}`} />
          <Chip label="Momos" />
          <Chip label="Sweets" />
        </Cluster>
      ))}
    </div>
  ),
};

/**
 * The app category rail: one line, scrolled sideways, never wrapped. A scrolling rail is a keyboard
 * stop, so it carries an `aria-label` and is announced as a named region.
 */
export const Scroll: Story = {
  render: () => (
    <div className="max-w-90">
      <Cluster aria-label="Menu categories" isScrollable>
        {CATEGORIES.map((label) => (
          <Chip key={label} label={label} />
        ))}
      </Cluster>
    </div>
  ),
};

/** A meta row on a menu card — baseline alignment keeps the price sitting on the label's line. */
export const InContext: Story = {
  render: () => (
    <div className="max-w-90 rounded-4 bg-surface-card p-4 shadow-elevation1">
      <Cluster align="baseline" justify="between">
        <span className="font-display text-subtitle1 font-bold text-text-heading">
          Paprikaa Chilli Paneer
        </span>
        <span className="font-display text-subtitle1 font-bold text-text-brand">₹280</span>
      </Cluster>
      <Cluster className="mt-3" space={2}>
        <Chip label="Bestseller" />
        <Chip label="Serves 2" />
      </Cluster>
    </div>
  ),
};
