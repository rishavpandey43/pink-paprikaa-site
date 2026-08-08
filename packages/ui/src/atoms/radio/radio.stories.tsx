import type { Meta, StoryObj } from "@storybook/react-vite";

import { Radio, RadioGroup } from "./radio";

// `meta` is annotated rather than `satisfies`-inferred: under pnpm's isolated node_modules,
// declaration emit for an inferred decorator type reaches for Storybook/Radix internals it
// cannot name from here (TS2883). The annotation keeps the emitted type nameable.
const meta: Meta<typeof Radio> = {
  title: "Atoms/Radio",
  component: Radio,
  args: { label: "Regular", value: "regular" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The exactly-one choice — portion size, heat, payment method. Every `Radio` must sit " +
          "inside a `RadioGroup`, which owns the shared name, the chosen value and the arrow-key " +
          "movement. The chosen mark is a 6px pink ring, never a filled disc.",
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

export const Default: Story = {
  render: (args) => (
    <RadioGroup aria-label="Portion" defaultValue="regular">
      <Radio {...args} />
      <Radio label="Sharing" value="sharing" />
    </RadioGroup>
  ),
};

/** Prices are absolute here, not add-ons — a portion costs ₹280, it does not add ₹280. */
export const WithPrices: Story = {
  render: () => (
    <RadioGroup aria-label="Portion" defaultValue="regular">
      <Radio label="Regular" price={280} value="regular" />
      <Radio description="Feeds two." label="Sharing" price={440} value="sharing" />
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup aria-label="Heat" defaultValue="hot" orientation="horizontal">
      <Radio label="Mild" value="mild" />
      <Radio label="Hot" value="hot" />
      <Radio label="Extra hot" value="extra-hot" />
    </RadioGroup>
  ),
};

export const States: Story = {
  render: () => (
    <RadioGroup aria-label="Portion" defaultValue="regular">
      <Radio label="Chosen" value="regular" />
      <Radio label="Not chosen" value="sharing" />
      <Radio hasError label="Group unanswered" value="invalid" />
      <Radio description="Weekends only." disabled label="Family platter" value="family" />
    </RadioGroup>
  ),
};

/** The real shape: the portion step of an item sheet, priced and answered. */
export const PortionPicker: Story = {
  render: () => (
    <fieldset className="rounded-4 border border-border-subtle p-5">
      <legend className="px-1 font-display text-subtitle1 font-bold text-text-heading">
        Choose a portion
      </legend>
      <RadioGroup aria-label="Choose a portion" defaultValue="regular">
        <Radio description="One plate." label="Regular" price={280} value="regular" />
        <Radio description="Feeds two." label="Sharing" price={440} value="sharing" />
        <Radio
          description="Weekends only."
          disabled
          label="Family platter"
          price={720}
          value="family"
        />
      </RadioGroup>
    </fieldset>
  ),
};
