import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { expectNoHorizontalOverflow } from "../expect-no-overflow";
import { KIT_NOTICE, KitNotice } from "../kit-notice";
import { DishStory, Leaderboard, LinkBanner, Mpu, OfferStory } from "./ad-artboards";
import { Artboard } from "./artboard";

const meta = {
  title: "Marketing/Kit/Ads",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The design system's story and display-ad artboards (ui_kits/marketing). Stories show the platform-chrome safe area with `hasSafeArea`. Small units sign with the wordmark (the lockup's 200px minimum does not fit them). Reference kit — not production copy.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex flex-col gap-4">
        <KitNotice source="ui_kits/marketing" />
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const OfferStoryBoard: Story = {
  name: "Offer story",
  render: () => (
    <Artboard format="story" className="max-w-54">
      <OfferStory hasSafeArea />
    </Artboard>
  ),
};

export const DishStoryBoard: Story = {
  name: "Dish story",
  render: () => (
    <Artboard format="story" className="max-w-54">
      <DishStory hasSafeArea />
    </Artboard>
  ),
};

export const LinkBannerBoard: Story = {
  name: "Link / OG",
  render: () => (
    <Artboard format="landscape" className="max-w-150">
      <LinkBanner />
    </Artboard>
  ),
};

export const LeaderboardBoard: Story = {
  name: "Leaderboard",
  render: () => (
    <Artboard format="leaderboard" className="max-w-182">
      <Leaderboard />
    </Artboard>
  ),
};

export const MpuBoard: Story = {
  name: "MPU",
  render: () => (
    <Artboard format="mpu" className="max-w-75">
      <Mpu />
    </Artboard>
  ),
};

export const Ads360: Story = {
  name: "Ads at 360px",
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <div className="flex flex-col gap-6">
      <Artboard format="story" className="max-w-54">
        <OfferStory hasSafeArea />
      </Artboard>
      <Artboard format="story" className="max-w-54">
        <DishStory hasSafeArea />
      </Artboard>
      <Artboard format="landscape" className="max-w-150">
        <LinkBanner />
      </Artboard>
      <Artboard format="leaderboard" className="max-w-182">
        <Leaderboard />
      </Artboard>
      <Artboard format="mpu" className="max-w-75">
        <Mpu />
      </Artboard>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement, 360);
    await expect(canvas.getByText(KIT_NOTICE)).toBeVisible();
  },
};
