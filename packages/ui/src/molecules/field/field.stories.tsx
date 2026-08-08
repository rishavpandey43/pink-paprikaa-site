import type { Meta, StoryObj } from "@storybook/react-vite";

import { Phone } from "lucide-react";

import { Input } from "../../atoms/input/input";
import { Field } from "./field";

// `meta` is annotated rather than `satisfies`-inferred: under pnpm's isolated node_modules,
// declaration emit for an inferred decorator type reaches for Storybook/Radix internals it
// cannot name from here (TS2883). The annotation keeps the emitted type nameable.
const meta: Meta<typeof Field> = {
  title: "Molecules/Field",
  component: Field,
  args: {
    label: "Mobile number",
    htmlFor: "mobile",
    children: (
      <Input
        aria-describedby="mobile-description"
        icon={Phone}
        id="mobile"
        placeholder="98765 43210"
      />
    ),
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Label, control and one line of hint-or-status. Wrap it around any control that does " +
          "not carry its own label. It owns the status vocabulary the other form molecules " +
          "share, and a status message always replaces the hint rather than crowding in beside it.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHint: Story = {
  args: { hint: "We text your order code here." },
};

/** Mark the few optional fields rather than starring the many required ones. */
export const RequiredAndOptional: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Field {...args} isRequired />
      <Field {...args} htmlFor="notes" isOptional label="Notes for the kitchen">
        <Input id="notes" isMultiline placeholder="Less oil, no onion" rows={3} />
      </Field>
    </div>
  ),
};

/** Every status carries a sentence — a colour on its own never says what went wrong. */
export const Statuses: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Field {...args} hint="We text your order code here." />
      <Field {...args} message="Enter a 10-digit mobile number." status="error">
        <Input aria-invalid defaultValue="98765" icon={Phone} id="mobile" status="error" />
      </Field>
      <Field
        {...args}
        htmlFor="promo"
        label="Promo code"
        message="PAPRIKAA50 applied — ₹150 off."
        status="success"
      >
        <Input defaultValue="PAPRIKAA50" id="promo" status="success" />
      </Field>
      <Field
        {...args}
        htmlFor="slot"
        label="Pickup time"
        message="That slot is nearly full."
        status="warning"
      >
        <Input defaultValue="7:30pm" id="slot" status="warning" />
      </Field>
      <Field
        {...args}
        htmlFor="code"
        label="Promo code"
        message="Checking that code."
        status="loading"
      >
        <Input defaultValue="PAPRIKAA50" id="code" isLoading />
      </Field>
      <Field
        {...args}
        htmlFor="outlet"
        label="Outlet"
        message="Pickup only for now."
        status="readOnly"
      >
        <Input defaultValue="Sector 57" id="outlet" readOnly />
      </Field>
      <Field
        {...args}
        htmlFor="table"
        label="Table size"
        message="Table booking opens at 11am."
        status="disabled"
      >
        <Input disabled id="table" placeholder="Choose a table size" />
      </Field>
    </div>
  ),
};

/** A 160px label column from 480px up; below that it stacks, so a 360px screen still works. */
export const SideLayout: Story = {
  args: { layout: "side", hint: "Pickup only for now." },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Field {...args} />
      <Field {...args} htmlFor="outlet" label="Outlet">
        <Input defaultValue="Sector 57" id="outlet" />
      </Field>
    </div>
  ),
};

/** Around a bare control — a group of choices that carries no label of its own. */
export const AroundABareControl: Story = {
  render: () => (
    <Field hint="You can change this on any dish later." label="How spicy?">
      <div className="flex flex-wrap gap-2">
        {["Mild", "Medium", "Hot", "Extra Hot"].map((level) => (
          <span
            className="rounded-6 border border-border-default px-4 py-2 font-display text-body2 font-bold text-text-body"
            key={level}
          >
            {level}
          </span>
        ))}
      </div>
    </Field>
  ),
};
