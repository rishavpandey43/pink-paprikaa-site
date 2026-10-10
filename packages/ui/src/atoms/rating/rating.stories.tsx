import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Rating } from "./rating";

const meta = {
  title: "Atoms/Rating",
  component: Rating,
  args: { value: 4.6 },
  parameters: {
    docs: {
      description: {
        component:
          'Review score for outlet cards and social proof. Diamonds, not stars — the brand shape; `variant="symbol"` swaps in the bare brand mark, the treatment used in ReviewCard and on marketing artwork. Partial scores fill by real percentage: the fill clips in screen space across the diamond\'s bounding box, so 4.3 fills exactly 30% of the fifth diamond. `md` (16px) is the default; below it the embedded mark stops reading, so its opacity steps up. It is one image named "4.6 out of 5" (with `count`, "…, 2,184 reviews").',
      },
    },
  },
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Values: Story = {
  name: "value",
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <Rating value={5} />
      <Rating value={4.6} />
      <Rating value={4.3} />
      <Rating value={2.5} />
      <Rating value={0} />
    </div>
  ),
};

export const Symbol: Story = {
  name: "symbol",
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <Rating value={5} variant="symbol" />
      <Rating value={4.6} variant="symbol" />
    </div>
  ),
};

export const Count: Story = {
  name: "count",
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <Rating value={4.6} count={2184} />
      <Rating value={4.8} variant="symbol" count={912} />
      <Rating value={4.4} count={106} size="sm" hasValue={false} />
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <Rating value={4.3} size="sm" />
      <Rating value={4.3} size="md" />
      <Rating value={4.3} size="lg" />
    </div>
  ),
};

export const PartialFill: Story = {
  name: "partial fill",
  render: () => (
    <div className="flex flex-wrap items-center gap-10">
      <Rating value={4.1} size="lg" />
      <Rating value={4.5} size="lg" />
      <Rating value={4.9} size="lg" />
    </div>
  ),
};

/** Where it usually lands: under an outlet name (plain elements — an atom story composes no atom). */
export const OnAnOutletCard: Story = {
  name: "on an outlet card",
  render: () => (
    <div
      data-surface="light"
      className="grid max-w-text-measure-prose gap-2 rounded-lg bg-surface-card p-4 shadow-1"
    >
      <p className="m-0 font-display text-h4 font-bold text-text-heading">
        Pink Paprikaa · Sector 57
      </p>
      <Rating value={4.6} count={2184} size="sm" />
      <p className="m-0 font-body text-caption text-text-muted">100% vegetarian kitchen</p>
    </div>
  ),
};

/** The score and count follow the surface's text tokens. */
export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Rating value={4.6} count={2184} />
    </OnSurfaces>
  ),
};
