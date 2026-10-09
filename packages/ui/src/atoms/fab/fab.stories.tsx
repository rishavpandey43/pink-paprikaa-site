import type { Meta, StoryObj } from "@storybook/react-vite";
import { MapPin, Phone, ShoppingBag } from "lucide-react";
import type { ComponentProps } from "react";
import { expect } from "storybook/test";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Fab } from "./fab";

function DemoLink({ children, ...props }: ComponentProps<"a">) {
  return <a {...props}>{children}</a>;
}

const meta = {
  title: "Atoms/Fab",
  component: Fab,
  args: { icon: Phone, label: "Call us" },
  parameters: {
    docs: {
      description: {
        component:
          "The floating action button: one primary action that stays in reach (call, order, directions). A 48 or 56px circle named by `label`; `isExtended` widens it to a pill that shows the label. `position` pins it to a viewport corner above the mobile action dock — leave it `none` (default) to place it yourself. Several related actions belong in a SpeedDial.",
      },
    },
  },
} satisfies Meta<typeof Fab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Call us" })).toBeVisible();
  },
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Fab {...args} variant="primary" />
      <Fab {...args} variant="secondary" />
      <Fab {...args} variant="primary" isExtended />
      <Fab {...args} variant="secondary" isExtended />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Fab {...args} size="md" />
      <Fab {...args} size="lg" />
      <Fab {...args} size="md" isExtended />
      <Fab {...args} size="lg" isExtended />
    </div>
  ),
};

export const Extended: Story = {
  args: { icon: ShoppingBag, label: "Order online", isExtended: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Order online")).toBeVisible();
  },
};

export const Disabled: Story = { args: { disabled: true } };

export const AsLink: Story = {
  args: { icon: Phone, label: "Call us", isExtended: true },
  render: (args) => (
    <Fab {...args} asChild>
      <DemoLink href="tel:+911244000000" />
    </Fab>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Call us" })).toHaveAttribute(
      "href",
      "tel:+911244000000"
    );
  },
};

export const OnGrounds: Story = {
  render: (args) => (
    <OnSurfaces>
      <Fab {...args} />
      <Fab {...args} variant="secondary" />
      <Fab {...args} isExtended />
    </OnSurfaces>
  ),
};

/** `position` is `fixed` to the viewport, so a framed demo uses `none`; the real thing is below. */
export const Positions: Story = {
  render: (args) => (
    <div className="relative h-64 w-full rounded-lg border border-border-subtle bg-surface-page-alt">
      <div className="absolute end-4 bottom-4">
        <Fab {...args} label="bottom-end" icon={MapPin} />
      </div>
      <div className="absolute start-4 bottom-4">
        <Fab {...args} label="bottom-start" icon={MapPin} variant="secondary" />
      </div>
    </div>
  ),
};

/** The pinned Fab on the viewport itself (fullscreen layout): bottom-end, clear of the mobile dock. */
export const Pinned: Story = {
  parameters: { layout: "fullscreen" },
  args: { position: "bottom-end", isExtended: true },
  play: async ({ canvas }) => {
    const rect = canvas.getByRole("button", { name: "Call us" }).getBoundingClientRect();
    await expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
    await expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight);
  },
};

export const Mobile360: Story = {
  globals: { viewport: { value: "floor360", isRotated: false } },
  parameters: { layout: "fullscreen" },
  args: { position: "bottom-start", isExtended: true, label: "Order online", icon: ShoppingBag },
  play: async ({ canvas }) => {
    const rect = canvas.getByRole("button", { name: "Order online" }).getBoundingClientRect();
    await expect(rect.left).toBeGreaterThanOrEqual(0);
    await expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
  },
};
