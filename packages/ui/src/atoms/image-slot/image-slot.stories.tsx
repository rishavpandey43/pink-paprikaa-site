import type { Meta, StoryObj } from "@storybook/react-vite";

import { Text } from "../text/text";
import { ImageSlot } from "./image-slot";

const meta = {
  title: "Atoms/ImageSlot",
  component: ImageSlot,
  args: { label: "Dish photo 4:3, warm, close-cropped" },
  parameters: { layout: "padded" },
} satisfies Meta<typeof ImageSlot>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-60">
      <ImageSlot {...args} />
    </div>
  ),
};

/** The box holds its crop open whether or not a photograph exists, so nothing around it reflows. */
export const Ratios: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-3">
      <div className="w-24">
        <ImageSlot {...args} label="1:1" ratio="square" />
      </div>
      <div className="w-30">
        <ImageSlot {...args} label="4:3" ratio="4:3" />
      </div>
      <div className="w-20">
        <ImageSlot {...args} label="3:4" ratio="3:4" />
      </div>
      <div className="w-20">
        <ImageSlot {...args} label="4:5" ratio="4:5" />
      </div>
      <div className="w-38">
        <ImageSlot {...args} label="16:9" ratio="16:9" />
      </div>
      <div className="w-38">
        <ImageSlot {...args} label="21:9" ratio="wide" />
      </div>
    </div>
  ),
};

/** `soft` on white, `strong` on a pink-tinted section, `ink` on a dark panel. */
export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-3">
      <div className="w-30">
        <ImageSlot {...args} label="soft" tone="soft" />
      </div>
      <div className="w-30">
        <ImageSlot {...args} label="strong" tone="strong" />
      </div>
      <div className="w-30">
        <ImageSlot {...args} label="ink" tone="ink" />
      </div>
    </div>
  ),
};

/** Thumbnails round at 10px, cards at 16px, full-bleed panels at 24px. */
export const Radii: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-3">
      <div className="w-30">
        <ImageSlot {...args} label="none" radius="none" />
      </div>
      <div className="w-30">
        <ImageSlot {...args} label="thumb" radius="thumb" />
      </div>
      <div className="w-30">
        <ImageSlot {...args} label="card" radius="card" />
      </div>
      <div className="w-30">
        <ImageSlot {...args} label="sheet" radius="sheet" />
      </div>
    </div>
  ),
};

/**
 * No brand photography exists yet, so every slot names the crop it is waiting for. "Dish photo" is
 * the fallback; a real brief is what a photographer can act on.
 */
export const NamingTheCrop: Story = {
  render: (args) => (
    <div className="flex max-w-100 flex-col gap-4">
      <ImageSlot {...args} label="Hero 16:9, steam visible, shot at the pass" ratio="16:9" />
      <ImageSlot {...args} label="Counter portrait 3:4, morning light" ratio="3:4" />
    </div>
  ),
};

/** `isFullHeight` drops the ratio and takes the parent's height instead — for full-bleed panels. */
export const FullHeight: Story = {
  render: (args) => (
    <div className="flex h-60 w-full max-w-100 gap-3">
      <div className="flex-1">
        <ImageSlot {...args} isFullHeight label="Full-bleed panel, any height" />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-2">
        <Text variant="h3">Dine in at Sector 57</Text>
        <Text variant="body2" tone="muted">
          The AC dining room sits behind the front counter, open through the day.
        </Text>
      </div>
    </div>
  ),
};
