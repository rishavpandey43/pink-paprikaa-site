import type { Meta, StoryObj } from "@storybook/react-vite";
import { MessageCircle, Phone } from "lucide-react";
import { expect } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { Card } from "../../atoms/card/card";
import { Logo } from "../../atoms/logo/logo";
import { StatusDot } from "../../atoms/status-dot/status-dot";
import { Typography } from "../../atoms/typography/typography";
import type { AccordionItem } from "../../molecules/accordion/accordion";
import { BRAND, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { FaqSection } from "./faq-section";

/** Handoff Home FAQ (rates.js values filled in). */
const FAQ: AccordionItem[] = [
  {
    value: "delivery",
    question: "Where do you deliver?",
    answer:
      "Free delivery within 3 km of Sector 57. Further away, we agree the charge with you on WhatsApp. Catering delivery is free up to 8 km.",
  },
  {
    value: "pause",
    question: "Can I pause or skip a day?",
    answer: "Yes. Tell us by 9pm the day before. Skipped meals move to the end of your plan.",
  },
  {
    value: "customise",
    question: "Can I customise my meals?",
    answer: "Yes — spice level, Jain, no onion-garlic, fewer rotis. Set it once and we remember.",
  },
  {
    value: "gst",
    question: "Do I get a GST bill?",
    answer: "Yes, for every meal plan, every catering order and every office order.",
  },
  {
    value: "trial",
    question: "Can I try it before I commit?",
    answer:
      "Yes. Start with a trial: 5 meals on any days within a week — Classic ₹650, Everyday ₹600. No lock-in after that.",
  },
  {
    value: "veg",
    question: "Is it really pure vegetarian?",
    answer:
      "One kitchen, pure vegetarian, no exceptions. No egg, no meat, ever. We are a pure-veg restaurant, not a mixed kitchen.",
  },
];

const QUICK_QUESTIONS = [
  "Do you deliver to my area?",
  "Can I pause for a week?",
  "Do you cater parties?",
];

/** The handoff FaqBlock's help card — page-specific content, composed here only for the story. */
function HelpCard() {
  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Logo variant="symbol" color="badge" isDecorative className="w-11" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <Typography as="span" weight="bold" className="font-display">
              Still have a question?
            </Typography>
            <StatusDot status="open" label="A real person replies, 8am – 11:30pm" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Typography as="span" variant="overline" color="muted">
            Tap to ask on WhatsApp
          </Typography>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((question) => (
              <Button key={question} asChild variant="secondary" size="sm" icon={MessageCircle}>
                <a href={`${BRAND.whatsappHref}?text=${encodeURIComponent(question)}`}>
                  {question}
                </a>
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button asChild isFullWidth icon={MessageCircle}>
            <a href={BRAND.whatsappHref}>WhatsApp</a>
          </Button>
          <Button asChild isFullWidth variant="secondary" icon={Phone}>
            <a href={BRAND.phoneHref}>Call</a>
          </Button>
        </div>
      </div>
    </Card>
  );
}

const meta = {
  title: "Organisms/FaqSection",
  component: FaqSection,
  args: {
    overline: "Questions",
    title: "The things people ask",
    lede: "Everything guests ask us at the counter.",
    items: FAQ,
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Two-column FAQ — heading left, accordion right, stacking below lg. The first answer opens by default; answers are one or two short sentences. `aside` sits under the heading and the whole column sticks at lg (the handoff's help card). Native `<details name>`: zero JS, find-in-page works, answers are in the HTML.",
      },
    },
  },
} satisfies Meta<typeof FaqSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: the two-column FAQ. */
export const Default: Story = {};

/** Handoff FaqBlock — sticky heading column with the help card. */
export const HandoffWithAside: Story = {
  args: {
    title: "Before you order",
    lede: "The things people ask us most. Anything else, just message us.",
    aside: <HelpCard />,
    className: "bg-surface-page-alt",
  },
};

export const Multiple: Story = { args: { isMultiple: true } };

/** A page that links to one answer opens that one instead of the first. */
export const SecondOpen: Story = {
  args: { defaultOpen: ["pause"] },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelectorAll("details[open]")).toHaveLength(1);
    await expect(canvas.getByText("Can I pause or skip a day?").closest("details")).toHaveAttribute(
      "open"
    );
  },
};

export const AllClosed: Story = {
  args: { defaultOpen: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll("details[open]")).toHaveLength(0);
  },
};

/** No lede: the heading sits alone in its column and the answers carry the section. */
export const WithoutLede: Story = { args: { lede: undefined } };

/** Under a page section that already owns the h2, the FAQ steps down a level. */
export const HeadingLevel3: Story = {
  args: { headingLevel: 3, overline: "Homely Meals", title: "Plans and delivery" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 3 })).toHaveTextContent("Plans and delivery");
    await expect(canvas.getAllByRole("heading", { level: 4 })).toHaveLength(FAQ.length);
  },
};

export const Mobile: Story = { ...HandoffWithAside, globals: VIEWPORT_360 };
export const Tablet: Story = { ...HandoffWithAside, globals: VIEWPORT_768 };
export const Desktop: Story = { ...HandoffWithAside, globals: VIEWPORT_1280 };
