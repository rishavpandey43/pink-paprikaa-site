import type { Meta, StoryObj } from "@storybook/react-vite";

import { OfferSeal } from "./offer-seal";

const meta = {
  title: "Molecules/OfferSeal",
  component: OfferSeal,
  args: { value: "50%", label: "Off" },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The offer badge for posts, stories and banners — the brand's rotated diamond, one " +
          "flat fill, no gradient and no starburst. One per artboard; two seals read as a " +
          "clearance sale. Text counter-rotates so the number stays upright.",
      },
    },
  },
} satisfies Meta<typeof OfferSeal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Three flat fills. `turmeric` is the one that is not pink — save it for a non-price offer. */
export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-12">
      <OfferSeal {...args} size="sm" tone="light" />
      <OfferSeal {...args} size="sm" tone="brand" />
      <OfferSeal {...args} size="sm" tone="turmeric" />
    </div>
  ),
};

/** 128 / 192 / 280px on the diagonal — an MPU, a banner, and a 1080 canvas. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-14">
      <OfferSeal {...args} size="sm" />
      <OfferSeal {...args} size="md" />
      <OfferSeal {...args} size="lg" />
    </div>
  ),
};

/** The three shapes an offer takes. Prices print as ₹99 — no space, no decimals. */
export const Values: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-12">
      <OfferSeal {...args} size="sm" />
      <OfferSeal {...args} label="Only" size="sm" value="₹99" />
      <OfferSeal {...args} label="Free" size="sm" value="1+1" />
    </div>
  ),
};

/** A note carries the deadline, in lowercase 12-hour time. */
export const WithNote: Story = {
  args: { note: "till 11:30pm" },
};

/**
 * Hung off a corner of an artboard. The offset is an 18% self translate, so the number can never
 * be clipped however large the seal gets.
 */
export const OnACorner: Story = {
  globals: { backgrounds: { value: "page" } },
  render: (args) => (
    <div className="relative size-80 overflow-hidden rounded-5 bg-surface-brand-soft">
      <OfferSeal {...args} note="till 11:30pm" position="topRight" size="sm" tone="brand" />
    </div>
  ),
};
