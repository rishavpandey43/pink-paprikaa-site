import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, waitFor, within } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { Logo } from "../../atoms/logo/logo";
import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { SocialHeadline } from "../../atoms/social-headline/social-headline";
import { Text } from "../../atoms/text/text";
import { Stack } from "../stack/stack";
import { POST_FORMATS, type PostFormat } from "./post-formats";
import { PostFrame } from "./post-frame";

const FORMATS: PostFormat[] = [
  "post",
  "portrait",
  "story",
  "landscape",
  "wide",
  "mpu",
  "leaderboard",
];

function Caption({ children }: { children: string }) {
  return (
    <Text variant="mono" as="div" tone="subtle" className="pt-2">
      {children}
    </Text>
  );
}

/** The house look: flooded pink, the tiled diamond, overline + headline + signature. */
function OfferBoard() {
  return (
    <>
      <PatternField tone="brand" tile={96} className="absolute inset-0" />
      <div className="relative flex h-full flex-col justify-between">
        <SocialHeadline size="overline" as="p">
          Tonight Only
        </SocialHeadline>
        <SocialHeadline size="hero">Chai first, decisions later.</SocialHeadline>
        <Logo tone="white" className="w-65" />
      </div>
    </>
  );
}

/** The ink alternate, for statements. */
function StatementBoard() {
  return (
    <>
      <PatternField tone="ink" tile={96} className="absolute inset-0" />
      <div className="relative flex h-full flex-col justify-between">
        <SocialHeadline size="overline" as="p" className="text-text-brand">
          Since 2025
        </SocialHeadline>
        <SocialHeadline size="hero">Desi at heart. Urban by nature.</SocialHeadline>
        <Logo tone="white" className="w-60" />
      </div>
    </>
  );
}

const meta = {
  title: "Layouts/PostFrame",
  component: PostFrame,
  args: { format: "post", scale: 0.3, tone: "brand", children: <OfferBoard /> },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Every Instagram post, story, banner or OG image starts here — it fixes the exact pixel canvas so nothing is designed at an invented size. Children are authored at true canvas pixels (the canvas type scale through SocialHeadline, never screen sizes); the frame scales the whole board for preview with `scale`, or `isFit` to fit its parent's width (never above 1). `tone` is the board's one field colour: flooded `brand` (the house look), `ink` (statements), or the light product-led fields `soft` (pink-100), `alt` (pink-50) and `light` (white). `padding` defaults to the format's safe margin (72px on 1080 canvases, 48px on 1200×628, 20px on display ads). `hasSafeArea` draws the story chrome guides. Never design a marketing asset outside the seven `POST_FORMATS`.",
      },
    },
  },
} satisfies Meta<typeof PostFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Post: Story = {
  name: "post 1080×1080 · scale 0.2",
  render: () => (
    <div>
      <PostFrame format="post" scale={0.2} tone="brand">
        <OfferBoard />
      </PostFrame>
      <Caption>post 1080x1080</Caption>
    </div>
  ),
};

export const Portrait: Story = {
  name: "portrait 1080×1350 · scale 0.16",
  render: () => (
    <div>
      <PostFrame format="portrait" scale={0.16} tone="ink">
        <StatementBoard />
      </PostFrame>
      <Caption>portrait 1080x1350</Caption>
    </div>
  ),
};

export const StoryWithSafeArea: Story = {
  name: "story 1080×1920 · hasSafeArea",
  render: () => (
    <div>
      <PostFrame format="story" scale={0.115} tone="brand" hasSafeArea>
        <div className="flex h-full flex-col justify-center gap-10">
          <SocialHeadline size="overline" as="p">
            First Order
          </SocialHeadline>
          <SocialHeadline size="h1">Half off, on us.</SocialHeadline>
        </div>
      </PostFrame>
      <Caption>story 1080x1920 + hasSafeArea</Caption>
    </div>
  ),
};

export const Landscape: Story = {
  name: "landscape 1200×628 · the 48px default",
  render: () => (
    <div>
      <PostFrame format="landscape" scale={0.28} tone="soft">
        <div className="flex h-full flex-col justify-between">
          <SocialHeadline size="h2">One kitchen. One grinder.</SocialHeadline>
          <Logo className="w-50" />
        </div>
      </PostFrame>
      <Caption>landscape 1200x628</Caption>
    </div>
  ),
};

/** The 16:9 screen and menu board (dev parity). */
export const Wide: Story = {
  name: "wide 1920×1080 · scale 0.16",
  render: () => (
    <div>
      <PostFrame format="wide" scale={0.16} tone="ink">
        <div className="flex h-full flex-col justify-between">
          <SocialHeadline size="hero">100% vegetarian kitchen.</SocialHeadline>
          <Logo tone="white" className="w-65" />
        </div>
      </PostFrame>
      <Caption>wide 1920x1080</Caption>
    </div>
  ),
};

/** The dashed bands are where the platform's own chrome sits: keep type and logos out (dev parity). */
export const SafeAreaGuides: Story = {
  name: "story · hasSafeArea off and on",
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      {([false, true] as const).map((hasSafeArea) => (
        <div key={String(hasSafeArea)}>
          <PostFrame format="story" scale={0.16} tone="brand" hasSafeArea={hasSafeArea}>
            <div className="flex h-full flex-col justify-center gap-10">
              <SocialHeadline size="overline" as="p">
                First Order
              </SocialHeadline>
              <SocialHeadline size="h1">Half off, on us.</SocialHeadline>
            </div>
          </PostFrame>
          <Caption>{hasSafeArea ? "guides on · 250px top, 320px bottom" : "guides off"}</Caption>
        </div>
      ))}
    </div>
  ),
};

/** `padding`: default (the format's safe margin, 72px on a post) · tight 48px · none (dev parity). */
export const Padding: Story = {
  name: "padding — default · tight · none",
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      {(["default", "tight", "none"] as const).map((padding) => (
        <div key={padding}>
          <PostFrame format="post" scale={0.2} tone="brand" padding={padding}>
            <div className="size-full outline-2 -outline-offset-2 outline-border-default outline-dashed" />
          </PostFrame>
          <Caption>{`padding="${padding}"`}</Caption>
        </div>
      ))}
    </div>
  ),
};

/** The pink-50 board — light and product-led (the marketing kit's pink-50 feed post). */
export const AltBoard: Story = {
  name: 'post · tone="alt" (pink-50)',
  render: () => (
    <div>
      <PostFrame format="post" scale={0.2} tone="alt">
        <div className="flex h-full flex-col justify-between">
          <SocialHeadline size="overline" as="p" className="text-text-brand">
            New on the menu
          </SocialHeadline>
          <SocialHeadline size="h1">Masala Cold Brew.</SocialHeadline>
          <Logo className="w-60" />
        </div>
      </PostFrame>
      <Caption>post 1080x1080 · tone alt</Caption>
    </div>
  ),
};

export const Leaderboard: Story = {
  name: 'leaderboard 728×90 · padding="none"',
  render: () => (
    <div>
      <PostFrame format="leaderboard" scale={0.46} tone="brand" padding="none">
        <div className="flex h-full items-center gap-4 px-4">
          <Logo tone="white" className="w-21" />
          <Text variant="h4" as="span" weight="black" className="min-w-0 flex-1 truncate">
            50% off your first order
          </Text>
          <Button size="sm">Order Now</Button>
        </div>
      </PostFrame>
      <Caption>leaderboard 728x90</Caption>
    </div>
  ),
};

export const Mpu: Story = {
  name: 'mpu 300×250 · padding="none"',
  render: () => (
    <div>
      <PostFrame format="mpu" scale={0.6} tone="ink" padding="none">
        <div className="flex h-full flex-col justify-between p-4">
          <Logo tone="white" className="w-19" />
          <Text variant="h3" as="span" weight="black">
            Chai first, decisions later.
          </Text>
          <Button size="sm" isFullWidth>
            Order Now
          </Button>
        </div>
      </PostFrame>
      <Caption>mpu 300x250</Caption>
    </div>
  ),
};

/** The guideline card: the only seven canvases, all at one scale so their sizes compare. */
export const AllFormats: Story = {
  name: "POST_FORMATS — the seven canvases to scale",
  render: () => (
    <div className="flex flex-wrap items-end gap-4">
      {FORMATS.map((format) => {
        const { width, height, label } = POST_FORMATS[format];
        return (
          <div key={format}>
            <PostFrame format={format} scale={0.1} tone="brand" padding="none" />
            <Caption>{`${format} ${String(width)}x${String(height)} · ${label}`}</Caption>
          </div>
        );
      })}
    </div>
  ),
};

export const FitToParent: Story = {
  name: "isFit — scales to its parent's width",
  render: () => (
    <div className="max-w-120">
      <PostFrame format="post" isFit tone="brand">
        <OfferBoard />
      </PostFrame>
    </div>
  ),
};

/**
 * Review Focus 5: a fixed scale reserves exactly the scaled box, a fit frame fills its parent's
 * width at the canvas's own aspect ratio, and the true-pixel canvas never leaks into any layout.
 */
export const FitsItsParentAt360: Story = {
  name: "360px — a scaled board never overflows its parent",
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <Stack space={6}>
      <div data-testid="fixed-parent">
        <PostFrame data-testid="fixed" format="post" scale={0.25} tone="brand">
          <OfferBoard />
        </PostFrame>
      </div>
      <div data-testid="fit-parent" className="max-w-75">
        <PostFrame data-testid="fit" format="portrait" isFit tone="ink">
          <StatementBoard />
        </PostFrame>
      </div>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = (id: string) => canvas.getByTestId(id).getBoundingClientRect();
    const { width: postWidth, height: postHeight } = POST_FORMATS.post;
    const { width: portraitWidth, height: portraitHeight } = POST_FORMATS.portrait;

    await expect(box("fixed").width).toBeCloseTo(postWidth * 0.25, 0);
    await expect(box("fixed").height).toBeCloseTo(postHeight * 0.25, 0);

    const fitParent = canvas.getByTestId("fit-parent");
    await waitFor(async () => {
      await expect(box("fit").width).toBeCloseTo(fitParent.clientWidth, 0);
    });
    await expect(box("fit").height).toBeCloseTo(
      (fitParent.clientWidth * portraitHeight) / portraitWidth,
      0
    );

    for (const id of ["fixed-parent", "fit-parent"]) {
      const parent = canvas.getByTestId(id);
      await expect(parent.scrollWidth).toBe(parent.clientWidth);
    }
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};
