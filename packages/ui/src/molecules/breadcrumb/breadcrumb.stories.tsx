import type { Meta, StoryObj } from "@storybook/react-vite";

import { Breadcrumb } from "./breadcrumb";

const meta = {
  title: "Molecules/Breadcrumb",
  component: Breadcrumb,
  args: {
    items: [{ label: "Home", href: "#" }, { label: "Menu", href: "#" }, { label: "Small Plates" }],
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The path trail for website sub-pages — a menu category, an outlet, a careers post. " +
          "Chevron separators, quiet links, the current page in ink. It wraps rather than " +
          "clipping, so a long page name stays readable at 360px.",
      },
    },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Two levels is the shallowest trail worth drawing. */
export const TwoLevels: Story = {
  args: { items: [{ label: "Home", href: "#" }, { label: "Outlets" }] },
};

/** Four levels with a long leaf — the row wraps, and nothing is ever truncated. */
export const LongTrail: Story = {
  args: {
    items: [
      { label: "Home", href: "#" },
      { label: "Company", href: "#" },
      { label: "Franchise", href: "#" },
      { label: "Apply for a 2027 city" },
    ],
  },
};

/** A crumb with no destination stays as text — useful for a grouping level that has no page. */
export const UnlinkedLevel: Story = {
  args: {
    items: [{ label: "Home", href: "#" }, { label: "Company" }, { label: "Press" }],
  },
};

/** On a brand-flooded band the whole trail flips to white. */
export const OnBrand: Story = {
  globals: { backgrounds: { value: "brand" } },
  args: { tone: "inverse" },
  render: (args) => (
    <div className="rounded-4 bg-surface-brand p-8">
      <Breadcrumb {...args} />
    </div>
  ),
};

/** The smallest supported width. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  args: {
    items: [
      { label: "Home", href: "#" },
      { label: "Company", href: "#" },
      { label: "Franchise", href: "#" },
      { label: "Apply for a 2027 city" },
    ],
  },
  render: (args) => (
    <div className="w-full max-w-80">
      <Breadcrumb {...args} />
    </div>
  ),
};
