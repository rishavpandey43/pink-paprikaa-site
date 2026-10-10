import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { PriceTag } from "./price-tag";

const meta = {
  title: "Atoms/PriceTag",
  component: PriceTag,
  args: { amount: 280 },
  parameters: {
    docs: {
      description: {
        component:
          'The only correct way to render a price: `₹` with no space, no decimals on whole rupees, Indian digit grouping, an en-dash range (`to`), the original struck through (`was`). `color="inverse"` on pink or ink panels — though `neutral` already follows the surface. `size="canvas"` (56px) prints a price on a 1080px artboard. Never hand-write a price string. A struck price must be higher than the price, and a range must run upwards: anything else throws. The size sits on the tag and the parts are relative to it, so one text class also scales the whole price.',
      },
    },
  },
} satisfies Meta<typeof PriceTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Amounts: Story = {
  name: "amount",
  render: () => (
    <div className="flex flex-wrap items-baseline gap-6">
      <PriceTag amount={280} />
      <PriceTag amount={1240} />
      <PriceTag amount={125000} />
      <PriceTag amount={90} />
    </div>
  ),
};

export const Was: Story = { name: "was", args: { amount: 240, was: 320 } };

export const Range: Story = { name: "to", args: { amount: 180, to: 320 } };

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-baseline gap-6">
      <PriceTag amount={280} size="sm" />
      <PriceTag amount={280} size="md" />
      <PriceTag amount={280} size="lg" />
    </div>
  ),
};

export const Colors: Story = {
  name: "color",
  render: () => (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-baseline gap-6">
        <PriceTag amount={280} was={320} color="neutral" />
        <PriceTag amount={280} was={320} color="brand" />
      </div>
      <div
        data-surface="brand"
        className="flex flex-wrap items-baseline gap-6 rounded-lg bg-surface-brand p-4"
      >
        <PriceTag amount={280} color="inverse" size="lg" />
        <PriceTag amount={240} was={320} color="inverse" />
      </div>
    </div>
  ),
};

/** FeedArtboards.jsx DishLaunchPost: the price on a 1080px board. View at the xl viewport. */
export const Canvas: Story = {
  name: "size canvas (artwork)",
  render: () => (
    <div className="flex flex-wrap items-baseline gap-10">
      <PriceTag amount={220} size="canvas" />
      <PriceTag amount={220} was={280} size="canvas" />
      <PriceTag amount={180} to={320} size="canvas" />
    </div>
  ),
};

export const Sx: Story = {
  render: () => <PriceTag amount={280} was={320} sx={{ mt: 4, gap: 4 }} />,
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <PriceTag amount={240} was={320} />
    </OnSurfaces>
  ),
};
