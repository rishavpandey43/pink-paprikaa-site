import { type ReactNode, useId } from "react";

import type { BaseProps } from "../../lib/common-props";

import { Link } from "../../atoms/link/link";
import { Typography } from "../../atoms/typography/typography";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { isShown } from "../../lib/is-shown";
import { withSx } from "../../lib/sx";
import { ReviewCard, type ReviewCardProps } from "../../molecules/review-card/review-card";
import { ReviewCarouselTrack } from "./review-carousel-track";

const reviewCarousel = componentVariants({
  slots: {
    root: "section-y",
    inner: "container-page flex flex-col gap-8",
    titles: "flex min-w-0 flex-col gap-3",
    eyebrow: "flex items-center gap-2",
    footer: "self-start",
  },
});

export interface ReviewCarouselProps extends Omit<BaseProps<"section">, "title"> {
  /** e.g. `<><Icon icon={BadgeCheck} size="sm" />4.6 on Google · 120 verified reviews</>`. */
  eyebrow?: ReactNode;
  heading: ReactNode;
  /** Real, verified reviews only. */
  reviews: ReviewCardProps[];
  footerLink?: { label: string; href: string; isExternal?: boolean | undefined } | undefined;
  /** Shown in place of the track when there are no reviews. */
  emptyState?: ReactNode;
  headingLevel?: HeadingLevel | undefined;
  previousLabel?: string | undefined;
  nextLabel?: string | undefined;
}

/**
 * Guest reviews in a horizontal scroll-snap track (handoff GoogleReviews): a focusable region
 * named by the heading, previous/next paging from the header row, an empty state when there
 * are none, and a link to all of them. Server-rendered; the track and controls are a client leaf.
 */
export function ReviewCarousel({
  eyebrow,
  heading,
  reviews,
  footerLink,
  emptyState,
  headingLevel = 2,
  previousLabel = "Previous reviews",
  nextLabel = "Next reviews",
  sx,
  className,
  ...props
}: ReviewCarouselProps) {
  const headingId = useId();
  const slots = reviewCarousel();
  const titles = (
    <div className={slots.titles()}>
      {isShown(eyebrow) ? (
        <Typography variant="overline" color="brand" className={slots.eyebrow()}>
          {eyebrow}
        </Typography>
      ) : null}
      <Typography
        as={headingTag(headingLevel)}
        id={headingId}
        variant="display-2"
        isFluid
        isBalanced
      >
        {heading}
      </Typography>
    </div>
  );
  return (
    <section className={slots.root({ className: withSx(sx, className) })} {...props}>
      <div className={slots.inner()}>
        {reviews.length === 0 ? (
          <>
            {titles}
            {emptyState}
          </>
        ) : (
          <ReviewCarouselTrack
            header={titles}
            labelledBy={headingId}
            previousLabel={previousLabel}
            nextLabel={nextLabel}
            hasControls={reviews.length > 1}
          >
            {reviews.map((review, index) => (
              <ReviewCard key={index} {...review} />
            ))}
          </ReviewCarouselTrack>
        )}
        {footerLink ? (
          <Link
            href={footerLink.href}
            isExternal={footerLink.isExternal}
            className={slots.footer()}
          >
            {footerLink.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
