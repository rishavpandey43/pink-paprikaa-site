import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn } from "storybook/test";

import { QuantityStepper } from "./quantity-stepper";

const meta = {
  title: "Molecules/QuantityStepper",
  component: QuantityStepper,
  args: { label: "Quantity", defaultValue: 2, min: 1, onValueChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "Quantity control for cart rows, item detail, add-ons and calculator guest counts. Pill on pink-50 with a pink-200 hairline; the count is Poppins 700 and can be typed — a typed value commits on blur or Enter, snapped to `step` and clamped to `min`/`max`; ArrowUp/Down step, Home/End jump, Escape restores. Use `min={0}` where reaching zero removes the line item, `min={1}` where it shouldn't. Controlled (`value` + `onValueChange`) or uncontrolled; `name`, `onBlur` and `ref` plug into react-hook-form's Controller.",
      },
    },
  },
} satisfies Meta<typeof QuantityStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add one" }));
    await expect(canvas.getByRole("spinbutton", { name: "Quantity" })).toHaveValue("3");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(3);
  },
};

/** Card row "size" — md and sm. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <QuantityStepper {...args} />
      <QuantityStepper {...args} size="sm" />
    </div>
  ),
};

/** Card row "at min" — minus disabled. */
export const AtMin: Story = { args: { defaultValue: 1, min: 1 } };

/** Card row `min={0}` — zero removes the line. */
export const MinZero: Story = { args: { defaultValue: 0, min: 0 } };

/** Card row "at max". */
export const AtMax: Story = { args: { defaultValue: 5, min: 0, max: 5 } };

/** Dev parity: in a cart row — the stepper holds its width while the dish name takes the rest. */
export const InACartRow: Story = {
  args: {
    label: "Paneer Butter Masala quantity",
    decrementLabel: "Remove one Paneer Butter Masala",
    incrementLabel: "Add one Paneer Butter Masala",
  },
  render: (args) => (
    <div className="flex w-full max-w-120 items-center gap-4 rounded-lg bg-surface-card p-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="font-display text-body font-bold text-text-heading">
          Paneer Butter Masala
        </span>
        <span className="text-body-sm text-text-muted">Medium · ₹280</span>
      </div>
      <QuantityStepper {...args} className="ms-auto" />
    </div>
  ),
};

/** Handoff Dawat calculator: 15–2000 guests in fives — a typed 5000 settles at 2000. */
export const TypedGuests: Story = {
  args: { label: "Guests", defaultValue: 50, min: 15, max: 2000, step: 5 },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("spinbutton", { name: "Guests" });
    await userEvent.clear(input);
    await userEvent.type(input, "5000");
    await userEvent.tab();
    await expect(input).toHaveValue("2000");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(2000);
  },
};
