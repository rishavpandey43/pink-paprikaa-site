import { brand } from "@pink-paprikaa-web/content";
import {
  DietMark,
  Divider,
  ImageSlot,
  LogoLockup,
  OfferSeal,
  PatternField,
  PostFrame,
  PriceTag,
  SocialHeadline,
  SpiceLevel,
} from "@pink-paprikaa-web/ui";

import { token } from "../../docs-kit/catalogue";
import { OUTLET } from "../fixtures";

/** The canvas safe margin, read from its token (canvas tokens have no utility class). */
const CANVAS_PAD = `var(${token("canvas-pad").cssVar})`;

/** 1:1 offer post — flooded pink, the pattern, one cornered seal. */
export function OfferPost() {
  return (
    <PostFrame format="post" surface="brand" isFit>
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
    <PostFrame format="post" surface="page" padding="none" isFit>
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
            <PriceTag amount={220} size="canvas" />
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
    <PostFrame format="portrait" surface="ink" isFit>
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
    <PostFrame format="post" surface="alt" isFit>
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
            <PriceTag amount={280} size="canvas" />
            <SpiceLevel level={3} size="lg" />
          </div>
        </div>
      </div>
    </PostFrame>
  );
}
