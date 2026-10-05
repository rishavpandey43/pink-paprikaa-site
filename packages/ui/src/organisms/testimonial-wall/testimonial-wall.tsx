import type { ReactNode } from "react";

import type { BaseProps } from "../../lib/common-props";
import type { HeadingLevel } from "../../lib/heading";

import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";
import { ReviewCard, type ReviewCardProps } from "../../molecules/review-card/review-card";
import { SectionHeader } from "../../molecules/section-header/section-header";

const testimonialWall = componentVariants({
  slots: {
    root: "section-y",
    inner: "container-page flex flex-col gap-8",
    grid: "autogrid",
    item: "flex",
    card: "flex-1",
  },
});

export interface TestimonialWallProps extends Omit<BaseProps<"section">, "title"> {
  overline?: ReactNode;
  title: ReactNode;
  /** One sentence under the heading. */
  lede?: ReactNode;
  /** Real guest reviews only — three or six read best. */
  reviews: ReviewCardProps[];
  /** Surface each ReviewCard paints — `page` (default) or `brand`. */
  cardSurface?: "page" | "brand" | undefined;
  /** Prefer `cardSurface`. `"brand"` maps to `cardSurface="brand"`. Kept for callers until they migrate. */
  variant?: "default" | "brand" | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/** A grid of guest reviews under a section header, every card in the wall's card surface. */
export function TestimonialWall({
  overline,
  title,
  lede,
  reviews,
  cardSurface,
  variant = "default",
  headingLevel = 2,
  sx,
  className,
  ...props
}: TestimonialWallProps) {
  const slots = testimonialWall();
  const surface = cardSurface ?? (variant === "brand" ? "brand" : "page");
  return (
    <section className={slots.root({ className: withSx(sx, className) })} {...props}>
      <div className={slots.inner()}>
        <SectionHeader overline={overline} title={title} lede={lede} headingLevel={headingLevel} />
        <ul role="list" className={slots.grid()}>
          {reviews.map((review, index) => (
            <li key={index} className={slots.item()}>
              <ReviewCard
                {...review}
                surface={surface === "brand" ? "brand" : undefined}
                className={slots.card({ class: review.className })}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
