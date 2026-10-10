### Task 12: The Marketing kit

Sources: `ui_kits/marketing/{index.html,FeedArtboards.jsx,AdArtboards.jsx,README.md}`. Facts bound: the statement board's "Since …" and hero line (`brand.established`, `brand.statement`), its veg line (`brand.vegStatement` — the invented "18 spices" clause is dropped), the outlet name, the tagline. Campaign copy (offers, promo code) stays the kit's sample copy under the notice.

**Files:**

- Create: `apps/storybook/src/kits/marketing/{artboard.tsx,feed-artboards.tsx,ad-artboards.tsx,feed.stories.tsx,ads.stories.tsx}`

**Dev reference:** none (dev has no reference kits)

**Interfaces:**

- Consumes: `POST_FORMATS`, `PostFrame` (tones incl. Plan 2c's `alt`), `PatternField`, `SocialHeadline`, `LogoLockup`, `Logo`, `OfferSeal`, `CouponTicket`, `DietMark`, `SpiceLevel`, `ImageSlot`, `Divider`, `Button` (ui); `token` (docs-kit); `formatRupees`.
- Produces: `Artboard`; `OfferPost`, `DishLaunchPost`, `StatementPost`, `CarouselSlide`; `OfferStory`, `DishStory` (`hasSafeArea`), `LinkBanner`, `Leaderboard`, `Mpu`; stories `Marketing/Kit/Feed` → four boards + `Feed360`; `Marketing/Kit/Ads` → five boards + `Ads360`.

- [ ] **Step 1: Write the failing kit stories (Review Focus 3)**

Create `apps/storybook/src/kits/marketing/feed.stories.tsx`:

```tsx
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
```

Create `apps/storybook/src/kits/marketing/ads.stories.tsx`:

```tsx
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
```

Run: `pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- kits/marketing 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./artboard"`.

- [ ] **Step 2: The artboard frame**

Create `apps/storybook/src/kits/marketing/artboard.tsx`:

```tsx
import type { ReactNode } from "react";

import { POST_FORMATS, type PostFormat } from "@pink-paprikaa-web/ui";

export interface ArtboardProps {
  format: PostFormat;
  /** The preview's maximum width — a spacing-scale `max-w-*`, so it shrinks to fit a phone. */
  className: string;
  children: ReactNode;
}

/** A board on its preview card, captioned with the true canvas it is authored at. */
export function Artboard({ format, className, children }: ArtboardProps) {
  const { width, height, label } = POST_FORMATS[format];
  return (
    <figure
      className={`flex w-full flex-col gap-2.5 rounded-lg bg-surface-card p-3 shadow-1 ${className}`}
    >
      {children}
      <figcaption className="font-mono text-mono text-text-subtle uppercase">
        {label} · {width}×{height}
      </figcaption>
    </figure>
  );
}
```

- [ ] **Step 3: The feed artboards**

Create `apps/storybook/src/kits/marketing/feed-artboards.tsx`:

```tsx
import { brand } from "@pink-paprikaa-web/content";
import {
  DietMark,
  Divider,
  ImageSlot,
  LogoLockup,
  OfferSeal,
  PatternField,
  PostFrame,
  SocialHeadline,
  SpiceLevel,
} from "@pink-paprikaa-web/ui";
import { formatRupees } from "@pink-paprikaa-web/utils";

import { token } from "../../docs-kit/catalogue";
import { OUTLET } from "../fixtures";

/** The canvas safe margin, read from its token (canvas tokens have no utility class). */
const CANVAS_PAD = `var(${token("canvas-pad").cssVar})`;

/** 1:1 offer post — flooded pink, the pattern, one cornered seal. */
export function OfferPost() {
  return (
    <PostFrame format="post" tone="brand" isFit>
      <PatternField tone="brand" tile={96} className="absolute inset-0" />
      <div className="relative flex h-full flex-col justify-between">
        <SocialHeadline size="overline" as="p">
          Tonight Only
        </SocialHeadline>
        <SocialHeadline size="hero" measure="tight" as="h2">
          Masala Fries, half price.
        </SocialHeadline>
        <div className="flex items-end justify-between gap-10">
          <LogoLockup tone="white" size="lg" />
          <SocialHeadline size="caption" measure="tight" align="end" as="p">
            {`Dine-in and pickup. At our ${OUTLET.name} café.`}
          </SocialHeadline>
        </div>
      </div>
      <OfferSeal value="50%" label="Off" size="xl" corner="top-right" bleed="md" />
    </PostFrame>
  );
}

/** 1:1 dish launch — photo half, copy half. */
export function DishLaunchPost() {
  return (
    <PostFrame format="post" tone="light" padding="none" isFit>
      <div className="flex h-full flex-col">
        <ImageSlot ratio="16:9" radius="none" label="Dish photo 16:9" />
        <div className="flex flex-1 flex-col justify-between" style={{ padding: CANVAS_PAD }}>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-5">
              <DietMark size="lg" />
              <SocialHeadline size="overline" as="p">
                New On The Menu
              </SocialHeadline>
            </div>
            <SocialHeadline size="h1" as="h2">
              Masala Cold Brew
            </SocialHeadline>
            <SocialHeadline size="body" measure="wide" as="p">
              Cold brew, jaggery, cardamom. Served over one big cube.
            </SocialHeadline>
          </div>
          <div className="flex items-end justify-between">
            <SocialHeadline size="h2" as="p">
              {formatRupees(220)}
            </SocialHeadline>
            <LogoLockup tone="pink" size="sm" />
          </div>
        </div>
      </div>
    </PostFrame>
  );
}

/** 4:5 statement post — the brand's loudest format, on ink. */
export function StatementPost() {
  return (
    <PostFrame format="portrait" tone="ink" isFit>
      <PatternField tone="ink" tile={96} className="absolute inset-0" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex flex-col gap-10">
          <SocialHeadline size="overline" as="p">
            {`Since ${String(brand.established)}`}
          </SocialHeadline>
          <SocialHeadline size="hero" measure="tight" as="h2">
            {brand.statement}
          </SocialHeadline>
        </div>
        <div className="flex flex-col gap-7">
          <Divider />
          <div className="flex items-end justify-between gap-8">
            <SocialHeadline size="body" measure="wide" as="p">
              {brand.vegStatement}
            </SocialHeadline>
            <LogoLockup tone="white" size="md" />
          </div>
        </div>
      </div>
    </PostFrame>
  );
}

/** 1:1 carousel slide — one dish per slide, the index top-right. */
export function CarouselSlide() {
  return (
    <PostFrame format="post" tone="alt" isFit>
      <div className="flex h-full flex-col gap-10">
        <div className="flex items-center justify-between">
          <SocialHeadline size="overline" as="p">
            Small Plates
          </SocialHeadline>
          <span className="font-mono text-canvas-caption text-text-brand">2/5</span>
        </div>
        <ImageSlot ratio="16:9" radius="xl" label="Dish photo 16:9" />
        <div className="flex flex-col gap-5.5">
          <SocialHeadline size="h2" as="h2">
            Paprikaa Chilli Paneer
          </SocialHeadline>
          <div className="flex items-center gap-7">
            <SocialHeadline size="body" as="p">
              {formatRupees(280)}
            </SocialHeadline>
            <SpiceLevel level={3} size="lg" />
          </div>
        </div>
      </div>
    </PostFrame>
  );
}
```

- [ ] **Step 4: The story and ad artboards**

Create `apps/storybook/src/kits/marketing/ad-artboards.tsx`:

```tsx
import { brand } from "@pink-paprikaa-web/content";
import {
  Button,
  CouponTicket,
  Divider,
  ImageSlot,
  Logo,
  LogoLockup,
  OfferSeal,
  PatternField,
  PostFrame,
  SocialHeadline,
} from "@pink-paprikaa-web/ui";
import { formatRupees } from "@pink-paprikaa-web/utils";

import { token } from "../../docs-kit/catalogue";

const CANVAS_PAD = `var(${token("canvas-pad").cssVar})`;
const STORY_SAFE_TOP = `var(${token("canvas-story-safe-top").cssVar})`;
const STORY_SAFE_BOTTOM = `var(${token("canvas-story-safe-bottom").cssVar})`;

export interface StoryArtboardProps {
  /** Show the platform-chrome safe area guides. */
  hasSafeArea?: boolean | undefined;
}

/** 9:16 story — the offer with a coupon stub, inside the chrome safe area. */
export function OfferStory({ hasSafeArea = false }: StoryArtboardProps) {
  return (
    <PostFrame format="story" tone="brand" padding="none" hasSafeArea={hasSafeArea} isFit>
      <PatternField tone="brand" tile={96} className="absolute inset-0" />
      <div
        className="relative flex h-full flex-col justify-between"
        style={{ padding: `${STORY_SAFE_TOP} ${CANVAS_PAD} ${STORY_SAFE_BOTTOM}` }}
      >
        <div className="flex flex-col gap-8">
          <SocialHeadline size="overline" as="p">
            First Order
          </SocialHeadline>
          <SocialHeadline size="hero" measure="tight" as="h2">
            Half off, on us.
          </SocialHeadline>
        </div>
        <CouponTicket
          tone="light"
          size="lg"
          notch="brand"
          headline="50% off your first order"
          code="PAPRIKAA50"
          terms="One use per guest. Dine-in and pickup."
        />
        <LogoLockup tone="white" size="lg" align="center" className="self-center" />
      </div>
    </PostFrame>
  );
}

/** 9:16 story — a dish, photo on top, copy below. */
export function DishStory({ hasSafeArea = false }: StoryArtboardProps) {
  return (
    <PostFrame format="story" tone="ink" padding="none" hasSafeArea={hasSafeArea} isFit>
      <div className="flex h-full flex-col">
        <ImageSlot ratio="square" radius="none" tone="soft" label="Dish photo 1:1" />
        <div
          className="flex flex-1 flex-col gap-7 pt-14"
          style={{ paddingInline: CANVAS_PAD, paddingBottom: STORY_SAFE_BOTTOM }}
        >
          <SocialHeadline size="overline" as="p">
            On The Tandoor
          </SocialHeadline>
          <SocialHeadline size="h1" measure="tight" as="h2">
            Tandoori Paneer Bowl
          </SocialHeadline>
          <SocialHeadline size="body" measure="wide" as="p">
            {`Charred paneer, burnt garlic rice, pickled slaw. ${formatRupees(420)}.`}
          </SocialHeadline>
          <LogoLockup tone="white" size="md" className="mt-3" />
        </div>
      </div>
    </PostFrame>
  );
}

/** 1200×628 link preview / OG image. */
export function LinkBanner() {
  return (
    <PostFrame format="landscape" tone="soft" padding="tight" isFit>
      <div className="flex h-full items-center gap-12">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <SocialHeadline size="overline" as="p">
            {brand.tagline}
          </SocialHeadline>
          <SocialHeadline size="h2" as="h2">
            One kitchen. One grinder.
          </SocialHeadline>
          <LogoLockup tone="pink" size="md" />
        </div>
        <div className="h-full">
          <ImageSlot
            ratio="3:4"
            radius="xl"
            tone="strong"
            label="Photo 3:4"
            className="h-full w-auto"
          />
        </div>
      </div>
    </PostFrame>
  );
}

/** 728×90 leaderboard — mark, one line, one button. */
export function Leaderboard() {
  return (
    <PostFrame format="leaderboard" tone="brand" padding="none" isFit>
      <PatternField tone="brand" tile={56} className="absolute inset-0" />
      <div className="relative flex h-full items-center gap-4.5 px-4.5">
        <Logo variant="wordmark" tone="white" className="w-35 shrink-0" />
        <Divider orientation="vertical" className="h-10" />
        <SocialHeadline size="caption" as="p" className="min-w-0 flex-1 truncate">
          50% off your first order
        </SocialHeadline>
        <Button size="sm" asChild>
          <a href="#order">Order Now</a>
        </Button>
      </div>
    </PostFrame>
  );
}

/** 300×250 MPU — mark, one line, one button, one seal. */
export function Mpu() {
  return (
    <PostFrame format="mpu" tone="ink" padding="none" isFit>
      <PatternField tone="ink" tile={56} className="absolute inset-0" />
      <div className="relative flex h-full flex-col justify-between p-4.5">
        <Logo variant="wordmark" tone="white" className="w-35" />
        <SocialHeadline size="caption" as="p">
          Chai first, decisions later.
        </SocialHeadline>
        <Button size="sm" isFullWidth asChild>
          <a href="#order">Order Now</a>
        </Button>
      </div>
      <OfferSeal value="50%" label="Off" size="sm" corner="top-right" bleed="md" />
    </PostFrame>
  );
}
```

- [ ] **Step 5: Run to green, probe, gate and commit**

Run the Step 1 command → PASS (11 stories). Probe (Review Focus 3): in `Feed360`, change the first `Artboard` class to `max-w-150` **and** remove `isFit` from `OfferPost`'s `PostFrame`; expect FAIL `the page is 1…px wide`; revert both. Paste both.

Compare every board with the source kit (`/ui_kits/marketing/index.html` on the Task 10 `serve`; Feed, Stories and Ads tabs); list any difference with its reason (expected: only the kit's 220px lockups, now the 240px `md` step — V4).

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- kits/marketing 2>&1 | tail -10
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check
git add apps/storybook/src/kits/marketing
git commit -m "feat(storybook): the Marketing reference kit

Feed boards (offer, dish launch, statement, carousel) and story and ad boards
(offer and dish stories, link preview, leaderboard, MPU), each authored inside
PostFrame at its true canvas and fitted for preview, signed with the lockup or
the wordmark. Statement facts come from the brand module. Tested at 360px.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

