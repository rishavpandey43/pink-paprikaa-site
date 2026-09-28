import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Accordion, type AccordionItem } from "./accordion";

const FAQ: AccordionItem[] = [
  {
    value: "veg",
    question: "Is everything vegetarian?",
    answer: "Yes. The whole kitchen is pure vegetarian — no meat, no egg.",
  },
  {
    value: "delivery",
    question: "Do you deliver?",
    answer: "Pickup only for now. Delivery starts in 2027.",
  },
  {
    value: "booking",
    question: "Can I book a table?",
    answer: "Yes, up to 6 guests online. Larger groups, give us a call.",
  },
];

const meta = {
  title: "Molecules/Accordion",
  component: Accordion,
  args: { items: FAQ },
  parameters: {
    docs: {
      description: {
        component:
          "FAQ, allergen and franchise-detail disclosure, on native `<details name>`: one answer open at a time (`isMultiple` lifts that), the first open by default, zero JavaScript. Hairline-separated rows, no card; the chevron rotates 180° and the active question turns brand; the height animates where the browser supports `::details-content`. Every answer stays in the page, so find-in-page and search engines see them all.",
      },
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "single" — opening one closes the other (the `name` group, in a real browser). */
export const Playground: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const first = canvas.getByText("Is everything vegetarian?").closest("details");
    const second = canvas.getByText("Do you deliver?").closest("details");
    await expect(first).toHaveAttribute("open");
    await userEvent.click(canvas.getByText("Do you deliver?"));
    await expect(second).toHaveAttribute("open");
    await expect(first).not.toHaveAttribute("open");
    // Keyboard (dev parity): every question is a native <summary>, in the Tab order and toggled by
    // the browser on Enter and Space. user-event's synthetic keys cannot trigger that native
    // activation (nor walk to a summary on Tab), so the play checks the summaries are focusable
    // Tab stops and leaves the keypress to the platform.
    for (const summary of canvasElement.querySelectorAll("summary")) {
      await expect(summary.tabIndex).toBe(0);
      summary.focus();
      await expect(summary).toHaveFocus();
    }
  },
};

/** Card row "multiple" — `isMultiple`, both open. */
export const Multiple: Story = {
  args: { items: FAQ.slice(0, 2), isMultiple: true, defaultOpen: ["veg", "delivery"] },
};

export const Surfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <Accordion {...args} className="w-full" />
    </OnSurfaces>
  ),
};

/** Dev parity: the smallest supported width — long questions wrap, the chevron never moves. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-full max-w-80">
        <Story />
      </div>
    ),
  ],
};
