import type { Meta, StoryObj } from "@storybook/react-vite";

import { CouponTicket } from "./coupon-ticket";

const meta = {
  title: "Molecules/CouponTicket",
  component: CouponTicket,
  args: {
    code: "PAPRIKAA50",
    headline: "50% off your first order",
    terms: "One use per guest. Dine-in and pickup. Till 30 Sep.",
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The voucher — for stories, DMs, table cards and print handouts. The stub carries the " +
          "diamond pattern and copies the code on tap; always pair `onCopy` with a `Snackbar`, " +
          "because the stub's own flash is reinforcement, not the confirmation. Pass " +
          "`isCopyable={false}` on print artwork and inside an artboard, where nothing is tappable.",
      },
    },
  },
} satisfies Meta<typeof CouponTicket>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The two skins. `light` is the one that prints without flooding a page with pink. */
export const Tones: Story = {
  render: (args) => (
    <div className="grid gap-6">
      <CouponTicket {...args} tone="brand" />
      <CouponTicket
        {...args}
        code="CHAI20"
        headline="20% off all chai, all week"
        terms="Dine-in only. Till 30 Sep."
        tone="light"
      />
    </div>
  ),
};

/** `lg` is the 1080px artboard ticket — the same voucher, set for a canvas rather than a screen. */
export const CanvasSize: Story = {
  args: { size: "lg" },
};

/** Print artwork: no button, no copy hint, and the code still reads as the only thing to do. */
export const ForPrint: Story = {
  args: { isCopyable: false },
};

/** Without terms, the headline and the code carry the whole voucher. */
export const WithoutTerms: Story = {
  args: { terms: undefined, code: "MOMO99", headline: "Momos at ₹99" },
};

/**
 * The notches are punched holes, so they take the colour of whatever sits behind the ticket.
 * Set `position` to match, or the two half-circles read as grey blobs.
 */
export const OnATintedPage: Story = {
  globals: { backgrounds: { value: "tint" } },
  args: { position: "tint", tone: "light" },
  render: (args) => (
    <div className="bg-surface-page-alt p-8">
      <CouponTicket {...args} />
    </div>
  ),
};

/** A longer code still wraps inside the stub rather than pushing the ticket wider. */
export const LongCode: Story = {
  args: { code: "PAPRIKAAFIRSTORDER", headline: "₹150 off your first order" },
};
