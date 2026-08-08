import type { Meta, StoryObj } from "@storybook/react-vite";

import { Switch } from "./switch";

// `meta` is annotated rather than `satisfies`-inferred: under pnpm's isolated node_modules,
// declaration emit for an inferred decorator type reaches for Storybook/Radix internals it
// cannot name from here (TS2883). The annotation keeps the emitted type nameable.
const meta: Meta<typeof Switch> = {
  title: "Atoms/Switch",
  component: Switch,
  args: { label: "Order updates" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A toggle for settings that take effect the moment they move — never inside a " +
          "save-on-submit form, where a `Checkbox` is the honest control. Label sits left and " +
          "the 46 x 28 track right, so a column of switches lines its knobs up on one edge.",
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

export const On: Story = { args: { defaultChecked: true } };

export const WithDescription: Story = {
  args: { label: "Jain preferences", description: "Hides onion and garlic." },
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Switch {...args} label="Off" />
      <Switch {...args} defaultChecked label="On" />
      <Switch
        {...args}
        description="Delivery starts later this year."
        disabled
        label="Delivery updates"
      />
    </div>
  ),
};

/** The real shape: a preferences panel where every row takes effect immediately. */
export const PreferencesPanel: Story = {
  render: () => (
    <div className="flex flex-col gap-5 rounded-4 border border-border-subtle p-5">
      <Switch
        defaultChecked
        description="Order confirmations and pickup times."
        label="Order updates"
      />
      <Switch description="Offers and new dishes, at most once a week." label="Marketing texts" />
      <Switch defaultChecked description="Hides onion and garlic." label="Jain preferences" />
      <Switch description="Delivery starts later this year." disabled label="Delivery updates" />
    </div>
  ),
};
