import type { Meta, StoryObj } from "@storybook/react-vite";

import { LoyaltyCard } from "./loyalty-card";

const meta = {
  title: "Molecules/LoyaltyCard",
  component: LoyaltyCard,
  args: { visits: 3, goal: 6, reward: "chai" },
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
          "The loyalty stamp card on the app home and account screen. The sentence is generated so it always reads naturally at many, one and zero visits left (`headline` replaces it). Segmented ProgressBar only — never a percentage bar here.",
      },
    },
  },
} satisfies Meta<typeof LoyaltyCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "in progress". */
export const InProgress: Story = {};

/** Card row "one left" — the copy adapts. */
export const OneLeft: Story = { args: { visits: 5 } };

/** Card row "complete". */
export const Complete: Story = { args: { visits: 6 } };

/** Card row `variant="brand"`. */
export const Brand: Story = { args: { variant: "brand", visits: 2, reward: "a kulfi" } };

/** Nothing earned yet: every stamp empty, and the sentence still reads plainly. */
export const Empty: Story = { args: { visits: 0 } };

/** A longer reward shrinks the copy column instead of pushing the stamps off the card. */
export const LongReward: Story = { args: { visits: 4, goal: 8, reward: "a gulkand kulfi" } };
