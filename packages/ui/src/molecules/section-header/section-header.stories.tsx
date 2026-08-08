import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight } from "lucide-react";

import { Button } from "../../atoms/button/button";
import { SectionHeader } from "./section-header";

const meta = {
  title: "Molecules/SectionHeader",
  component: SectionHeader,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The standard section opener — every page section starts with one. The heading is always " +
          "the fluid `h2` step so openers read the same everywhere, while `headingLevel` sets where " +
          "it sits in the document outline. The trailing action is dropped when the header is centred.",
      },
    },
  },
  args: { overline: "The Menu", title: "Most ordered this week" },
  argTypes: { action: { control: false }, title: { control: "text" } },
} satisfies Meta<typeof SectionHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The common shape: an overline, a heading, and a ghost button onward to the full list. */
export const WithAction: Story = {
  args: {
    action: (
      <Button iconAfter={ArrowRight} size="sm" variant="ghost">
        See Full Menu
      </Button>
    ),
  },
};

export const WithLede: Story = {
  args: {
    overline: "Our Kitchen",
    title: "Ground fresh, cooked to order",
    lede: "One kitchen, one grinder and a menu that changes with what the market has that morning.",
  },
};

/** Centred openers carry no action — the section below them is the next thing to read. */
export const Centred: Story = {
  args: {
    align: "center",
    overline: "Outlets",
    title: "Find a Paprikaa",
    lede: "Sector 57, Gurgaon. Dine in at the back, or order from the counter out front.",
  },
};

/** On a flooded pink section every tone lifts to white — eyebrow, heading and lede alike. */
export const OnBrand: Story = {
  globals: { backgrounds: { value: "brand" } },
  args: {
    on: "brand",
    overline: "Franchise",
    title: "Bring us to your city",
    lede: "One kitchen, one grinder, and a playbook we hand over in full.",
  },
  render: (args) => (
    <div className="rounded-5 bg-surface-brand p-8">
      <SectionHeader {...args} />
    </div>
  ),
};

/**
 * The type step never changes; only the outline does. Use this so a section inside an article does
 * not skip from `h1` to `h3`.
 */
export const HeadingLevels: Story = {
  render: (args) => (
    <div className="grid gap-10">
      <SectionHeader {...args} headingLevel={2} title="Rendered as an h2" />
      <SectionHeader {...args} headingLevel={3} title="Rendered as an h3" />
      <SectionHeader {...args} headingLevel={4} title="Rendered as an h4" />
    </div>
  ),
};

/** At 360px the action wraps under the heading rather than squeezing it. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  args: {
    action: (
      <Button iconAfter={ArrowRight} size="sm" variant="ghost">
        See Full Menu
      </Button>
    ),
    lede: "One kitchen, one grinder and a menu that changes with the season.",
  },
};
