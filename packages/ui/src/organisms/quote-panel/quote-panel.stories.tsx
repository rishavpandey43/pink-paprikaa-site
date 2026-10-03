import type { Meta, StoryObj } from "@storybook/react-vite";

import { MessageCircle, Utensils } from "lucide-react";
import { expect } from "storybook/test";

import { Badge } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import { ringClippers } from "../../lib/story-ring";
import { Alert } from "../../molecules/alert/alert";
import { BRAND, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { QuotePanel } from "./quote-panel";

const meta = {
  title: "Organisms/QuotePanel",
  component: QuotePanel,
  args: {
    surface: "brand",
    title: "Classic · Weekday plan",
    badge: <Badge color="brand">Launch price</Badge>,
    amount: "₹130",
    unit: "a meal",
    was: "₹140",
    lines: [
      { key: "₹130 × 24 meals", value: "₹3,120" },
      { key: "Offer: free meals (1)", value: "₹0" },
      { key: "GST 5%", value: "₹156" },
      { key: "Meals delivered", value: "25" },
    ],
    total: { label: "Total", value: "₹3,276" },
    note: "Delivery free within 3 km · no packaging or platform fee",
    alerts: (
      <Alert color="neutral">
        You save ₹2,880 vs ordering the same meals on a food app at ₹250+.
      </Alert>
    ),
    action: (
      <Button asChild variant="inverse" size="lg" icon={MessageCircle} isFullWidth>
        <a href={BRAND.whatsappHref}>Send this plan on WhatsApp</a>
      </Button>
    ),
  },
  decorators: [
    (Story) => (
      <div className="max-w-100">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'The estimate panel of the handoff\'s Plan, Dawat and Office calculators. `surface="brand"` is flooded pink with the diamond; `ink` is the Dawat panel; `light` is the white card on an ink section (a light island — text goes dark again). It renders the numbers it is given; pricing logic stays in the app.',
      },
    },
  },
} satisfies Meta<typeof QuotePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The panel clips (`overflow-hidden`, for its rounded corners and the diamond), so its padding
 * must hold every focus ring whole: tab to each action in turn and prove nothing cuts its ring.
 */
const proveRingsWhole: Story["play"] = async ({ canvas, userEvent }) => {
  for (const link of canvas.getAllByRole("link")) {
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(link.matches(":focus-visible")).toBe(true);
    await expect(ringClippers(link)).toEqual([]);
  }
};

export const Playground: Story = {};

/** Handoff PlanCalculator — brand panel. */
export const HandoffPlan: Story = { play: proveRingsWhole };

/** Handoff DawatCalculator — ink panel. */
export const HandoffDawat: Story = {
  args: {
    surface: "ink",
    title: "Your Dawat estimate",
    badge: undefined,
    amount: "₹6,269",
    unit: "₹209 a head · 30 guests · incl. GST",
    was: undefined,
    lines: [
      { key: "Signature Dawat ₹199 × 30", value: "₹5,970" },
      { key: "GST 5%", value: "₹299" },
      { key: "50% to hold the date", value: "₹3,135" },
    ],
    total: undefined,
    note: undefined,
    alerts: (
      <Alert color="neutral" icon={Utensils}>
        Taste first: one Dawat at ₹199, credited in full when you confirm.
      </Alert>
    ),
    action: (
      <Button asChild size="lg" icon={MessageCircle} isFullWidth>
        <a href={BRAND.whatsappHref}>Check my date on WhatsApp</a>
      </Button>
    ),
    footnote: "We confirm within the hour. 50% holds the date, balance on delivery.",
  },
  play: proveRingsWhole,
};

/** Handoff OfficeLunch — white card on the ink quote section. */
export const HandoffOffice: Story = {
  args: {
    surface: "page",
    title: "Estimated per cycle",
    badge: undefined,
    amount: "₹99,792",
    unit: undefined,
    was: undefined,
    lines: [
      { key: "Everyday", value: "₹99 × 40" },
      { key: "Meals each", value: "24" },
      { key: "Subtotal", value: "₹95,040" },
      { key: "GST 5%", value: "₹4,752" },
    ],
    total: undefined,
    note: undefined,
    alerts: undefined,
    action: (
      <Button asChild size="lg" icon={MessageCircle} isFullWidth>
        <a href={BRAND.whatsappHref}>Send me this quote</a>
      </Button>
    ),
    footnote: (
      <Button asChild variant="ghost" isFullWidth>
        <a href={BRAND.whatsappHref}>Taste it first — free office tasting</a>
      </Button>
    ),
  },
  decorators: [
    (Story) => (
      <div data-surface="ink" className="bg-surface-inverse p-6">
        <Story />
      </div>
    ),
  ],
  play: proveRingsWhole,
};

export const AmountOnly: Story = {
  args: {
    badge: undefined,
    was: undefined,
    lines: [],
    total: undefined,
    note: undefined,
    alerts: undefined,
  },
};

/** The smallest supported viewport: the padding shrinks to 18px and still holds the ring. */
export const Mobile: Story = { globals: VIEWPORT_360, play: proveRingsWhole };
export const Tablet: Story = { globals: VIEWPORT_768 };
export const Desktop: Story = { globals: VIEWPORT_1280 };
