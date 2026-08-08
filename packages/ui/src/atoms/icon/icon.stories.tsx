import type { Meta, StoryObj } from "@storybook/react-vite";

import { Flame, MapPin, ShoppingBag, Star, Utensils } from "lucide-react";

import { Icon } from "./icon";

const meta = {
  title: "Atoms/Icon",
  component: Icon,
  args: { icon: ShoppingBag },
  argTypes: {
    icon: { control: false, description: "A Lucide glyph component, imported by name." },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Lucide on a 24px grid, `currentColor` only — the icon inherits the colour of whatever " +
          "it sits in. Brand glyphs (the diamond symbol, the chilli) are assets, not icons: reach " +
          "for `Logo`. Never an emoji, including for spice — that is what `SpiceLevel` is for.",
      },
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 14 / 16 / 20 / 24 / 32 — inline, inline, buttons and rows, nav and tab bar, empty states. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-6 text-text-heading">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <span className="flex flex-col items-center gap-2" key={size}>
          <Icon {...args} size={size} />
          <span className="text-caption text-text-muted">{size}</span>
        </span>
      ))}
    </div>
  ),
};

/** The glyph takes its colour from the element around it — never set a fill on the icon. */
export const InheritsColour: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      <Icon {...args} className="text-text-heading" />
      <Icon {...args} className="text-text-muted" />
      <Icon {...args} className="text-text-brand" />
      <Icon {...args} className="text-status-danger" />
      <span className="rounded-3 bg-surface-brand p-3 text-text-on-brand">
        <Icon {...args} />
      </span>
    </div>
  ),
};

export const InTheWild: Story = {
  render: () => (
    <div className="flex items-center gap-6 text-text-heading">
      {[ShoppingBag, MapPin, Utensils, Star, Flame].map((glyph, index) => (
        <Icon icon={glyph} key={index} size="lg" />
      ))}
    </div>
  ),
};

/** A labelled icon is announced as an image; a decorative one is skipped entirely. */
export const Labelled: Story = {
  args: { label: "Order now", size: "lg" },
};
