import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { CheckCard } from "./check-card";

const meta = {
  title: "Molecules/CheckCard",
  component: CheckCard,
  args: {
    title: "Pay 3 months upfront",
    description: `Classic at ${formatRupees(125)} a meal, locked for 3 cycles`,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-text-measure-prose">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'A card-sized toggle with a tick box, from the handoff PlanCalculator. A native checkbox: every input prop goes to it, so `{...register("upfront")}` works unmodified. The whole card is the label.',
      },
    },
  },
} satisfies Meta<typeof CheckCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvas, userEvent }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Pay 3 months upfront" });
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await userEvent.keyboard(" ");
    await expect(checkbox).not.toBeChecked();
  },
};

/** PlanCalculator "3. How many meals" — upfront, checked. */
export const Upfront: Story = { args: { defaultChecked: true } };

/** PlanCalculator "5. Make it yours" — no onion, no garlic. */
export const NoOnionGarlic: Story = {
  args: {
    title: `No onion, no garlic · +${formatRupees(30)} a meal`,
    description: "Cooked in a separate pan, off the main batch",
  },
};

export const Disabled: Story = { args: { disabled: true } };
