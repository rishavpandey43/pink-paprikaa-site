import type { ComponentProps } from "react";

import { BadgeCheck } from "lucide-react";

import { Avatar } from "../../atoms/avatar/avatar";
import { Badge } from "../../atoms/badge/badge";
import { Card } from "../../atoms/card/card";
import { Link } from "../../atoms/link/link";
import { Rating } from "../../atoms/rating/rating";
import { componentVariants } from "../../lib/component-variants";

const reviewCard = componentVariants({
  slots: {
    root: "flex flex-col gap-3.5",
    header: "flex flex-wrap items-center justify-between gap-3",
    quote: "m-0",
    quoteText: "m-0 max-w-text-measure-narrow text-body",
    footer: "flex items-center gap-2.5",
    person: "grid min-w-0 flex-1",
    name: "text-body-sm font-medium text-text-heading",
    meta: "text-caption",
    source: "shrink-0",
  },
  variants: {
    variant: {
      default: { quoteText: "text-text-body", meta: "text-text-subtle" },
      // Feature card (soft surface): heading → pink-800, brand → pink-700.
      brand: { quoteText: "text-text-heading", meta: "text-text-brand" },
    },
  },
});

export interface ReviewCardProps extends ComponentProps<"figure"> {
  name: string;
  /** Outlet and date, or the source: "Restaurant · Google review". */
  meta?: string | undefined;
  /** The review text without quote marks — the component adds them. Real guest copy only. */
  quote: string;
  rating?: number | undefined;
  /** Avatar image URL; without it the Avatar shows initials. */
  avatar?: string | undefined;
  variant?: "default" | "brand" | undefined;
  /** Score glyph: brand diamonds carrying the mark, or the bare mark. */
  mark?: "diamond" | "symbol" | undefined;
  isVerified?: boolean | undefined;
  /** Words on the verified chip. Default "Verified on Google". */
  verifiedLabel?: string | undefined;
  /** Link to the review where it was published. */
  source?: { label: string; href: string } | undefined;
  hasAvatar?: boolean | undefined;
}

/** A real guest review. Never invented copy: the fixtures are the verified Google reviews. */
export function ReviewCard({
  name,
  meta,
  quote,
  rating,
  avatar,
  variant = "default",
  mark = "diamond",
  isVerified = false,
  verifiedLabel = "Verified on Google",
  source,
  hasAvatar = true,
  className,
  ...props
}: ReviewCardProps) {
  const styles = reviewCard({ variant });
  const hasHeader = rating !== undefined || isVerified;

  return (
    <Card
      asChild
      variant={variant === "brand" ? "feature" : "default"}
      padding="md"
      className={styles.root({ className })}
    >
      <figure {...props}>
        {hasHeader ? (
          <div className={styles.header()}>
            {rating === undefined ? null : <Rating value={rating} variant={mark} />}
            {isVerified ? (
              <Badge color="success" icon={BadgeCheck}>
                {verifiedLabel}
              </Badge>
            ) : null}
          </div>
        ) : null}
        <blockquote className={styles.quote()}>
          <p className={styles.quoteText()}>{`“${quote}”`}</p>
        </blockquote>
        <figcaption className={styles.footer()}>
          {hasAvatar ? <Avatar name={name} src={avatar} size="sm" aria-hidden /> : null}
          <span className={styles.person()}>
            <span className={styles.name()}>{name}</span>
            {meta ? <span className={styles.meta()}>{meta}</span> : null}
          </span>
          {source ? (
            <Link href={source.href} variant="link-sm" isExternal className={styles.source()}>
              {source.label}
            </Link>
          ) : null}
        </figcaption>
      </figure>
    </Card>
  );
}
