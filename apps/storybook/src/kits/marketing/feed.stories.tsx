import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { expectNoHorizontalOverflow } from "../expect-no-overflow";
import { KIT_NOTICE, KitNotice } from "../kit-notice";
import { Artboard } from "./artboard";
import { CarouselSlide, DishLaunchPost, OfferPost, StatementPost } from "./feed-artboards";

const meta = {
  title: "Marketing/Kit/Feed",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The design system's feed artboards (ui_kits/marketing), each built inside PostFrame at its true canvas and fitted for preview. Sizes are token steps: the feed seal is OfferSeal xl (360) and the MPU seal sm (110), as in the kit; the lockups are lg (280), md (240, also for the kit's 220) and sm (200). Reference kit — not production copy.",
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

export const Offer: Story = {
  render: () => (
    <Artboard format="post" className="max-w-92">
      <OfferPost />
    </Artboard>
  ),
};

export const DishLaunch: Story = {
  render: () => (
    <Artboard format="post" className="max-w-92">
      <DishLaunchPost />
    </Artboard>
  ),
};

export const Statement: Story = {
  render: () => (
    <Artboard format="portrait" className="max-w-76">
      <StatementPost />
    </Artboard>
  ),
};

export const Carousel: Story = {
  render: () => (
    <Artboard format="post" className="max-w-92">
      <CarouselSlide />
    </Artboard>
  ),
};

export const Feed360: Story = {
  name: "Feed at 360px",
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <div className="flex flex-col gap-6">
      <Artboard format="post" className="max-w-92">
        <OfferPost />
      </Artboard>
      <Artboard format="post" className="max-w-92">
        <DishLaunchPost />
      </Artboard>
      <Artboard format="portrait" className="max-w-76">
        <StatementPost />
      </Artboard>
      <Artboard format="post" className="max-w-92">
        <CarouselSlide />
      </Artboard>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement, 360);
    await expect(canvas.getByText(KIT_NOTICE)).toBeVisible();
  },
};
