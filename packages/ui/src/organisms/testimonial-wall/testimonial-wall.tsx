import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { componentVariants } from "../../lib/component-variants";
import { ReviewCard } from "../../molecules/review-card/review-card";
import {
  SectionHeader,
  type SectionHeaderProps,
} from "../../molecules/section-header/section-header";

const testimonialWall = componentVariants({
  slots: {
    // The section owns the page frame itself — it is one band of cards, not a flooded panel, so
    // it carries no ground of its own and the cards supply the only second colour.
    root: [
      "mx-auto w-full max-w-(--layout-container-max)",
      "px-(--layout-gutter-fluid) py-(--layout-section-y-fluid)",
    ],
    // `min(280px,100%)` keeps a long quote from widening its own track past a 360px screen.
    grid: [
      "mt-8 grid gap-(--layout-gap-grid)",
      "grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))]",
    ],
  },
});

export interface WallReview {
  /** The guest's name. It drives the avatar initials as well as the attribution line. */
  name: string;
  /** The review, unquoted — the quote marks belong to `ReviewCard`. Real guest copy only. */
  quote: string;
  /** Outlet and month under the name, e.g. "Sector 57 — March". */
  meta?: string;
  /** The score, out of five. Halves and any other fraction are honoured. */
  rating?: number;
  /** Guest photo. The initials stand in until it loads, and forever if it fails. */
  avatarSrc?: string;
}

export interface TestimonialWallProps extends Omit<
  ComponentPropsWithoutRef<"section">,
  "children" | "title"
> {
  /** ALL CAPS eyebrow naming the section — "Guests", "Reviews". */
  overline?: string | undefined;
  /** The section heading. */
  title: ReactNode;
  /** One-sentence lede under the heading. */
  lede?: string | undefined;
  /** Three or six reviews read best: the grid balances, and a wall of two looks unfinished. */
  reviews: WallReview[];
  /**
   * `brand` floods every card pale pink — the wall's usual treatment, and the second of the two
   * colours the composition is allowed. `default` is the white card, for a page already on pink.
   */
  variant?: "default" | "brand" | undefined;
  /** Where the section heading sits in the document outline. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
}

export function TestimonialWall({
  className,
  headingLevel = 2,
  lede,
  overline,
  reviews,
  title,
  variant = "brand",
  ...props
}: TestimonialWallProps) {
  const parts = testimonialWall();

  // `exactOptionalPropertyTypes` forbids handing an optional prop an explicit `undefined`.
  const headerProps: Pick<SectionHeaderProps, "lede" | "overline"> = {};
  if (overline !== undefined) headerProps.overline = overline;
  if (lede !== undefined) headerProps.lede = lede;

  return (
    <section className={parts.root({ className })} {...props}>
      <SectionHeader headingLevel={headingLevel} title={title} {...headerProps} />
      <div className={parts.grid()}>
        {reviews.map(({ avatarSrc, meta, name, quote, rating }) => (
          <ReviewCard
            key={name}
            // The bare symbol rather than the diamond: several scores at once, and the quieter
            // mark keeps the wall from reading as a row of badges.
            mark="symbol"
            name={name}
            quote={quote}
            variant={variant}
            {...(avatarSrc === undefined ? {} : { avatarSrc })}
            {...(meta === undefined ? {} : { meta })}
            {...(rating === undefined ? {} : { rating })}
          />
        ))}
      </div>
    </section>
  );
}
