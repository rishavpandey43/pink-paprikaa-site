import type { Meta, StoryObj } from "@storybook/react-vite";

import { Accordion, type AccordionItem } from "./accordion";

const VEGETARIAN: AccordionItem = {
  question: "Is everything vegetarian?",
  answer:
    "Yes — 100% vegetarian kitchen. A few bakes contain egg and are marked on the menu, so a " +
    "pure-veg table can order around them.",
};

const DELIVERY: AccordionItem = {
  question: "Do you deliver?",
  answer: "Pickup and dine-in for now. Delivery from our own counter starts in 2027.",
};

const BOOKING: AccordionItem = {
  question: "Can I book a table?",
  answer:
    "Up to six guests online. For a larger group, give the outlet a call and we will hold the " +
    "corner table.",
};

const SPEND: AccordionItem = {
  question: "What does a meal for two cost?",
  answer: "Around ₹400 for two at the front stall, ₹600–₹800 for a full dine-in spread.",
};

const FAQ: AccordionItem[] = [VEGETARIAN, DELIVERY, BOOKING, SPEND];

const meta = {
  title: "Molecules/Accordion",
  component: Accordion,
  args: { items: FAQ },
  argTypes: {
    items: { control: false },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "FAQ, allergen and franchise-detail disclosure. Hairline-separated rows with no card — " +
          "the answers are body copy, not panels. One answer opens at a time unless `isMultiple` " +
          "is set; the open question turns brand pink and its chevron rotates.",
      },
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The first question open on arrival — use it when one answer covers most of the traffic. */
export const FirstOpen: Story = {
  args: { defaultOpen: ["Is everything vegetarian?"] },
};

/** Allergen and dietary lists read better side by side, so several rows may stay open. */
export const Multiple: Story = {
  args: {
    isMultiple: true,
    defaultOpen: ["Is everything vegetarian?", "Do you deliver?"],
    items: FAQ.slice(0, 3),
  },
};

/** A disclosure that is not live yet stays in place, inert. */
export const WithDisabledRow: Story = {
  args: {
    items: [
      VEGETARIAN,
      DELIVERY,
      { question: "Is franchising open?", answer: "Not yet.", isDisabled: true },
    ],
  },
};

/** Under a section that already owns the page's `h2`, drop the questions to `h3` or `h4`. */
export const HeadingLevels: Story = {
  args: { headingLevel: 4, items: FAQ.slice(0, 2) },
};

/** The smallest supported width — long questions wrap, the chevron never moves. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  render: (args) => (
    <div className="w-full max-w-80">
      <Accordion {...args} />
    </div>
  ),
};
