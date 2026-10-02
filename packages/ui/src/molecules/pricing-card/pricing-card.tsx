import { Check } from "lucide-react";
import { type ComponentProps, createElement, type ReactNode } from "react";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { isShown } from "../../lib/is-shown";

type PricingCardVariant = "default" | "featured" | "flooded";

/** White cards are light islands; the flooded card is a brand field. */
const SURFACE_OF: Readonly<Record<PricingCardVariant, "light" | "brand">> = {
  default: "light",
  featured: "light",
  flooded: "brand",
};

const pricingCard = componentVariants({
  slots: {
    root: "relative flex h-full flex-col gap-3.5 rounded-xl p-pricing-card-pad",
    badge: "absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap",
    header: "flex flex-wrap items-center justify-between gap-2",
    // A long name wraps (anywhere, if it must) rather than widening the card.
    name: "min-w-0 font-display text-h4 font-black wrap-anywhere text-text-heading",
    priceRow: "m-0 flex max-w-none flex-wrap items-baseline gap-x-2 gap-y-1",
    price: "font-display text-pricing-card-price text-text-heading",
    unit: "text-body-sm text-text-muted",
    was: "text-body text-text-muted",
    blurb: "m-0 max-w-none text-body-sm text-text-body",
    points: "m-0 flex flex-1 flex-col",
    point:
      "flex items-start gap-2.5 border-t border-border-subtle py-2 text-body-sm text-text-body",
    pointIcon: "mt-0.5 text-text-brand",
    footer: "mt-auto flex flex-col gap-3.5",
    footnote: "m-0 max-w-none text-caption text-text-muted",
  },
  variants: {
    variant: {
      default: { root: "border border-border-subtle bg-surface-card shadow-1" },
      featured: { root: "border-2 border-border-brand bg-surface-card shadow-3" },
      flooded: { root: "bg-surface-brand shadow-4" },
    },
  },
});

export interface PricingCardProps extends Omit<ComponentProps<"article">, "title"> {
  name: ReactNode;
  /** A chip beside the name, e.g. "Launch price". */
  tag?: ReactNode | undefined;
  /** A marker centred on the card's top edge, e.g. "Our recommendation". */
  badge?: ReactNode | undefined;
  price: number;
  /** "a meal", "a head", "/head". */
  unit: string;
  /** The struck regular price; must be above `price` (`RangeError` otherwise, like PriceTag). */
  was?: number | undefined;
  blurb?: ReactNode | undefined;
  /** What the plate includes; each gets a tick. */
  points?: ReactNode[] | undefined;
  footnote?: ReactNode | undefined;
  action?: ReactNode | undefined;
  /** An ImageSlot above the name (Catering dawats). */
  media?: ReactNode | undefined;
  variant?: PricingCardVariant | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/** A plate, dawat or office plan with its price per unit — Home, Homely Meals, Catering, Office. */
export function PricingCard({
  name,
  tag,
  badge,
  price,
  unit,
  was,
  blurb,
  points,
  footnote,
  action,
  media,
  variant = "default",
  headingLevel = 3,
  className,
  ...props
}: PricingCardProps) {
  if (was !== undefined && was <= price) {
    throw new RangeError(
      `PricingCard: was (${String(was)}) must be more than the price it strikes through (${String(price)})`
    );
  }
  const styles = pricingCard({ variant });

  return (
    <article data-surface={SURFACE_OF[variant]} className={styles.root({ className })} {...props}>
      {isShown(badge) ? <div className={styles.badge()}>{badge}</div> : null}
      {media}
      <div className={styles.header()}>
        {/* createElement, not `const Heading = headingTag(…)` (R83): the React Compiler lint reads a
            capitalised call result as a component created during render. */}
        {createElement(headingTag(headingLevel), { className: styles.name() }, name)}
        {tag}
      </div>
      <p className={styles.priceRow()}>
        <span className={styles.price()}>{formatRupees(price)}</span>
        <span className={styles.unit()}>{unit}</span>
        {was === undefined ? null : (
          <s className={styles.was()}>
            {/* PriceTag's hidden word, lower-case (R94). */}
            <span className="sr-only">was </span>
            {formatRupees(was)}
          </s>
        )}
      </p>
      {isShown(blurb) ? <p className={styles.blurb()}>{blurb}</p> : null}
      {points && points.length > 0 ? (
        // Safari/VoiceOver drops list semantics from a list-style:none list; the role restores them.
        <ul role="list" className={styles.points()}>
          {points.map((point, index) => (
            <li key={index} className={styles.point()}>
              <Icon icon={Check} size="sm" className={styles.pointIcon()} />
              {point}
            </li>
          ))}
        </ul>
      ) : null}
      {isShown(footnote) || isShown(action) ? (
        <div className={styles.footer()}>
          {isShown(footnote) ? <p className={styles.footnote()}>{footnote}</p> : null}
          {action}
        </div>
      ) : null}
    </article>
  );
}
