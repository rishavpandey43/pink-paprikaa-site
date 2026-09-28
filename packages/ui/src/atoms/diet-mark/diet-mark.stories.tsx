import type { Meta, StoryObj } from "@storybook/react-vite";

import { DietMark } from "./diet-mark";

const meta = {
  title: "Atoms/DietMark",
  component: DietMark,
  parameters: {
    docs: {
      description: {
        component:
          "The statutory Indian vegetarian mark — a green square and dot. Every menu item on every surface carries one. Pink Paprikaa is a pure-veg kitchen, not even egg, so this is the only diet mark in the system: the design system's egg variant is not built (spec C10) and no non-veg mark may be added. Never substitute an emoji or a coloured pill. `sm` (14px) sits beside a dish name.",
      },
    },
  },
} satisfies Meta<typeof DietMark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Veg: Story = {
  name: "veg",
  render: () => (
    <div className="flex items-center gap-4">
      <DietMark size="sm" />
      <DietMark size="md" />
      <DietMark size="lg" />
    </div>
  ),
};

export const InContext: Story = {
  name: "in context",
  render: () => (
    <span className="flex items-center gap-2">
      <DietMark size="sm" />
      <span className="font-display text-h4 text-text-heading">Paprikaa Chilli Paneer</span>
    </span>
  ),
};
