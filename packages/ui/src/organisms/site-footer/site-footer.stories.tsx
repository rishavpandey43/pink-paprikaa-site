import type { Meta, StoryObj } from "@storybook/react-vite";

import { SiteFooter } from "./site-footer";

const meta = {
  title: "Organisms/SiteFooter",
  component: SiteFooter,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The flooded-pink footer: white lockup, the standing claim said once and plainly, " +
          "three link columns that auto-fit down to one, and the legal band. The FSSAI licence " +
          "line is not decoration — an Indian food business is legally required to display it.",
      },
    },
  },
  globals: { backgrounds: { value: "page" } },
} satisfies Meta<typeof SiteFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Four columns still fit; a fifth belongs on a page, not in the footer. */
export const FourColumns: Story = {
  args: {
    columns: [
      {
        heading: "Eat",
        links: [
          { label: "Full Menu", href: "/menu" },
          { label: "Small Plates", href: "/menu#small-plates" },
          { label: "Sweets", href: "/menu#sweets" },
        ],
      },
      {
        heading: "Visit",
        links: [
          { label: "Outlets", href: "/outlets" },
          { label: "Book a Table", href: "/book" },
        ],
      },
      {
        heading: "Company",
        links: [
          { label: "Our Story", href: "/about" },
          { label: "Franchise", href: "/franchise" },
          { label: "Careers", href: "/careers" },
        ],
      },
      {
        heading: "Help",
        links: [
          { label: "Contact", href: "/contact" },
          { label: "Order Support", href: "/support" },
        ],
      },
    ],
  },
};

/** One column, for a single-page site that has nowhere else to send anyone yet. */
export const OneColumn: Story = {
  args: {
    columns: [
      {
        heading: "Eat",
        links: [
          { label: "Full Menu", href: "/menu" },
          { label: "Outlets", href: "/outlets" },
        ],
      },
    ],
  },
};

/** Caller copy: the blurb and the claim both travel, the licence line does not move. */
export const OwnCopy: Story = {
  args: {
    blurb: "Breakfast from 8am, chilli paneer until close. Cooked to order, every order.",
    statement: "100% vegetarian kitchen.",
  },
};

/** The columns collapse to one track and the legal band wraps rather than clipping. */
export const Smallest: Story = {
  globals: { viewport: { value: "floor360" }, backgrounds: { value: "page" } },
};
