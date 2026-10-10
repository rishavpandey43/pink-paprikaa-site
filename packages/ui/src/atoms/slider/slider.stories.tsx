import type { Meta, StoryObj } from "@storybook/react-vite";

import { Slider } from "./slider";

const meta = {
  title: "Atoms/Slider",
  component: Slider,
  args: { label: "Guests", min: 15, max: 300, step: 5, defaultValue: 60 },
  render: (args) => (
    <div className="w-full max-w-text-measure-prose">
      <Slider {...args} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "From the handoff calculators: a native range for a number picked by feel — guests for a Dawat, meals a day for an office. Full width, 32px tall, the brand pink as its accent. Always show the value next to it (the number, or a QuantityStepper for exact entry); `label` names it for assistive tech. Keyboard and touch are the platform's.",
      },
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** DawatCalculator.dc.html — the guests range inside the white calculator card. */
export const DawatGuests: Story = {
  name: "dawat guests (white card)",
  render: (args) => (
    <div className="grid w-full max-w-text-measure-prose gap-2.5 rounded-lg border border-border-subtle bg-surface-card p-6 shadow-1">
      <span className="font-display text-body-sm font-bold text-text-heading">1. Guests</span>
      <Slider {...args} />
      <span className="font-body text-caption text-text-muted">
        Minimum 15 guests · Royal Dawat from 50
      </span>
    </div>
  ),
};

/** OfficeLunch.dc.html — the meals-a-day range on the ink cost section. */
export const OfficeMealsOnInk: Story = {
  name: "office meals a day (ink section)",
  args: { label: "Meals a day", min: 20, max: 300, step: 5, defaultValue: 40 },
  render: (args) => (
    <div
      data-surface="ink"
      className="grid w-full max-w-text-measure-prose gap-2 rounded-lg bg-surface-inverse p-6"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display font-bold text-text-heading">Meals a day</span>
        <span className="font-display text-h3 font-black text-text-brand">40</span>
      </div>
      <Slider {...args} />
    </div>
  ),
};

export const Disabled: Story = { name: "disabled", args: { disabled: true } };
