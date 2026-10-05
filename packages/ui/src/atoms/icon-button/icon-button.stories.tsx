import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";

import { ArrowLeft, Heart, Plus, Search, Share2, ShoppingBag } from "lucide-react";
import { expect } from "storybook/test";

import {
  StatesRow,
  type StoryForceState,
  storyStateControlProps,
  storyStatesPseudo,
} from "../../lib/story-states";
import { OnSurfaces } from "../../lib/story-surfaces";
import { IconButton } from "./icon-button";

const ICON_BUTTON_STATES = [
  "rest",
  "hover",
  "press",
  "focus",
  "disabled",
] as const satisfies readonly StoryForceState[];

function DemoRouterLink({ children, ...props }: ComponentProps<"a">) {
  return (
    <a data-router="" {...props}>
      {children}
    </a>
  );
}

const meta = {
  title: "Atoms/IconButton",
  component: IconButton,
  args: { icon: Heart, label: "Save", variant: "ghost", size: "md" },
  argTypes: { icon: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          'Circular icon-only button for toolbars, card overlays and app headers. Always pass `label` — it is the accessible name, and the type system requires it. `glass` is for buttons floating over food photography (translucent white + blur). sm and md draw at 32/40px but keep a 44px touch target; use `size="lg"` in the app. `count` draws the cart bubble and is read out with the label. On a pink field the ghost glyph turns white and primary turns white-on-pink, with no prop.',
      },
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  parameters: { pseudo: storyStatesPseudo(ICON_BUTTON_STATES) },
  render: () => (
    <StatesRow
      states={ICON_BUTTON_STATES}
      render={(state) => (
        <IconButton icon={Heart} label="Save" variant="ghost" {...storyStateControlProps(state)} />
      )}
    />
  ),
  play: async ({ canvasElement }) => {
    const hover = canvasElement.querySelector("#cell-hover button");
    if (!(hover instanceof HTMLElement)) {
      throw new Error("IconButton States: #cell-hover button missing");
    }
    await expect(hover).toHaveClass("hover:bg-state-hover");
  },
};

export const Variants: Story = {
  name: "variant",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton icon={Heart} label="Save" variant="ghost" />
      <IconButton icon={Plus} label="Add" variant="primary" />
      <IconButton icon={Search} label="Search" variant="secondary" />
      <IconButton icon={ArrowLeft} label="Back" variant="glass" className="shadow-2" />
      <IconButton icon={Heart} label="Dismiss" variant="tint" />
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton icon={Plus} label="Add" variant="primary" size="xs" />
      <IconButton icon={Plus} label="Add" variant="primary" size="sm" />
      <IconButton icon={Plus} label="Add" variant="primary" size="md" />
      <IconButton icon={Plus} label="Add" variant="primary" size="lg" />
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
      <IconButton icon={Heart} label="Save" />
      <IconButton icon={Share2} label="Share" />
    </div>
  ),
};

export const Disabled: Story = {
  name: "disabled",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton icon={Plus} label="Add" variant="primary" disabled />
      <IconButton icon={Search} label="Search" variant="secondary" disabled />
    </div>
  ),
};

/** `glass` is the treatment for buttons floating over food photography (a dark stand-in here). */
export const OverPhotography: Story = {
  name: 'variant="glass" over a dark photo',
  render: () => (
    <div className="flex flex-wrap items-center gap-3 rounded-lg bg-surface-inverse p-6">
      <IconButton icon={ArrowLeft} label="Back" variant="glass" />
      <IconButton icon={Heart} label="Save" variant="glass" />
      <IconButton icon={Share2} label="Share" variant="glass" />
    </div>
  ),
};

export const Count: Story = {
  name: "count",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton icon={ShoppingBag} label="Your order" count={3} />
      <IconButton icon={ShoppingBag} label="Your order" count={12} />
    </div>
  ),
};

export const IconOnly: Story = {
  name: "icon-only (not a Button)",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton icon={ShoppingBag} label="Your order" variant="primary" size="lg" />
      <IconButton icon={Search} label="Search" variant="secondary" />
      <IconButton icon={Heart} label="Save" variant="ghost" />
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <IconButton icon={Heart} label="Save" />
      <IconButton icon={Plus} label="Add" variant="primary" />
      <IconButton icon={Search} label="Search" variant="secondary" />
    </OnSurfaces>
  ),
};

export const AsChild: Story = {
  name: "asChild (a link)",
  render: () => (
    <IconButton asChild icon={ShoppingBag} label="Your order" count={2}>
      <DemoRouterLink href="/cart" />
    </IconButton>
  ),
};
