import type { Meta, StoryObj } from "@storybook/react-vite";

import { Leaf, Star, UtensilsCrossed } from "lucide-react";

import { Stat } from "./stat";

const meta = {
  title: "Molecules/Stat",
  component: Stat,
  parameters: {
    docs: {
      description: {
        component:
          "One big, checkable fact. The number is fluid-clamped Poppins in the brand's heaviest " +
          "cut, so it never overflows a narrow column. Use at most three or four in a row — and " +
          "never invent a number: every value below is a fact the kitchen can stand behind.",
      },
    },
  },
  args: { value: "100%", label: "vegetarian kitchen" },
  argTypes: { icon: { control: false } },
} satisfies Meta<typeof Stat>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The sub line carries the detail behind the number. */
export const WithSub: Story = {
  args: {
    value: "7",
    label: "sections on the menu",
    sub: "North Indian, Chinese, momos, chaat, sandwiches, drinks and desserts",
  },
};

export const WithIcon: Story = {
  args: { value: "4.6", label: "average guest rating", icon: Star, tone: "brand" },
};

export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-10">
      <Stat {...args} icon={Leaf} tone="ink" />
      <Stat {...args} icon={Leaf} tone="brand" />
    </div>
  ),
};

/** `inverse` on a flooded ink panel — the ink tones vanish there. */
export const OnInk: Story = {
  globals: { backgrounds: { value: "inverse" } },
  args: { tone: "inverse", align: "center" },
  render: (args) => (
    <div className="rounded-5 bg-surface-inverse p-8">
      <Stat {...args} />
    </div>
  ),
};

/** Three across, the most a row should ever carry. Each column holds its own alignment. */
export const Row: Story = {
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-8">
      <Stat {...args} icon={Leaf} label="vegetarian kitchen" value="100%" />
      <Stat {...args} icon={UtensilsCrossed} label="sections on the menu" value="7" />
      <Stat {...args} icon={Star} label="average guest rating" value="4.6" />
    </div>
  ),
};

/** Centred stats sit under a centred `SectionHeader`. */
export const Centred: Story = {
  args: { align: "center", value: "7", label: "sections on the menu" },
};

/** At 360px the fluid number steps down rather than pushing the column open. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  args: { value: "4.6", label: "average guest rating", sub: "Across every ordering channel" },
};
