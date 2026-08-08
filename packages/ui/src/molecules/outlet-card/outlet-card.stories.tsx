import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowUpRight } from "lucide-react";

import { Button } from "../../atoms/button/button";
import { OutletCard } from "./outlet-card";

const meta = {
  title: "Molecules/OutletCard",
  component: OutletCard,
  args: {
    name: "Sector 57",
    city: "Gurgaon",
    address: "MKM Market, Sector 57",
    hours: "8am – 11:30pm",
  },
  argTypes: { action: { control: false } },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "One location in the locator. Trading state is a `StatusDot` with a written line beside " +
          "it, never a coloured pill. Turn `hasImage` off for the compact picker row; pass `href` " +
          "and the whole card becomes one real link.",
      },
    },
  },
} satisfies Meta<typeof OutletCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-90">
      <OutletCard {...args} />
    </div>
  ),
};

/** Two cards in the locator grid — one open and linked, one closed. */
export const WithImage: Story = {
  render: (args) => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-4">
      <OutletCard {...args} href="/outlets/sector-57" name="Sector 57" status="open" />
      <OutletCard
        {...args}
        address="Sector 56 main market, first floor"
        hours="9am – 11pm"
        name="Sector 56"
        status="closed"
      />
    </div>
  ),
};

/** The three trading states. Each one says what it is — colour never carries it alone. */
export const StatusStates: Story = {
  render: (args) => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-4">
      <OutletCard {...args} hasImage={false} status="open" />
      <OutletCard {...args} hasImage={false} status="busy" />
      <OutletCard {...args} hasImage={false} status="closed" />
    </div>
  ),
};

/** The caller can write the line itself when "Open now" is not specific enough. */
export const CustomStatusLine: Story = {
  render: (args) => (
    <div className="max-w-90">
      <OutletCard {...args} hasImage={false} status="open" statusLabel="Open till 11:30pm" />
    </div>
  ),
};

/** The compact list row for the picker inside a sheet — no photograph, one secondary action. */
export const CompactWithAction: Story = {
  render: (args) => (
    <div className="max-w-90">
      <OutletCard
        {...args}
        action={
          <Button iconAfter={ArrowUpRight} size="sm" variant="ghost">
            Directions
          </Button>
        }
        hasImage={false}
        status="busy"
      />
    </div>
  ),
};

/** At 360px the status mark drops under a long outlet name rather than squeezing it. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  render: (args) => (
    <div className="w-full max-w-80">
      <OutletCard
        {...args}
        href="/outlets/sector-57"
        name="Sector 57 · MKM Market"
        statusLabel="Open till 11:30pm"
      />
    </div>
  ),
};
