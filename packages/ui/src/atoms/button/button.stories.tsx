import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  MapPin,
  MessageCircle,
  Search,
  ShoppingBag,
} from "lucide-react";
import { expect, within } from "storybook/test";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Button } from "./button";

const meta = {
  title: "Atoms/Button",
  component: Button,
  args: { children: "Order Now", variant: "primary", size: "md" },
  argTypes: { icon: { control: false }, iconAfter: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "The brand's action button — pill, Poppins 700, Title Case; use `primary` once per view. Variants: `primary` (flooded pink + the brand glow), `secondary` (2px pink outline on white), `ghost` (text only), `inverse` (ink). On a flooded pink field the skins follow the surface — primary flips to white-on-pink, secondary and ghost to white — with no prop to pass; inverse stays ink. Press = 0.97 scale + darken; disabled is a real grey fill, not opacity. Leading icons name the action (bag, pin, search); trailing icons mean onward motion (arrow-right to navigate, arrow-up-right to leave the site, chevron-down for a picker). Labels never wrap. Icon-only? Use `IconButton`. `asChild` renders an `<a>` or `next/link` as a Button.",
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: "variant",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Order Now</Button>
      <Button variant="secondary">See Menu</Button>
      <Button variant="ghost">Find Us</Button>
      <Button variant="inverse">Book</Button>
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const LeadingIcon: Story = {
  name: "icon",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button icon={ShoppingBag}>Order Now</Button>
      <Button variant="secondary" icon={MapPin}>
        Directions
      </Button>
      <Button variant="ghost" icon={Search}>
        Search Menu
      </Button>
    </div>
  ),
};

export const TrailingIcon: Story = {
  name: "iconAfter",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button iconAfter={ArrowRight}>Full Menu</Button>
      <Button variant="secondary" iconAfter={ArrowRight}>
        Our Story
      </Button>
      <Button variant="ghost" iconAfter={ArrowUpRight}>
        Zomato
      </Button>
    </div>
  ),
};

export const BothIcons: Story = {
  name: "icon + iconAfter",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button icon={MapPin} iconAfter={ArrowUpRight}>
        Directions
      </Button>
      <Button variant="secondary" icon={Calendar} iconAfter={ChevronDown}>
        Pick a Date
      </Button>
    </div>
  ),
};

export const IconBySize: Story = {
  name: "icon × size",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm" icon={ShoppingBag}>
        Small
      </Button>
      <Button size="md" icon={ShoppingBag}>
        Medium
      </Button>
      <Button size="lg" icon={ShoppingBag}>
        Large
      </Button>
    </div>
  ),
};

export const IconAfterBySize: Story = {
  name: "iconAfter × size",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm" variant="secondary" iconAfter={ArrowRight}>
        Small
      </Button>
      <Button size="md" variant="secondary" iconAfter={ArrowRight}>
        Medium
      </Button>
      <Button size="lg" variant="secondary" iconAfter={ArrowRight}>
        Large
      </Button>
    </div>
  ),
};

export const OnBrand: Story = {
  name: "on a brand surface",
  render: () => (
    <div
      data-surface="brand"
      className="flex flex-wrap items-center gap-3 rounded-lg bg-surface-brand p-3.5"
    >
      <Button icon={ShoppingBag}>Order Now</Button>
      <Button variant="secondary" iconAfter={ArrowRight}>
        Our Story
      </Button>
      <Button variant="inverse" icon={MessageCircle}>
        Chat on WhatsApp
      </Button>
    </div>
  ),
  // On a pink field primary trades the brand glow for shadow-2 (surface/brand.json). A probe
  // painted with var(--shadow-2) gives the expected value in the browser's own format.
  play: async ({ canvasElement }) => {
    const primary = within(canvasElement).getByRole("button", { name: "Order Now" });
    const probe = document.createElement("div");
    probe.style.boxShadow = "var(--shadow-2)";
    canvasElement.append(probe);
    const expected = getComputedStyle(probe).boxShadow;
    probe.remove();
    await expect(getComputedStyle(primary).boxShadow).toContain(expected);
  },
};

export const Loading: Story = {
  name: "isLoading",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button isLoading icon={ShoppingBag}>
        Placing order
      </Button>
      <Button variant="secondary" isLoading>
        Checking code
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  name: "disabled",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button disabled icon={ShoppingBag}>
        Sold Out
      </Button>
      <Button variant="secondary" disabled iconAfter={ArrowRight}>
        Closed
      </Button>
    </div>
  ),
};

export const FullWidth: Story = {
  name: "isFullWidth",
  render: () => (
    <div className="grid w-90 gap-2.5">
      <Button isFullWidth size="lg" icon={ShoppingBag}>
        Pay ₹1,240
      </Button>
      <Button isFullWidth variant="secondary" iconAfter={ArrowRight}>
        See the Full Menu
      </Button>
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Button>Order Now</Button>
      <Button variant="secondary">See Menu</Button>
      <Button variant="ghost">Find Us</Button>
      <Button variant="inverse">Book</Button>
    </OnSurfaces>
  ),
};

export const NestedSurfaces: Story = {
  name: "nested surfaces (light island)",
  render: () => (
    <div data-surface="brand" className="grid gap-4 rounded-xl bg-surface-brand p-6">
      <Button variant="secondary">On the pink field</Button>
      <div data-surface="light" className="rounded-lg bg-surface-card p-4">
        <Button variant="secondary">On a white card inside it</Button>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const onField = canvas.getByRole("button", { name: "On the pink field" });
    const onIsland = canvas.getByRole("button", { name: "On a white card inside it" });
    await expect(getComputedStyle(onField).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    await expect(getComputedStyle(onIsland).backgroundColor).toBe("rgb(255, 255, 255)");
  },
};

export const AsChild: Story = {
  name: "asChild (a link)",
  render: () => (
    <Button asChild variant="secondary" icon={MessageCircle}>
      <a href="https://wa.me/919090704001">Order on WhatsApp</a>
    </Button>
  ),
};

export const LongLabel: Story = {
  name: "long label at 360px",
  render: () => (
    <div data-testid="frame" className="grid w-90 gap-3">
      <Button icon={ShoppingBag}>Order the full Sunday thali for the whole family</Button>
      <Button isFullWidth variant="secondary" iconAfter={ArrowRight}>
        See the full menu, every category and every price
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvas.getByTestId("frame").getBoundingClientRect();
    for (const button of canvas.getAllByRole("button")) {
      const box = button.getBoundingClientRect();
      await expect(box.right).toBeLessThanOrEqual(frame.right + 0.5);
      await expect(box.height).toBe(44);
    }
  },
};
