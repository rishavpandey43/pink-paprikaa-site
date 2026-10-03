import type { ComponentProps, ReactNode } from "react";

import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { Typography } from "../../atoms/typography/typography";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { isShown } from "../../lib/is-shown";
import { SymbolMark } from "../../lib/symbol-mark";

const heroBanner = componentVariants({
  slots: {
    root: "relative",
    // A decorative layer only: the hero's own ground (or a caller's) shows through it.
    pattern: "absolute inset-0 bg-transparent",
    inner: "relative container-page grid items-center gap-hero-banner-gap py-hero-banner-y",
    copy: "flex min-w-0 flex-col gap-5",
    badges: "flex flex-wrap gap-2",
    actions: "flex flex-wrap gap-3",
    meta: "flex flex-wrap items-center gap-x-4.5 gap-y-2",
    metaItem: "flex items-center gap-4.5",
    metaMark: "size-3 opacity-80",
    media: "relative min-w-0",
  },
  variants: {
    tone: {
      // The diamond between meta facts: white on the dark fields, brand pink on the light ones.
      brand: { root: "bg-surface-brand", metaMark: "text-ink-000" },
      ink: { root: "bg-surface-inverse", metaMark: "text-ink-000" },
      soft: { root: "bg-surface-brand-soft", metaMark: "text-pink-500" },
      alt: { root: "bg-surface-page-alt", metaMark: "text-pink-500" },
    },
    layout: {
      split: { inner: "lg:grid-cols-2" },
      center: {
        inner: "justify-items-center text-center",
        copy: "max-w-article items-center",
        badges: "justify-center",
        actions: "justify-center",
        meta: "justify-center",
      },
    },
  },
  defaultVariants: { tone: "brand", layout: "split" },
});

type HeroTone = NonNullable<VariantProps<typeof heroBanner>["tone"]>;
type HeroPattern = "none" | "default" | "faint";

/** The surface each tone paints; `alt` is the handoff's pink-50 tint, a light surface. */
const SURFACE: Readonly<Record<HeroTone, "brand" | "ink" | "soft" | "light">> = {
  brand: "brand",
  ink: "ink",
  soft: "soft",
  alt: "light",
};

/** Flooded tones carry the diamond (design system); the alt tint is plain (handoff heroes). */
const DEFAULT_PATTERN: Readonly<Record<HeroTone, HeroPattern>> = {
  brand: "default",
  ink: "default",
  soft: "default",
  alt: "none",
};

export interface HeroBannerProps
  extends
    Omit<ComponentProps<"section">, "title">,
    Pick<VariantProps<typeof heroBanner>, "tone" | "layout"> {
  overline?: ReactNode;
  /** Badge row above the title (handoff): the product badge and the Pure Veg badge. */
  badges?: ReactNode;
  title: ReactNode;
  /** `display-2` for a long headline (handoff Catering). */
  titleSize?: "display-1" | "display-2" | undefined;
  headingLevel?: HeadingLevel | undefined;
  body?: ReactNode;
  /** One or two Buttons. */
  actions?: ReactNode;
  /** Short facts separated by the brand diamond, e.g. `["Est. 2025", "Sector 57, Gurgaon"]`. */
  meta?: ReactNode[] | undefined;
  /** The image column — an ImageSlot plus any overlay (an OfferSeal positions itself on it). */
  media?: ReactNode;
  /** Defaults to `default` on brand/ink/soft and `none` on alt. */
  pattern?: HeroPattern | undefined;
}

/** The top of a marketing page: headline (fluid display type, never overflows), actions, facts, media. */
export function HeroBanner({
  overline,
  badges,
  title,
  titleSize = "display-1",
  headingLevel = 1,
  body,
  actions,
  meta = [],
  media,
  tone = "brand",
  layout,
  pattern,
  className,
  ...props
}: HeroBannerProps) {
  const slots = heroBanner({ tone, layout });
  const density = pattern ?? DEFAULT_PATTERN[tone];
  const facts = meta.filter(isShown);
  return (
    <section data-surface={SURFACE[tone]} className={slots.root({ className })} {...props}>
      {density === "none" ? null : (
        <PatternField
          aria-hidden
          surface={SURFACE[tone] === "light" ? "page" : SURFACE[tone]}
          tile={86}
          density={density}
          className={slots.pattern()}
        />
      )}
      <div className={slots.inner()}>
        <div className={slots.copy()}>
          {isShown(badges) ? <div className={slots.badges()}>{badges}</div> : null}
          {isShown(overline) ? (
            <Typography variant="overline" color="brand">
              {overline}
            </Typography>
          ) : null}
          <Typography as={headingTag(headingLevel)} variant={titleSize} isFluid isBalanced>
            {title}
          </Typography>
          {isShown(body) ? (
            <Typography as="div" variant="body-lg" color="muted" measure="narrow">
              {body}
            </Typography>
          ) : null}
          {isShown(actions) ? <div className={slots.actions()}>{actions}</div> : null}
          {facts.length > 0 ? (
            <ul role="list" className={slots.meta()}>
              {facts.map((fact, index) => (
                <li key={index} className={slots.metaItem()}>
                  {index > 0 ? <SymbolMark className={slots.metaMark()} /> : null}
                  <Typography as="span" variant="body-sm" color="muted">
                    {fact}
                  </Typography>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {isShown(media) ? <div className={slots.media()}>{media}</div> : null}
      </div>
    </section>
  );
}
