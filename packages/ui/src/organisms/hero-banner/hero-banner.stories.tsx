import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight, ShoppingBag } from "lucide-react";

import { Button } from "../../atoms/button/button";
import { HeroBanner } from "./hero-banner";

/**
 * A blank bitmap standing in for a photograph, so the scrim over it is visible in review. It is a
 * fixture, not a design decision — no photography exists yet, which is what `ImageSlot` is for.
 */
const BLANK_PHOTOGRAPH =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5'%3E%3Crect width='4' height='5' fill='white'/%3E%3C/svg%3E";

/** The two actions a hero is allowed. On the pink and ink fields they must carry `on="brand"`. */
function Actions({ on }: { on: "brand" | "light" }) {
  return (
    <>
      <Button icon={ShoppingBag} on={on} size="lg">
        Order Now
      </Button>
      <Button iconAfter={ArrowRight} on={on} size="lg" variant="secondary">
        See Full Menu
      </Button>
    </>
  );
}

const meta = {
  title: "Organisms/HeroBanner",
  component: HeroBanner,
  args: {
    overline: "Sector 57, Gurgaon",
    title: "Desi at heart. Urban by nature.",
    body: "We roast our own masala every morning, then build the rest of the day around it.",
    meta: ["Open till 11:30pm", "Dine in and delivery", "100% vegetarian kitchen"],
    actions: <Actions on="brand" />,
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The band at the top of a marketing page: a flooded, diamond-textured field carrying " +
          "the page's h1, its two actions and the hero photograph. The headline is set in the " +
          "fluid display step so it never overflows, and the photo sits in an `ImageSlot` — no " +
          "photography exists yet, so what ships today is the labelled placeholder.",
      },
    },
  },
  globals: { backgrounds: { value: "brand" } },
} satisfies Meta<typeof HeroBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Pink, ink, and the pale opener. The ink tones invert the copy; `soft` keeps the ink ramp. */
export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-col">
      <HeroBanner {...args} tone="brand" />
      <HeroBanner {...args} actions={<Actions on="brand" />} tone="ink" />
      <HeroBanner {...args} actions={<Actions on="light" />} tone="soft" />
    </div>
  ),
};

/** Stacked, centred, no image — the shape a franchise or careers page opens with. */
export const Centred: Story = {
  args: {
    variant: "center",
    overline: "Franchise",
    title: "Bring Pink Paprikaa to your city",
    body: "One kitchen playbook, one supply list, one menu.",
    meta: [],
    actions: (
      <Button iconAfter={ArrowRight} on="brand" size="lg">
        Apply to Franchise
      </Button>
    ),
  },
};

/** The soft field is the only tone that keeps the ink type ramp, so its buttons stay `on="light"`. */
export const Soft: Story = {
  args: { tone: "soft", actions: <Actions on="light" /> },
  globals: { backgrounds: { value: "tint" } },
};

/** Headline only — everything else on this component is optional. */
export const HeadlineOnly: Story = {
  render: () => <HeroBanner title="Desi at heart. Urban by nature." />,
};

/**
 * Waiting on photography. The placeholder names the crop a photographer can act on and holds the
 * space, so the layout cannot collapse when the real picture lands. No scrim is painted over it —
 * that would dim the note.
 */
export const AwaitingPhotography: Story = {
  args: { imageLabel: "Chilli paneer, overhead, warm light 4:5" },
};

/**
 * With a real photograph the bottom scrim appears — one of only two gradients in the system — so a
 * caption printed on the picture stays legible whatever the picture is doing underneath it.
 */
export const WithPhotograph: Story = {
  args: {
    image: BLANK_PHOTOGRAPH,
    // Empty because the stand-in shows nothing; a real photograph carries a real description.
    imageAlt: "",
    imageCaption: "Paprikaa Chilli Paneer · ₹280",
  },
};

/** The photo drops under the copy and the headline reflows rather than overflowing. */
export const Smallest: Story = {
  globals: { viewport: { value: "floor360" }, backgrounds: { value: "brand" } },
};
