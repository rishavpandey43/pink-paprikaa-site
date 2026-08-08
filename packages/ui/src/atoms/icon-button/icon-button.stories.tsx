import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowLeft, Heart, Plus, Search, Share2 } from "lucide-react";

import { IconButton } from "./icon-button";

const meta = {
  title: "Atoms/IconButton",
  component: IconButton,
  args: { icon: Heart, label: "Save" },
  argTypes: {
    icon: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Circular icon-only button for toolbars, card overlays and app headers. The hit target " +
          "is always at least 44 x 44 even when the painted circle is 32px, and `label` is " +
          "required — an icon-only control is silent without it.",
      },
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <IconButton {...args} variant="ghost" />
      <IconButton {...args} icon={Plus} label="Add" variant="primary" />
      <IconButton {...args} icon={Search} label="Search" variant="secondary" />
      <IconButton {...args} icon={ArrowLeft} label="Back" variant="glass" />
    </div>
  ),
};

/** 32 / 40 / 48px circles — each inside a hit target that never drops below 44px. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <IconButton {...args} icon={Plus} label="Add" size="sm" variant="primary" />
      <IconButton {...args} icon={Plus} label="Add" size="md" variant="primary" />
      <IconButton {...args} icon={Plus} label="Add" size="lg" variant="primary" />
    </div>
  ),
};

/** On a flooded pink panel the fills invert — pink-on-pink has no contrast to work with. */
export const OnBrand: Story = {
  globals: { backgrounds: { value: "brand" } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4 rounded-4 bg-surface-brand p-8">
      <IconButton {...args} on="brand" />
      <IconButton {...args} icon={Share2} label="Share" on="brand" />
      <IconButton {...args} icon={Plus} label="Add" on="brand" variant="primary" />
      <IconButton {...args} icon={Search} label="Search" on="brand" variant="secondary" />
    </div>
  ),
};

/** `glass` is the treatment for buttons floating over food photography. */
export const OverPhotography: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4 rounded-4 bg-surface-inverse p-8">
      <IconButton {...args} icon={ArrowLeft} label="Back" variant="glass" />
      <IconButton {...args} variant="glass" />
      <IconButton {...args} icon={Share2} label="Share" variant="glass" />
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <IconButton {...args} icon={Plus} label="Add" variant="primary" />
      <IconButton {...args} disabled icon={Plus} label="Add" variant="primary" />
      <IconButton {...args} disabled icon={Search} label="Search" variant="secondary" />
    </div>
  ),
};
