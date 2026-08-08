import type { Meta, StoryObj } from "@storybook/react-vite";

import { LoyaltyCard } from "./loyalty-card";

const meta = {
  title: "Molecules/LoyaltyCard",
  component: LoyaltyCard,
  args: { visits: 3, goal: 6, reward: "chai" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The stamp card on the account screen and the app home. Its copy is generated, so it " +
          "reads naturally at one, many and none remaining. This is the one place a segmented " +
          "progress track is used — a stamp card counts visits, never a percentage.",
      },
    },
  },
} satisfies Meta<typeof LoyaltyCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The three sentences the copy generator produces, in order. */
export const Progress: Story = {
  render: (args) => (
    <div className="grid max-w-100 gap-4">
      <LoyaltyCard {...args} visits={3} />
      <LoyaltyCard {...args} visits={5} />
      <LoyaltyCard {...args} visits={6} />
    </div>
  ),
};

/** Nothing earned yet — the track is all empty stamps and the sentence still reads plainly. */
export const Empty: Story = {
  args: { visits: 0 },
};

/** The flooded pink skin. One per screen: it is the loudest card the system has. */
export const OnBrand: Story = {
  globals: { backgrounds: { value: "page" } },
  args: { variant: "brand", visits: 2, reward: "a kulfi" },
};

/** A longer reward name shrinks the copy column rather than pushing the stamps off screen. */
export const LongReward: Story = {
  args: { reward: "a gulkand kulfi", visits: 4, goal: 8 },
};

/** Both skins side by side, at the width a phone gives them. */
export const Skins: Story = {
  render: (args) => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4">
      <LoyaltyCard {...args} />
      <LoyaltyCard {...args} variant="brand" />
    </div>
  ),
};
