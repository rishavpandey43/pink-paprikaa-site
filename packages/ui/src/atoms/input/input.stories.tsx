import type { Meta, StoryObj } from "@storybook/react-vite";

import { Building2, CreditCard, Phone, Ticket } from "lucide-react";

import { Button } from "../button/button";
import { Input } from "./input";

// `meta` is annotated rather than `satisfies`-inferred: under pnpm's isolated node_modules,
// declaration emit for an inferred decorator type reaches for Storybook/Radix internals it
// cannot name from here (TS2883). The annotation keeps the emitted type nameable.
const meta: Meta<typeof Input> = {
  title: "Atoms/Input",
  component: Input,
  args: { "aria-label": "Mobile number", placeholder: "98765 43210" },
  argTypes: {
    icon: { control: false },
    trailing: { control: false },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The bare text field — 48px tall, 10px radius, a 2px status border. It carries no " +
          "label, hint or message on purpose: the `Field` molecule wraps it with those, so the " +
          "same control can sit inside a form row, a search bar or a cart drawer unchanged.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 40 / 48 / 56px — fixed heights, so a field never wraps beside a button of the same size. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Input {...args} placeholder="Small — 40px" size="sm" />
      <Input {...args} placeholder="Medium — 48px" size="md" />
      <Input {...args} placeholder="Large — 56px" size="lg" />
    </div>
  ),
};

/** The border colour and the trailing glyph. The sentence explaining it belongs to `Field`. */
export const Statuses: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Input {...args} aria-label="Full name" placeholder="Rest" />
      <Input {...args} aria-label="Card number" defaultValue="4242 4242" status="error" />
      <Input {...args} aria-label="Promo code" defaultValue="PAPRIKAA50" status="success" />
      <Input {...args} aria-label="Pickup time" defaultValue="11:25pm" status="warning" />
    </div>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Input {...args} icon={Phone} />
      <Input {...args} aria-label="Company GSTIN" icon={Building2} placeholder="22AAAAA0000A1Z5" />
      <Input
        {...args}
        aria-label="Card number"
        icon={CreditCard}
        placeholder="4242 4242 4242 4242"
      />
    </div>
  ),
};

/** A suffix is static text; `trailing` takes a real control, most often a small ghost button. */
export const SuffixAndTrailing: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Input {...args} aria-label="Table size" placeholder="4" suffix="guests" />
      <Input
        {...args}
        aria-label="Promo code"
        icon={Ticket}
        placeholder="PAPRIKAA50"
        trailing={
          <Button size="sm" variant="ghost">
            Apply
          </Button>
        }
      />
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Input {...args} aria-label="Promo code" defaultValue="CHAI20" isLoading />
      <Input {...args} aria-label="Outlet" defaultValue="Sector 57" readOnly />
      <Input {...args} aria-label="Delivery address" disabled placeholder="Not serviceable yet" />
    </div>
  ),
};

/** Multiline grows with `rows` and stays draggable — kitchen notes are never one line. */
export const Multiline: Story = {
  render: (args) => (
    <Input
      {...args}
      aria-label="Notes for the kitchen"
      isMultiline
      placeholder="No onion, extra hot."
      rows={3}
    />
  ),
};
