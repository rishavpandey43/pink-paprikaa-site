import type { Meta, StoryObj } from "@storybook/react-vite";

import { Text } from "../text/text";
import { Card } from "./card";

const meta = {
  title: "Atoms/Card",
  component: Card,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The surface every block of content sits on. `default` is the white workhorse; " +
          "`feature` and `brand` carry a promotion; `ink` is footer weight; `quiet` recedes. " +
          "`isInteractive` styles the hover lift only — put the real link inside the card.",
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The same outlet card on each skin.
 *
 * `on="brand"` is not just a colour swap: a `brand` card floods #EE2C68, where white type only
 * clears WCAG as *large* text (4.04:1 against the 3:1 threshold). The heading is `h3` and safe on
 * any skin, but the supporting line has to step up from `body2` to `subtitle1` bold — 20px, the
 * smallest step on the ramp that counts as large. On white, tint and ink it stays `body2`.
 */
function Outlet({ on }: { on: "light" | "brand" | "ink" }) {
  const isInverse = on !== "light";
  return (
    <>
      <Text tone={isInverse ? "inverse" : "heading"} variant="h3">
        Sector 57, Gurgaon
      </Text>
      <Text
        className="mt-1-5"
        tone={isInverse ? "inverse" : "muted"}
        variant={on === "brand" ? "subtitle1" : "body2"}
      >
        MKM Market · 8am – 11:30pm
      </Text>
    </>
  );
}

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="max-w-80">
      <Outlet on="light" />
    </Card>
  ),
};

export const Skins: Story = {
  render: (args) => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4">
      <Card {...args} variant="default">
        <Outlet on="light" />
      </Card>
      <Card {...args} variant="feature">
        <Outlet on="light" />
      </Card>
      <Card {...args} variant="brand">
        <Outlet on="brand" />
      </Card>
      <Card {...args} variant="ink">
        <Outlet on="ink" />
      </Card>
      <Card {...args} variant="quiet">
        <Outlet on="light" />
      </Card>
    </div>
  ),
};

/** 16 / 20 / 28px, plus `none` for a card that starts with an image. */
export const Padding: Story = {
  render: (args) => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4">
      <Card {...args} padding="sm">
        <Text variant="body2">padding sm</Text>
      </Card>
      <Card {...args} padding="md">
        <Text variant="body2">padding md</Text>
      </Card>
      <Card {...args} padding="lg">
        <Text variant="body2">padding lg</Text>
      </Card>
    </div>
  ),
};

/** Hovering lifts the card 2px onto `shadow-elevation3`. The link inside owns the interaction. */
export const Interactive: Story = {
  render: (args) => (
    <Card {...args} isInteractive className="max-w-80">
      <Text variant="h3">
        <a className="text-text-link" href="/menu">
          See Full Menu
        </a>
      </Text>
      <Text className="mt-1-5" tone="muted" variant="body2">
        Momos, chaat and North Indian plates · ₹180–₹320
      </Text>
    </Card>
  ),
};

/** `padding="none"` lets the image sit flush to the corners. */
export const MediaCard: Story = {
  render: (args) => (
    <Card {...args} className="max-w-80" padding="none">
      <div className="aspect-[4/3] w-full bg-surface-brand-soft" />
      <div className="p-5">
        <Text variant="h3">Paneer Tikka Masala</Text>
        <Text className="mt-1-5" tone="muted" variant="body2">
          ₹280 · 100% vegetarian kitchen
        </Text>
      </div>
    </Card>
  ),
};
