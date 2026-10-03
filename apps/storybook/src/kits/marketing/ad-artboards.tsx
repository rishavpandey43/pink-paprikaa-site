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
  PriceTag,
  SocialHeadline,
} from "@pink-paprikaa-web/ui";

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
    <PostFrame format="story" surface="brand" padding="none" hasSafeArea={hasSafeArea} isFit>
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
          isCopyable={false}
          headline="50% off your first order"
          code="PAPRIKAA50"
          terms="One use per guest. Dine-in and pickup."
        />
        <LogoLockup color="inverse" size="lg" align="center" className="self-center" />
      </div>
    </PostFrame>
  );
}

/** 9:16 story — a dish, photo on top, copy below. */
export function DishStory({ hasSafeArea = false }: StoryArtboardProps) {
  return (
    <PostFrame format="story" surface="ink" padding="none" hasSafeArea={hasSafeArea} isFit>
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
            Charred paneer, burnt garlic rice, pickled slaw.
          </SocialHeadline>
          <PriceTag amount={420} size="canvas" color="inverse" />
          <LogoLockup color="inverse" size="md" className="mt-3" />
        </div>
      </div>
    </PostFrame>
  );
}

/** 1200×628 link preview / OG image. */
export function LinkBanner() {
  return (
    <PostFrame format="landscape" surface="soft" padding="tight" isFit>
      <div className="flex h-full items-center gap-12">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <SocialHeadline size="overline" as="p">
            {brand.tagline}
          </SocialHeadline>
          <SocialHeadline size="h2" as="h2">
            One kitchen. One grinder.
          </SocialHeadline>
          <LogoLockup color="brand" size="md" />
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
    <PostFrame format="leaderboard" surface="brand" padding="none" isFit>
      <PatternField tone="brand" tile={56} className="absolute inset-0" />
      <div className="relative flex h-full items-center gap-4.5 px-4.5">
        <Logo variant="wordmark" color="inverse" className="w-35 shrink-0" />
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
    <PostFrame format="mpu" surface="ink" padding="none" isFit>
      <PatternField tone="ink" tile={56} className="absolute inset-0" />
      <div className="relative flex h-full flex-col justify-between p-4.5">
        <Logo variant="wordmark" color="inverse" className="w-35" />
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
