import type { Meta, StoryObj } from "@storybook/react-vite";

import { type AccordionItem } from "../../molecules/accordion/accordion";
import { FaqSection } from "./faq-section";

const ITEMS: AccordionItem[] = [
  {
    question: "Is everything vegetarian?",
    answer:
      "Yes — 100% vegetarian kitchen. A few bakes contain egg and are marked on the menu, so a " +
      "pure-veg table can order around them.",
  },
  {
    question: "Do you deliver?",
    answer: "Through Swiggy and Zomato across Sector 57 and the sectors either side of it.",
  },
  {
    question: "Can I book a table?",
    answer:
      "Up to six guests online. For a larger group, call the outlet and we will hold the corner " +
      "table.",
  },
  {
    question: "What does a meal for two cost?",
    answer: "Around ₹400 for two at the front stall, ₹600–₹800 for a full dine-in spread.",
  },
];

const FRANCHISE: AccordionItem[] = [
  {
    question: "What does a franchise cost to open?",
    answer: "It depends on the format and the site. We share the full sheet after the first call.",
  },
  {
    question: "Do you help with the kitchen build?",
    answer: "Yes — equipment list, layout and the supplier contacts are part of the playbook.",
  },
  {
    question: "How long does an outlet take to open?",
    answer: "Roughly four months from signed site to first service, if the site is ready.",
  },
];

const meta = {
  title: "Organisms/FaqSection",
  component: FaqSection,
  args: {
    overline: "Questions",
    title: "The things people ask",
    lede: "Everything guests ask us at the counter, answered once.",
    items: ITEMS,
  },
  argTypes: { items: { control: false }, title: { control: "text" } },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Two columns — heading left, questions right — stacking to one on a narrow screen. The " +
          "first answer opens on arrival, because the question at the top of the list is the one " +
          "most guests came for. Answers are one or two short sentences; anything longer belongs " +
          "on its own page.",
      },
    },
  },
} satisfies Meta<typeof FaqSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** With no lede the heading sits alone in the left column and the answers carry the section. */
export const WithoutLede: Story = {
  render: ({ items }) => (
    <FaqSection items={items} overline="Questions" title="The things people ask" />
  ),
};

/** Open a different question when the traffic says another one is the real first question. */
export const SecondOpen: Story = {
  args: { defaultOpen: ["Do you deliver?"] },
};

/** Every row closed, for a long list a guest is meant to scan rather than read. */
export const AllClosed: Story = {
  args: { defaultOpen: [] },
};

/** Several answers at once, for lists that only make sense side by side. */
export const Multiple: Story = {
  args: {
    isMultiple: true,
    defaultOpen: ["Is everything vegetarian?", "Do you deliver?"],
  },
};

/** Under a page section that already owns an `h2`, drop the section — the questions follow. */
export const HeadingLevels: Story = {
  render: () => (
    <FaqSection headingLevel={3} items={FRANCHISE} overline="Franchise" title="Before you apply" />
  ),
};

/** At 360px the two columns stack and the questions keep their 44px hit target. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
};
