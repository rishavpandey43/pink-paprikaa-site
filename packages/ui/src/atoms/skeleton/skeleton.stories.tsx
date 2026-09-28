import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton } from "./skeleton";

const meta = {
  title: "Atoms/Skeleton",
  component: Skeleton,
  render: (args) => (
    <div className="w-full max-w-text-measure-prose">
      <Skeleton {...args} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Loading placeholder — light-pink blocks, never grey, never a gradient spinner. Size and shape it with `className` (`h-18 rounded-lg`); `variant="text"` draws `lines` of varied width; `variant="circle"` for avatars and chips. It is hidden from assistive tech — mark the loading region `aria-busy` instead. For whole-page loads use the pulsing Spinner.',
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Block: Story = { name: "block", args: { className: "h-18 rounded-lg" } };

export const Lines: Story = { name: "lines", args: { variant: "text", lines: 3 } };

export const Circle: Story = {
  name: "circle",
  render: () => (
    <div className="flex items-center gap-3">
      <Skeleton variant="circle" />
      <Skeleton variant="circle" className="size-8" />
    </div>
  ),
};

/** The loading region is named once (`role="status"`); its placeholders stay hidden. */
export const CardShape: Story = {
  name: "card shape",
  render: () => (
    <div
      role="status"
      aria-label="Loading the menu"
      aria-busy="true"
      className="flex w-full max-w-text-measure-prose gap-3"
    >
      <Skeleton className="h-17 w-23 shrink-0 rounded-md" />
      <Skeleton variant="text" lines={3} className="flex-1" />
    </div>
  ),
};
