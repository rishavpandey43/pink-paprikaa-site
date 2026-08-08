import type { Meta, StoryObj } from "@storybook/react-vite";

import { Bell, CreditCard, Gift, MapPin, Trash2 } from "lucide-react";

import { Badge } from "../../atoms/badge/badge";
import { ListRow } from "./list-row";

const meta = {
  title: "Molecules/ListRow",
  component: ListRow,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The settings, account and detail row. Rows are hairline separated — never a stack of " +
          "cards — and hold a 44px hit target. Give it an `onClick` and it renders a real " +
          "`<button>`, so keyboard and focus come for free; a row that carries its own control " +
          "must not also be clickable.",
      },
    },
  },
  args: { title: "Default outlet" },
  argTypes: { icon: { control: false }, leading: { control: false }, trailing: { control: false } },
} satisfies Meta<typeof ListRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { icon: MapPin, value: "Sector 57" } };

/** The navigating row: a value on the right and a chevron saying there is more behind it. */
export const WithValueAndChevron: Story = {
  args: { icon: MapPin, value: "Sector 57", hasChevron: true, onClick: () => undefined },
};

export const WithDescription: Story = {
  args: {
    icon: CreditCard,
    title: "Payment methods",
    description: "UPI, cards and cash at the counter.",
    hasChevron: true,
    onClick: () => undefined,
  },
};

/** A trailing element states the row's current value without turning it into a second control. */
export const WithTrailing: Story = {
  args: {
    icon: Gift,
    title: "Loyalty",
    trailing: <Badge tone="soft">4 of 6</Badge>,
    hasChevron: true,
    onClick: () => undefined,
  },
};

/** Destructive rows colour the glyph and the title, and nothing else. */
export const Danger: Story = {
  args: {
    icon: Trash2,
    title: "Delete my account",
    isDanger: true,
    hasChevron: true,
    hasDivider: false,
    onClick: () => undefined,
  },
};

/** A group: hairlines between the rows, none under the last one. */
export const Group: Story = {
  render: (args) => (
    <div className="max-w-120">
      <ListRow
        {...args}
        hasChevron
        icon={MapPin}
        onClick={() => undefined}
        title="Default outlet"
        value="Sector 57"
      />
      <ListRow
        {...args}
        hasChevron
        icon={Bell}
        onClick={() => undefined}
        title="Order updates"
        value="On"
      />
      <ListRow
        {...args}
        description="UPI, cards and cash at the counter."
        hasChevron
        icon={CreditCard}
        onClick={() => undefined}
        title="Payment methods"
      />
      <ListRow
        {...args}
        hasChevron
        hasDivider={false}
        icon={Trash2}
        isDanger
        onClick={() => undefined}
        title="Delete my account"
      />
    </div>
  ),
};

/** At 360px the title clamps and the value keeps its place — the row never wraps. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  args: {
    icon: MapPin,
    title: "Default outlet for pickup orders",
    description: "MKM Market, Sector 57, Gurgaon.",
    value: "Sector 57",
    hasChevron: true,
    onClick: () => undefined,
  },
};
