import type { Meta, StoryObj } from "@storybook/react-vite";

import { Field } from "../field/field";
import { type Slot, SlotPicker } from "./slot-picker";

const PICKUP_SLOTS: (Slot | string)[] = [
  { value: "asap", label: "ASAP", note: "12 min" },
  "7:30pm",
  "8:00pm",
  "8:30pm",
  { value: "9pm", label: "9:00pm", isDisabled: true },
];

// `meta` is annotated rather than `satisfies`-inferred: under pnpm's isolated node_modules,
// declaration emit for an inferred decorator type reaches for Storybook/Radix internals it
// cannot name from here (TS2883). The annotation keeps the emitted type nameable.
const meta: Meta<typeof SlotPicker> = {
  title: "Molecules/SlotPicker",
  component: SlotPicker,
  args: { label: "Pickup time", slots: PICKUP_SLOTS, defaultValue: "7:30pm" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Pickup and table-booking time slots — a radio group wearing chips, so the arrow keys " +
          "move between slots for free. The grid auto-fits at a 96px minimum so it reflows on " +
          "any width, and sold-out slots stay visible, struck through, rather than disappearing.",
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

/** Fixed column counts for short, even sets — table sizes, guest counts. */
export const FixedColumns: Story = {
  args: {
    columns: 3,
    label: "Table size",
    defaultValue: "2",
    slots: [
      { value: "2", label: "2 guests" },
      { value: "4", label: "4 guests" },
      { value: "6", label: "6 guests" },
    ],
  },
};

/** Every status carries a sentence — a colour on its own never says what went wrong. */
export const Statuses: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <SlotPicker {...args} hint="Slots open 30 minutes ahead." />
      <SlotPicker {...args} message="Pick a slot to continue." status="error" />
      <SlotPicker {...args} message="That slot is nearly full." status="warning" />
      <SlotPicker {...args} message="Held for you until 7:15pm." status="success" />
      <SlotPicker {...args} message="Table booking opens at 11am." status="disabled" />
    </div>
  ),
};

/** Sold-out slots stay on the grid, struck through, so the reader can see what they missed. */
export const SoldOut: Story = {
  args: {
    defaultValue: "8:30pm",
    slots: [
      { value: "7pm", label: "7:00pm", isDisabled: true },
      { value: "7:30pm", label: "7:30pm", isDisabled: true },
      "8:00pm",
      "8:30pm",
    ],
  },
};

/** Inside a `Field` when the group needs a hint and a status line it does not own itself. */
export const InsideAField: Story = {
  render: () => (
    <Field hint="You can change this until the kitchen starts your order." label="Pickup time">
      <SlotPicker aria-label="Pickup time" defaultValue="7:30pm" slots={PICKUP_SLOTS} />
    </Field>
  ),
};

/** The narrowest supported width — the grid reflows instead of overflowing. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-90">
        <Story />
      </div>
    ),
  ],
};
