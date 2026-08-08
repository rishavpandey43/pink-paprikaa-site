import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight } from "lucide-react";

import { Button } from "../../atoms/button/button";
import { CtaBand } from "./cta-band";

const meta = {
  title: "Organisms/CtaBand",
  component: CtaBand,
  args: {
    overline: "Franchise",
    title: "Bring Pink Paprikaa to your city",
    body: "One kitchen playbook, one supply list, one menu. Applications open for 2027.",
    action: (
      <Button iconAfter={ArrowRight} on="brand" size="lg">
        Apply to Franchise
      </Button>
    ),
  },
  argTypes: { action: { control: false }, title: { control: "text" } },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The band that closes a page — franchise, hiring, the app. One per page, never two, and " +
          "one action inside it: the band exists to ask for a single thing. It floods edge to edge " +
          "and carries the tiled diamond automatically, so the ground it sits on is the page's " +
          "second colour and its last.",
      },
    },
  },
} satisfies Meta<typeof CtaBand>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Ink is the default close: the darkest thing on the page, at the very bottom of it. */
export const Default: Story = {};

/** Copy left, action on the heading's baseline edge. It wraps before the title can be squeezed. */
export const Split: Story = {
  args: { align: "split" },
};

/** Centred for a band with no competing content around it — the action stacks underneath. */
export const Centred: Story = {
  globals: { backgrounds: { value: "brand" } },
  args: {
    align: "center",
    tone: "brand",
    overline: "Order Online",
    title: "Order before you leave the house",
    body: "Delivery through Swiggy and Zomato, or call the counter and pick it up on your way.",
    action: (
      <Button on="brand" size="lg">
        Order Now
      </Button>
    ),
  },
};

/** The three grounds. `ink` closes a page, `brand` shouts, `soft` asks quietly. */
export const Tones: Story = {
  render: (args) => (
    <div>
      <CtaBand {...args} tone="ink" />
      <CtaBand
        {...args}
        overline="Order Online"
        title="Order before you leave the house"
        tone="brand"
      />
      <CtaBand
        {...args}
        action={
          <Button size="lg" variant="secondary">
            See Openings
          </Button>
        }
        body="Cooks, counter staff and one kitchen manager. Sector 57, Gurgaon."
        overline="Careers"
        title="We are hiring in Gurgaon"
        tone="soft"
      />
    </div>
  ),
};

/** With no overline and no body copy the heading carries the band on its own. */
export const HeadingOnly: Story = {
  render: ({ action }) => <CtaBand action={action} title="Bring Pink Paprikaa to your city" />,
};

/** Some bands only announce — no action, no ask. Rare, but the layout holds. */
export const WithoutAction: Story = {
  args: { action: undefined },
};

/** At 360px the action drops onto its own line and the heading steps down with the fluid ramp. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
};
