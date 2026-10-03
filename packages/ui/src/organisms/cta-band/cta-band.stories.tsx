import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight, MapPin, MessageCircle } from "lucide-react";

import { Button } from "../../atoms/button/button";
import { BRAND, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { CtaBand } from "./cta-band";

const meta = {
  title: "Organisms/CtaBand",
  component: CtaBand,
  args: {
    overline: "Taste it first",
    title: "If you order, the tasting is free.",
    body: "Take one Dawat as a trial at the normal per-head rate. You only pay if you decide not to go ahead.",
    action: (
      <Button asChild size="lg" icon={MessageCircle}>
        <a href={BRAND.whatsappHref}>Book a trial Dawat</a>
      </Button>
    ),
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          'The band that closes a page — franchise, newsletter, a free tasting. One per page, never two. Copy left and action right (`align="split"`) or stacked and centred. Carries the tiled diamond (`pattern`; `faint` is the handoff\'s 4% ink band). The surface sets the ground, so buttons inside take no colour props.',
      },
    },
  },
} satisfies Meta<typeof CtaBand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: `surface="ink"` split. */
export const InkSplit: Story = {
  args: {
    surface: "ink",
    align: "split",
    overline: "Catering",
    title: "Feeding thirty people? It has to be right the first time.",
    body: "Tell us the date and headcount. We take it from there.",
    action: (
      <Button asChild size="lg" iconAfter={ArrowRight}>
        <a href="#dawat-builder">Build your Dawat</a>
      </Button>
    ),
  },
};

/** Card row: `surface="brand"` centred. */
export const BrandCentred: Story = {
  args: {
    surface: "brand",
    align: "center",
    overline: "Office & PG lunch",
    title: "₹99 / ₹119 a meal for your team",
    body: undefined,
    action: (
      <Button asChild variant="inverse" size="lg" icon={MessageCircle}>
        <a href={BRAND.whatsappHref}>Get a free office tasting</a>
      </Button>
    ),
  },
};

/** Card row: `surface="soft"` split. */
export const SoftSplit: Story = {
  args: {
    surface: "soft",
    overline: "Homely Meals",
    title: "Home-style food, delivered every day.",
    body: "Pure veg lunch and dinner from our restaurant kitchen in MKM Market, Sector 57.",
    action: (
      <Button asChild variant="secondary" size="lg">
        <a href="#plans">See plans</a>
      </Button>
    ),
  },
};

/** Handoff Home — the office strip: brand, split, two actions. */
export const HandoffOfficeStrip: Story = {
  args: {
    surface: "brand",
    overline: "Office & PG lunch",
    title: "₹99 / ₹119 a meal for your team",
    body: "20+ meals at one address · fixed slot · one GST invoice a month",
    action: (
      <>
        <Button asChild variant="inverse" size="lg" icon={MessageCircle}>
          <a href={BRAND.whatsappHref}>Get a free office tasting</a>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <a href="#office-lunch">Details</a>
        </Button>
      </>
    ),
  },
};

/** Handoff Catering — "Taste first": ink with the faint 4% diamond. */
export const HandoffTasteFirst: Story = {
  args: {
    surface: "ink",
    pattern: "faint",
    action: (
      <>
        <Button asChild size="lg" icon={MessageCircle}>
          <a href={BRAND.whatsappHref}>Book a trial Dawat</a>
        </Button>
        <Button asChild variant="secondary" size="lg" icon={MapPin}>
          <a href={BRAND.directionsHref}>Eat at the restaurant</a>
        </Button>
      </>
    ),
  },
};

export const WithoutPattern: Story = { args: { pattern: "none" } };

/** No overline and no body — the heading carries the band on its own. */
export const HeadingOnly: Story = { args: { overline: undefined, body: undefined } };

/** A band that only announces — no action. Rare, but the layout holds. */
export const WithoutAction: Story = { args: { action: undefined } };

export const Mobile: Story = { ...HandoffOfficeStrip, globals: VIEWPORT_360 };
export const Tablet: Story = { ...HandoffOfficeStrip, globals: VIEWPORT_768 };
export const Desktop: Story = { ...HandoffOfficeStrip, globals: VIEWPORT_1280 };
