import type { Meta, StoryObj } from "@storybook/react-vite";

import { PostFrame } from "./post-frame";

/** Canvas type is fixed, never fluid — an artboard has one width and it is 1080px. */
function CanvasCopy() {
  return (
    <div className="flex h-full flex-col justify-between">
      <p className="m-0 font-display text-canvas-overline tracking-overline text-text-on-brand uppercase">
        Tonight Only
      </p>
      <p className="m-0 max-w-[13ch] font-display text-canvas-hero leading-display1 font-extrabold text-text-on-brand">
        Chai first, decisions later.
      </p>
      <p className="m-0 font-display text-canvas-body font-bold text-text-on-brand">
        Pink Paprikaa · Sector 57, Gurgaon
      </p>
    </div>
  );
}

function Caption({ label }: { label: string }) {
  return <p className="mt-2 mb-0 font-body text-caption text-text-muted">{label}</p>;
}

const meta = {
  title: "Templates/PostFrame",
  component: PostFrame,
  args: { scale: 0.28, className: "bg-surface-brand", children: <CanvasCopy /> },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Every Instagram post, story, banner and OG image starts here — it pins the exact pixel " +
          "canvas from the `--canvas-*` tokens so no asset is designed at an invented size. " +
          "Children are authored at true canvas pixels using the `canvas-*` type steps; `scale` " +
          "only shrinks the preview.",
      },
    },
  },
} satisfies Meta<typeof PostFrame>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The seven canvases, side by side and to scale. Nothing else is a legal size. */
export const Canvases: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      <div>
        <PostFrame className="bg-surface-brand" variant="post" scale={0.2}>
          <CanvasCopy />
        </PostFrame>
        <Caption label="post — 1080x1080" />
      </div>
      <div>
        <PostFrame className="bg-surface-inverse" variant="portrait" scale={0.16}>
          <CanvasCopy />
        </PostFrame>
        <Caption label="portrait — 1080x1350" />
      </div>
      <div>
        <PostFrame className="bg-surface-brand" variant="story" hasSafeArea scale={0.115}>
          <CanvasCopy />
        </PostFrame>
        <Caption label="story — 1080x1920, safe areas on" />
      </div>
      <div className="grid gap-4">
        <div>
          <PostFrame className="bg-surface-brand-soft" variant="landscape" scale={0.28}>
            <p className="m-0 max-w-[16ch] font-display text-canvas-h2 font-extrabold text-text-heading">
              Six outlets. One kitchen.
            </p>
          </PostFrame>
          <Caption label="landscape — 1200x628" />
        </div>
        <div>
          <PostFrame className="bg-surface-brand" variant="leaderboard" scale={0.46}>
            <p className="m-0 truncate font-display text-[22px] font-extrabold text-text-on-brand">
              50% off your first order
            </p>
          </PostFrame>
          <Caption label="leaderboard — 728x90" />
        </div>
        <div>
          <PostFrame className="bg-surface-inverse" variant="mpu" scale={0.6}>
            <p className="m-0 font-display text-canvas-caption leading-h2 font-extrabold text-text-on-inverse">
              Chai first, decisions later.
            </p>
          </PostFrame>
          <Caption label="mpu — 300x250" />
        </div>
      </div>
      <div>
        <PostFrame className="bg-surface-inverse" variant="wide" scale={0.16}>
          <p className="m-0 max-w-[18ch] font-display text-canvas-h1 font-extrabold text-text-on-inverse">
            100% vegetarian kitchen.
          </p>
        </PostFrame>
        <Caption label="wide — 1920x1080" />
      </div>
    </div>
  ),
};

/** The dashed bands are where the app's own chrome sits. Keep type and logos out of them. */
export const StorySafeArea: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      <div>
        <PostFrame className="bg-surface-brand" variant="story" scale={0.16}>
          <CanvasCopy />
        </PostFrame>
        <Caption label="guides off" />
      </div>
      <div>
        <PostFrame className="bg-surface-brand" variant="story" hasSafeArea scale={0.16}>
          <CanvasCopy />
        </PostFrame>
        <Caption label="guides on — 250px top, 320px bottom" />
      </div>
    </div>
  ),
};

/** default 72px · tight 48px · none — the canvas gutter, and the display units' own step. */
export const Padding: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      {(["default", "tight", "none"] as const).map((padding) => (
        <div key={padding}>
          <PostFrame className="bg-surface-brand" padding={padding} scale={0.2}>
            <div className="size-full border-2 border-dashed border-glass-white" />
          </PostFrame>
          <Caption label={`padding=${padding}`} />
        </div>
      ))}
    </div>
  ),
};
