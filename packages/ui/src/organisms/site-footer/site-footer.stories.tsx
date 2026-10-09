import type { Meta, StoryObj } from "@storybook/react-vite";
import { CreditCard, Mail, MessageCircle, Phone } from "lucide-react";
import { expect } from "storybook/test";

import { Badge } from "../../atoms/badge/badge";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { Logo } from "../../atoms/logo/logo";
import { Typography } from "../../atoms/typography/typography";
import { ringClippers } from "../../lib/story-ring";
import { BRAND, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { type FooterColumn, type FooterSocialLink, SiteFooter } from "./site-footer";

/** The design system card's columns (its sample information architecture). */
const DS_COLUMNS: FooterColumn[] = [
  {
    heading: "Eat",
    items: [
      { label: "Full Menu", href: "#menu" },
      { label: "Small Plates", href: "#small-plates" },
      { label: "Chai & Coffee", href: "#chai" },
      { label: "Sweets", href: "#sweets" },
    ],
  },
  {
    heading: "Visit",
    items: [
      { label: "Outlets", href: "#outlets" },
      { label: "Book a Table", href: "#book" },
      { label: "Private Dining", href: "#private-dining" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "Our Story", href: "#about" },
      { label: "Careers", href: "#careers" },
    ],
  },
];

/** The handoff footer's columns, with the brand facts from story-fixtures. */
const HANDOFF_COLUMNS: FooterColumn[] = [
  {
    heading: "Eat with us",
    items: [
      { label: "Homely Meals", href: "#homely-meals" },
      { label: "This week’s menu", href: "#this-week" },
      { label: "Catering & Bulk Orders", href: "#catering" },
      { label: "Office & PG Lunch", href: "#office-lunch" },
      { label: "Restaurant Menu", href: "#menu" },
    ],
  },
  {
    heading: "Talk to us",
    items: [
      { label: `WhatsApp ${BRAND.phoneDisplay}`, href: BRAND.whatsappHref, icon: MessageCircle },
      { label: `Call ${BRAND.phoneDisplay}`, href: BRAND.phoneHref, icon: Phone },
      { label: BRAND.email, href: BRAND.emailHref, icon: Mail },
      { label: "About us", href: "#about" },
      { label: "Contact & directions", href: "#contact" },
    ],
  },
  {
    heading: "Kitchen & restaurant",
    items: [
      { label: BRAND.address },
      { label: BRAND.hours },
      { label: BRAND.payments, icon: CreditCard },
      { label: `Instagram ${BRAND.instagramHandle}`, href: BRAND.instagramHref },
    ],
  },
];

const SOCIAL: FooterSocialLink[] = [
  { network: "instagram", href: BRAND.instagramHref, label: "Pink Paprikaa on Instagram" },
  { network: "youtube", href: BRAND.youtubeHref, label: "Pink Paprikaa on YouTube" },
  { network: "linkedin", href: BRAND.linkedinHref, label: "Pink Paprikaa on LinkedIn" },
];

const meta = {
  title: "Organisms/SiteFooter",
  component: SiteFooter,
  args: {
    surface: "brand",
    columns: DS_COLUMNS,
    brand: (
      <>
        <Logo color="inverse" className="w-65" />
        <Typography variant="body-sm" color="muted">
          Chai at 8am, chilli paneer at midnight. One kitchen in Sector 57, Gurgaon.
        </Typography>
        <div className="flex flex-col gap-1">
          <Typography as="span" variant="body-sm">
            {BRAND.website}
          </Typography>
          <Typography as="span" variant="body-sm">
            {BRAND.phoneDisplay}
          </Typography>
          <Typography as="span" variant="body-sm">
            {BRAND.email}
          </Typography>
        </div>
      </>
    ),
    social: SOCIAL,
    legal: (
      <>
        <span>{BRAND.copyright}</span>
        <span>{BRAND.fssai}</span>
      </>
    ),
    policies: [
      { label: "Privacy", href: "#privacy" },
      { label: "Terms", href: "#terms" },
      { label: "Refunds", href: "#refunds" },
    ],
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The site footer — a flooded field (pink in the design system, ink with the faint diamond in the handoff), brand block, link columns, social links and the legal bar. It renders exactly what it is given: the FSSAI licence line (legally required on Indian food sites), GSTIN and © come from the app's brand facts. Columns auto-fit and collapse to one on mobile. Pass `hasDockClearance` on pages with an ActionDock.",
      },
    },
  },
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Tab through every link in DOM order: each takes focus with a visible ring nothing clips. */
const proveRingsWhole: Story["play"] = async ({ canvas, userEvent }) => {
  for (const link of canvas.getAllByRole("link")) {
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(link.matches(":focus-visible")).toBe(true);
    await expect(ringClippers(link)).toEqual([]);
  }
};

export const Playground: Story = {};

/** Card row: the full design-system footer (brand surface). */
export const DesignSystemPink: Story = { play: proveRingsWhole };

/** Handoff PPFooter — ink, faint diamond, contact rows with icons, dock clearance. */
export const HandoffInk: Story = {
  args: {
    surface: "ink",
    columns: HANDOFF_COLUMNS,
    brand: (
      <>
        <Logo color="inverse" className="w-50" />
        <Badge color="success">
          <DietMark size="sm" />
          100% Pure Veg Kitchen
        </Badge>
        <Typography as="span" variant="mono" color="muted">
          {BRAND.fssai}
        </Typography>
      </>
    ),
    social: [],
    legal: (
      <>
        <span>{BRAND.copyright}</span>
        <span>{BRAND.gstin}</span>
      </>
    ),
    policies: [
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms of Service", href: "#terms" },
      { label: "Refund & Cancellation", href: "#refunds" },
      { label: "Delivery Policy", href: "#delivery" },
    ],
    hasDockClearance: true,
  },
  play: proveRingsWhole,
};

/** Only columns given — nothing else appears (no default facts). */
export const ColumnsOnly: Story = {
  args: {
    brand: undefined,
    social: [],
    legal: undefined,
    policies: [],
    columns: HANDOFF_COLUMNS.slice(0, 1),
  },
};

/** Four link columns still fit; a fifth belongs on a page, not in the footer. */
export const FourColumns: Story = {
  args: {
    columns: [
      ...DS_COLUMNS,
      {
        heading: "Help",
        items: [
          { label: "Contact & directions", href: "#contact" },
          { label: "Delivery Policy", href: "#delivery" },
        ],
      },
    ],
  },
};

export const Mobile: Story = { ...HandoffInk, globals: VIEWPORT_360 };
export const Tablet: Story = { ...HandoffInk, globals: VIEWPORT_768 };
export const Desktop: Story = { ...HandoffInk, globals: VIEWPORT_1280 };
