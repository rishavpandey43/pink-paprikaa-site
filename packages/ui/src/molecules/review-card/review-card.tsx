import type { ComponentPropsWithoutRef } from "react";

import { Avatar } from "../../atoms/avatar/avatar";
import { Card } from "../../atoms/card/card";
import { Rating } from "../../atoms/rating/rating";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const reviewCard = componentVariants({
  slots: {
    root: "grid gap-4",
    // `<blockquote>` carries a browser margin the grid gap already provides.
    quoteBlock: "m-0",
    quote: "",
    attribution: "flex min-w-0 items-center gap-3",
    // A grid rather than a stack of margins — the responsive contract bans per-child margins in a
    // row that can run out of room.
    identity: "grid min-w-0",
    name: "font-medium",
    meta: "",
  },
  variants: {
    /** `brand` is the pale-pink treatment a testimonial wall uses. */
    variant: {
      default: { name: "text-text-heading", meta: "text-text-subtle", quote: "text-text-body" },
      brand: { name: "text-text-brand", meta: "text-pink-400", quote: "text-text-brand" },
    },
  },
  defaultVariants: { variant: "default" },
});

/** The quote marks belong to the component — guest copy is stored and passed unquoted. */
const OPEN_QUOTE = "“";
const CLOSE_QUOTE = "”";

/** Which `Card` skin each treatment sits on. */
const CARD_VARIANT = { default: "default", brand: "feature" } as const;

export interface ReviewCardProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children">, VariantProps<typeof reviewCard> {
  /** The guest's name. It drives the avatar initials as well as the attribution line. */
  name: string;
  /**
   * The review itself, without quote marks. Never write one — every quote on the site is real
   * guest copy.
   */
  quote: string;
  /** Outlet and month under the name, e.g. "Sector 57 — March". */
  meta?: string | undefined;
  /** The score, out of five. Halves and any other fraction are honoured. */
  rating?: number | undefined;
  /** Guest photo. The initials stand in until it loads, and forever if it fails. */
  avatarSrc?: string | undefined;
  /**
   * The score mark. `diamond` is the default rotated square carrying the brand symbol; `symbol`
   * drops the square and shows the bare mark — the quieter treatment a testimonial wall uses.
   */
  mark?: "diamond" | "symbol" | undefined;
}

export function ReviewCard({
  avatarSrc,
  className,
  mark,
  meta,
  name,
  quote,
  rating,
  variant = "default",
  ...props
}: ReviewCardProps) {
  const parts = reviewCard({ variant });
  // `exactOptionalPropertyTypes` forbids handing an optional prop an explicit `undefined`, and
  // there is no sensible default photo — so the prop is either passed or absent.
  const photo = avatarSrc === undefined ? {} : { src: avatarSrc };
  return (
    <Card
      className={parts.root({ className })}
      padding="md"
      variant={CARD_VARIANT[variant]}
      {...props}
    >
      {rating === undefined ? null : (
        <Rating hasValueLabel={false} size="md" value={rating} variant={mark} />
      )}
      <blockquote className={parts.quoteBlock()}>
        <Text className={parts.quote()} measure="narrow" variant="body1">
          {`${OPEN_QUOTE}${quote}${CLOSE_QUOTE}`}
        </Text>
      </blockquote>
      <div className={parts.attribution()}>
        <Avatar name={name} size="sm" {...photo} />
        <div className={parts.identity()}>
          <Text as="span" className={parts.name()} variant="body2">
            {name}
          </Text>
          {meta === undefined ? null : (
            <Text as="span" className={parts.meta()} variant="caption">
              {meta}
            </Text>
          )}
        </div>
      </div>
    </Card>
  );
}
