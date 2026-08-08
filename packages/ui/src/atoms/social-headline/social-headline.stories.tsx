import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";

import { SocialHeadline } from "./social-headline";

const meta = {
  title: "Atoms/SocialHeadline",
  component: SocialHeadline,
  args: { children: "Masala Cold Brew" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Type for marketing canvases, sized in canvas pixels rather than screen ones — a 1080px " +
          "artboard set in `text-h1` reads as fine print. Keep headlines to six words or fewer so " +
          "balanced wrapping has something to work with.",
      },
    },
  },
} satisfies Meta<typeof SocialHeadline>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Canvas type is huge by design, so the specimens below are shown at half scale. */
function Artboard({ children, className }: { children: ReactNode; className: string }) {
  return (
    <div className={className}>
      <div className="w-[200%] origin-top-left scale-50">{children}</div>
    </div>
  );
}

export const Default: Story = {
  render: (args) => (
    <Artboard className="h-30 overflow-hidden">
      <SocialHeadline {...args} on="light" />
    </Artboard>
  ),
};

export const Ramp: Story = {
  render: (args) => (
    <Artboard className="h-110 overflow-hidden">
      <SocialHeadline {...args} on="light" size="overline">
        Tonight Only
      </SocialHeadline>
      <SocialHeadline {...args} measure="narrow" on="light" size="hero">
        Chai first, decisions later.
      </SocialHeadline>
      <SocialHeadline {...args} on="light" size="h1">
        Masala Cold Brew
      </SocialHeadline>
      <SocialHeadline {...args} on="light" size="h2">
        One kitchen, six counters.
      </SocialHeadline>
      <SocialHeadline {...args} on="light" size="body">
        Cold brew, jaggery, cardamom · ₹180
      </SocialHeadline>
      <SocialHeadline {...args} on="light" size="caption">
        Sector 57, Gurgaon · 8am – 11:30pm
      </SocialHeadline>
    </Artboard>
  ),
};

/** The four grounds a canvas is allowed to sit on. */
export const Grounds: Story = {
  render: (args) => (
    <div className="grid gap-4">
      <Artboard className="h-[130px] overflow-hidden bg-surface-brand p-6">
        <SocialHeadline {...args} on="brand" size="h2">
          Flooded pink
        </SocialHeadline>
        <SocialHeadline {...args} on="brand" size="caption">
          Running text steps back to 88% white.
        </SocialHeadline>
      </Artboard>
      <Artboard className="h-20 overflow-hidden bg-surface-inverse p-6">
        <SocialHeadline {...args} on="ink" size="h2">
          Flooded ink
        </SocialHeadline>
      </Artboard>
      <Artboard className="h-20 overflow-hidden bg-surface-brand-soft p-6">
        <SocialHeadline {...args} on="soft" size="h2">
          Soft pink
        </SocialHeadline>
      </Artboard>
      <Artboard className="h-20 overflow-hidden bg-surface-card p-6">
        <SocialHeadline {...args} on="light" size="h2">
          White
        </SocialHeadline>
      </Artboard>
    </div>
  ),
};

export const Alignment: Story = {
  render: (args) => (
    <Artboard className="h-55 overflow-hidden">
      <SocialHeadline {...args} align="start" on="light" size="h2">
        Start
      </SocialHeadline>
      <SocialHeadline {...args} align="center" on="light" size="h2">
        Center
      </SocialHeadline>
      <SocialHeadline {...args} align="end" on="light" size="h2">
        End
      </SocialHeadline>
    </Artboard>
  ),
};

/** A whole 1080 x 1080 post, shown at half scale — how the ramp is actually used. */
export const OnACanvas: Story = {
  globals: { backgrounds: { value: "brand" } },
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <div className="size-[540px] overflow-hidden">
      <div className="h-(--canvas-post-h) w-(--canvas-post-w) origin-top-left scale-50 bg-surface-brand p-(--canvas-pad)">
        <SocialHeadline {...args} size="overline">
          Tonight Only
        </SocialHeadline>
        <SocialHeadline {...args} className="mt-8" measure="narrow" size="hero">
          Chai first, decisions later.
        </SocialHeadline>
        <SocialHeadline {...args} className="mt-8" size="body">
          Kadak chai and hot momos · ₹180–₹320
        </SocialHeadline>
      </div>
    </div>
  ),
};
