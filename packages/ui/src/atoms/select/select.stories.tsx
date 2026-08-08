import type { Meta, StoryObj } from "@storybook/react-vite";

import { Clock, Users } from "lucide-react";

import { Select } from "./select";

const OUTLETS = ["Sector 57", "MKM Market"];

// `meta` is annotated rather than `satisfies`-inferred: under pnpm's isolated node_modules,
// declaration emit for an inferred decorator type reaches for Storybook/Radix internals it
// cannot name from here (TS2883). The annotation keeps the emitted type nameable.
const meta: Meta<typeof Select> = {
  title: "Atoms/Select",
  component: Select,
  args: { "aria-label": "Pick your outlet", options: OUTLETS, placeholder: "Choose an outlet" },
  argTypes: {
    icon: { control: false },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A dropdown for short, known lists — outlet, table size, pickup slot. It matches " +
          "`Input` exactly on height, radius and status colour, so the two line up in a form, " +
          "and the status glyph takes the chevron's place. Past about a dozen options, use a " +
          "searchable list instead.",
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

export const Chosen: Story = { args: { defaultValue: "Sector 57" } };

/** 40 / 48 / 56px — the same fixed heights as `Input`. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Select {...args} placeholder="Small — 40px" size="sm" />
      <Select {...args} placeholder="Medium — 48px" size="md" />
      <Select {...args} placeholder="Large — 56px" size="lg" />
    </div>
  ),
};

/** The status glyph replaces the chevron, so the field never carries two trailing marks. */
export const Statuses: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Select {...args} />
      <Select {...args} aria-label="Pickup slot" placeholder="Choose a slot" status="error" />
      <Select {...args} defaultValue="Sector 57" status="success" />
      <Select {...args} defaultValue="MKM Market" status="warning" />
    </div>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Select
        {...args}
        aria-label="Guests"
        icon={Users}
        options={["2 guests", "4 guests", "6 guests"]}
        placeholder="Choose a table size"
      />
      <Select
        {...args}
        aria-label="Pickup slot"
        icon={Clock}
        options={[
          { value: "1930", label: "7:30pm" },
          { value: "2000", label: "8:00pm" },
          { value: "2030", label: "8:30pm", disabled: true },
        ]}
        placeholder="Choose a slot"
      />
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Select {...args} defaultValue="Sector 57" isReadOnly />
      <Select
        {...args}
        aria-label="Delivery slot"
        disabled
        options={["Not serviceable yet"]}
        placeholder="Not available"
      />
    </div>
  ),
};
