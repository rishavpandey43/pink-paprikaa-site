import type { Meta, StoryObj } from "@storybook/react-vite";

import { Bell, CreditCard, Gift, LogOut, MapPin, Receipt, Trash2 } from "lucide-react";
import { expect, fn } from "storybook/test";

import { Badge } from "../../atoms/badge/badge";
import { Switch } from "../../atoms/switch/switch";
import { ListRow } from "./list-row";

const meta = {
  title: "Molecules/ListRow",
  component: ListRow,
  args: { icon: MapPin, title: "Default outlet", value: "Sector 57", hasChevron: true },
  render: (args) => (
    <ListRow {...args} asChild>
      <a href="#outlet">{/* ListRow renders its content here */}</a>
    </ListRow>
  ),
  parameters: {
    docs: {
      description: {
        component:
          "Settings, account and detail rows in the app. Rows are hairline separated — never a stack of cards — and at least 44px tall. `asChild` renders the whole row into a link or button (it gets the classes and the pink-50 hover); a row with a `trailing` control (Switch) stays a plain row. `isDanger` for destructive rows. The glyph, value and chevron follow the surface.",
      },
    },
  },
} satisfies Meta<typeof ListRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "value + chevron" — a link row. */
export const Playground: Story = {};

/** Card row "trailing control". */
export const TrailingControl: Story = {
  args: { icon: Bell, title: "Order updates", value: undefined, hasChevron: false },
  render: (args) => (
    <ListRow {...args} trailing={<Switch label="Order updates" isLabelHidden defaultChecked />} />
  ),
};

/** Card row "description". */
export const WithDescription: Story = {
  args: {
    icon: CreditCard,
    title: "Payment methods",
    description: "UPI, cards and Paprikaa credit.",
    value: undefined,
  },
};

/** Card row "trailing badge". */
export const TrailingBadge: Story = {
  args: { icon: Gift, title: "Loyalty", value: undefined },
  render: (args) => (
    <ListRow {...args} trailing={<Badge tone="soft">4 of 6</Badge>} asChild>
      <a href="#loyalty">{/* ListRow renders its content here */}</a>
    </ListRow>
  ),
};

/** Card row "danger" — an action row rendered into a button. */
export const Danger: Story = {
  args: {
    icon: Trash2,
    title: "Delete my account",
    value: undefined,
    isDanger: true,
    hasDivider: false,
  },
  render: (args) => (
    <ListRow {...args} asChild>
      <button type="button" onClick={fn()} />
    </ListRow>
  ),
  play: async ({ canvas, userEvent }) => {
    const row = canvas.getByRole("button", { name: /Delete my account/ });
    await userEvent.tab();
    await expect(row).toHaveFocus();
  },
};

/** The app kit's account list. */
export const AccountList: Story = {
  render: () => (
    <div className="grid">
      <ListRow asChild icon={MapPin} title="Default outlet" value="Sector 57" hasChevron>
        <a href="#outlet">{/* ListRow renders its content here */}</a>
      </ListRow>
      <ListRow
        asChild
        icon={Receipt}
        title="Order history"
        description="Your past orders"
        hasChevron
      >
        <a href="#orders">{/* ListRow renders its content here */}</a>
      </ListRow>
      <ListRow asChild icon={CreditCard} title="Payment methods" value="UPI" hasChevron>
        <a href="#payments">{/* ListRow renders its content here */}</a>
      </ListRow>
      <ListRow
        icon={Bell}
        title="Order updates"
        trailing={<Switch label="Order updates" isLabelHidden defaultChecked />}
      />
      <ListRow asChild icon={LogOut} title="Sign out" isDanger hasDivider={false}>
        <button type="button" onClick={fn()} />
      </ListRow>
    </div>
  ),
  // Real layout: the flex row blockifies title and value, so Chromium names the link with a space
  // between them (jsdom, without layout, runs them together).
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Default outlet Sector 57" })).toHaveAttribute(
      "href",
      "#outlet"
    );
  },
};

/** Dev parity: at 360px the description clamps and the value keeps its place. */
export const Narrow: Story = {
  args: {
    title: "Default outlet for pickup orders",
    description: "MKM Market, Sector 57, Gurgaon.",
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-80">
        <Story />
      </div>
    ),
  ],
};
