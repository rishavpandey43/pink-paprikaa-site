import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowUpRight } from "lucide-react";
import { expect } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { OutletCard } from "./outlet-card";

const ADDRESS = "Booth No. 67P, HSVP Market (MKM Market), Sector 57";
const HOURS = "8am – 11:30pm";

const directions = (
  <Button asChild size="sm" variant="ghost" iconAfter={ArrowUpRight}>
    <a href="https://maps.google.com/?q=Pink+Paprikaa+Sector+57+Gurgaon">Directions</a>
  </Button>
);

const meta = {
  title: "Molecules/OutletCard",
  component: OutletCard,
  args: { city: "Gurgaon", name: "Sector 57", address: ADDRESS, hours: HOURS },
  decorators: [
    (Story) => (
      <div className="w-full max-w-article">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "One café location — the website locator and the app outlet picker. Pass `hasImage={false}` for the compact list variant. Status is a StatusDot with a word, never a coloured pill. Pass `href` and the whole card becomes one real link that lifts on hover; the `action` stays its own control above it.",
      },
    },
  },
} satisfies Meta<typeof OutletCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "with image": open and closed side by side. */
export const WithImage: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-3.5">
      <OutletCard {...args} />
      <OutletCard {...args} status="closed" />
    </div>
  ),
};

/** Card row `hasImage={false}`: the list form, busy, with a Directions action. */
export const WithoutImage: Story = {
  args: {
    hasImage: false,
    status: "busy",
    action: directions,
  },
};

/** With `href` the card is one link; Directions stays its own target above the link's overlay. */
export const AsLink: Story = {
  args: { href: "#sector-57", hasImage: false, action: directions },
  // Real layout: a tap on the address lands on the stretched link; a tap on Directions lands on
  // Directions (z-raised), not on the card behind it.
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Sector 57" });
    const action = canvas.getByRole("link", { name: /Directions/ });
    const at = (element: Element) => {
      const box = element.getBoundingClientRect();
      return document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    };
    await expect(at(canvas.getByText(ADDRESS))).toBe(link);
    await expect(action.contains(at(action))).toBe(true);
  },
};

/** The three trading states, each in words — colour never carries it alone. */
export const StatusStates: Story = {
  render: (args) => (
    <div className="grid gap-3.5 md:grid-cols-3">
      <OutletCard {...args} hasImage={false} status="open" />
      <OutletCard {...args} hasImage={false} status="busy" />
      <OutletCard {...args} hasImage={false} status="closed" />
    </div>
  ),
};

/** `statusLabel` when "Open now" is not specific enough. */
export const CustomStatusLine: Story = {
  args: { hasImage: false, statusLabel: "Open till 11:30pm" },
};

/** 360px, linked: the status drops under a long name instead of squeezing it. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360", isRotated: false } },
  args: { href: "#sector-57", name: "Sector 57 · MKM Market", statusLabel: "Open till 11:30pm" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    const card = canvas.getByRole("article");
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
  },
};
