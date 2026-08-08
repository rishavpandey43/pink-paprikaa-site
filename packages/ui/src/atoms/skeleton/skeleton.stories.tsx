import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton } from "./skeleton";

const meta = {
  title: "Atoms/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The loading placeholder: soft pink blocks that pulse, never grey and never a gradient " +
          "sweep. Use it where the shape of the content is already known; for a whole-page load " +
          "reach for the pulsing diamond in `Spinner` instead.",
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A photo or card placeholder. Height comes from the caller — the variant only sets a floor. */
export const Block: Story = {
  args: { variant: "block" },
  render: (args) => (
    <div className="flex max-w-96 flex-col gap-4">
      <Skeleton {...args} className="h-40" />
      <Skeleton {...args} />
    </div>
  ),
};

/** Stacked lines vary in width so the block reads as prose rather than a stack of bars. */
export const Lines: Story = {
  args: { lines: 3 },
  render: (args) => (
    <div className="max-w-96">
      <Skeleton {...args} />
    </div>
  ),
};

/** Avatars and chips. */
export const Circle: Story = {
  args: { variant: "circle" },
  render: (args) => (
    <div className="flex items-center gap-4">
      <Skeleton {...args} className="size-8" />
      <Skeleton {...args} />
      <Skeleton {...args} className="size-14" />
    </div>
  ),
};

/** The shape a menu row loads in: thumbnail, then three lines of copy. */
export const AMenuRow: Story = {
  render: () => (
    <div className="flex max-w-96 gap-3 rounded-4 bg-surface-card p-4 shadow-elevation1">
      <Skeleton className="size-20 shrink-0" label="Loading the menu" variant="block" />
      <Skeleton className="flex-1" lines={3} />
    </div>
  ),
};
