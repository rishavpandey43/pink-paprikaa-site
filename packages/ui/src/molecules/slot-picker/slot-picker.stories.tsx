import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn } from "storybook/test";

import { type SlotOption, SlotPicker } from "./slot-picker";

const PICKUP: SlotOption[] = [
  { value: "asap", label: "ASAP", note: "12 min" },
  { value: "7:30pm", label: "7:30pm" },
  { value: "8:00pm", label: "8:00pm" },
  { value: "8:30pm", label: "8:30pm" },
  { value: "9pm", label: "9:00pm", isDisabled: true },
];

const meta = {
  title: "Molecules/SlotPicker",
  component: SlotPicker,
  args: { name: "pickup", legend: "Pickup time", slots: PICKUP },
  parameters: {
    docs: {
      description: {
        component:
          'Pickup and table-booking time slots — a fieldset of real radios, so it works server-rendered, posts in a native form and keeps arrow-key selection. Auto-fit grid at a 96px minimum, so it reflows on any width; `columns` fixes the count. Sold-out slots (`isDisabled`) are struck through, not hidden. `status` + `message` for "Pick a slot to continue." 44px minimum hit height. Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`); react-hook-form binds it with `<Controller>`.',
      },
    },
  },
} satisfies Meta<typeof SlotPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "auto-fit". */
export const Playground: Story = {
  args: { defaultValue: "7:30pm", onValueChange: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByText("8:00pm"));
    await expect(canvas.getByRole("radio", { name: "8:00pm" })).toBeChecked();
    await expect(args.onValueChange).toHaveBeenCalledWith("8:00pm");
  },
};

/** Card row "error". */
export const WithError: Story = { args: { status: "error", message: "Pick a slot to continue." } };

/** Card row "disabled". */
export const Disabled: Story = { args: { disabled: true } };

/** Card row `columns={3}` — the card shows no label, so the legend is visually hidden. */
export const Columns: Story = {
  args: {
    name: "guests",
    legend: "Guests",
    isLegendHidden: true,
    columns: 3,
    defaultValue: "2",
    slots: [
      { value: "2", label: "2 guests" },
      { value: "4", label: "4 guests" },
      { value: "6", label: "6 guests" },
    ],
  },
};

/** Dev parity: every status carries a sentence — hint, warning and success beside the card's error. */
export const Statuses: Story = {
  render: (args) => (
    <div className="flex max-w-120 flex-col gap-6">
      <SlotPicker {...args} name="pickup-hint" message="Slots open 30 minutes ahead." />
      <SlotPicker
        {...args}
        name="pickup-warning"
        status="warning"
        message="That slot is nearly full."
      />
      <SlotPicker
        {...args}
        name="pickup-success"
        status="success"
        defaultValue="7:30pm"
        message="Held for you until 7:15pm."
      />
    </div>
  ),
};

/** Dev parity: the narrowest supported width — the grid reflows instead of overflowing. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};
