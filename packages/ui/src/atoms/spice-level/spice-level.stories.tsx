import type { Meta, StoryObj } from "@storybook/react-vite";

import { Text } from "../text/text";
import { SpiceLevel } from "./spice-level";

const meta = {
  title: "Atoms/SpiceLevel",
  component: SpiceLevel,
  parameters: {
    docs: {
      description: {
        component:
          "Heat shown as the brand's diamond, filled along the four-step ramp — mint, turmeric, " +
          "tandoor, pink. This is the sanctioned alternative to a chilli glyph: the system has no " +
          "emoji anywhere. Turn on the label wherever the mark stands alone, so colour is never " +
          "the only thing carrying the meaning.",
      },
    },
  },
} satisfies Meta<typeof SpiceLevel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 1 Mild · 2 Medium · 3 Hot · 4 Extra Hot. Every lit diamond takes the colour of the level. */
export const Levels: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <SpiceLevel {...args} level={1} />
      <SpiceLevel {...args} level={2} />
      <SpiceLevel {...args} level={3} />
      <SpiceLevel {...args} level={4} />
    </div>
  ),
};

/** The label is the brand's own heat name, set in the overline style. */
export const WithLabel: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <SpiceLevel {...args} hasLabel level={1} />
      <SpiceLevel {...args} hasLabel level={2} />
      <SpiceLevel {...args} hasLabel level={3} />
      <SpiceLevel {...args} hasLabel level={4} />
    </div>
  ),
};

/** 10 / 14 / 20px per diamond. Use `sm` in a dense menu row, `lg` on an item page. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <SpiceLevel {...args} hasLabel level={3} size="xs" />
      <SpiceLevel {...args} hasLabel level={3} size="sm" />
      <SpiceLevel {...args} hasLabel level={3} size="md" />
      <SpiceLevel {...args} hasLabel level={3} size="lg" />
    </div>
  ),
};

/** A shortened scale for rows that have run out of width. */
export const ShorterScale: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-6">
      <SpiceLevel {...args} level={2} max={2} />
      <SpiceLevel {...args} level={2} max={3} />
      <SpiceLevel {...args} level={2} max={4} />
    </div>
  ),
};

/** How it actually appears: under the dish name, beside the rest of the row's metadata. */
export const InContext: Story = {
  render: (args) => (
    <div className="flex max-w-80 flex-col gap-1">
      <Text variant="subtitle1">Paprikaa Chilli Paneer</Text>
      <Text variant="body2" tone="muted">
        Wok-tossed cottage cheese, capsicum, spring onion.
      </Text>
      <SpiceLevel {...args} hasLabel level={3} size="sm" />
    </div>
  ),
};
