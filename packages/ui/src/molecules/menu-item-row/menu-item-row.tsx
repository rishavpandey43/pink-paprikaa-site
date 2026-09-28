import { type ComponentProps, createElement, type ReactNode } from "react";

import { Badge } from "../../atoms/badge/badge";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { PriceTag } from "../../atoms/price-tag/price-tag";
import { SpiceLevel } from "../../atoms/spice-level/spice-level";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";

/** A dish photograph from the image pipeline. Omit it and a labelled placeholder shows instead. */
export interface MenuItemImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const menuItemRow = componentVariants({
  slots: {
    root: "flex items-start gap-5 py-5",
    body: "min-w-0 flex-1",
    header: "flex flex-wrap items-center gap-2",
    name: "font-display text-menu-item-name text-text-heading",
    nameDevanagari: "font-devanagari text-menu-item-devanagari text-text-brand",
    meta: "mt-2 flex items-center gap-3.5",
    description: "mt-2 mb-0 max-w-text-measure-narrow text-body-sm text-text-muted",
    action: "mt-3.5",
    // 80px at 360px, 104px (the design system's size) from `sm` up — the row holds its shape at both.
    thumbnail: "size-20 shrink-0 sm:size-26",
  },
  variants: {
    hasDivider: { true: { root: "border-b border-border-subtle" }, false: {} },
  },
});

export interface MenuItemRowProps extends ComponentProps<"article"> {
  name: string;
  /** Devanagari dish name, set beside the Latin one (`कुल्फी`). */
  nameDevanagari?: string | undefined;
  /** Ingredient-led, 14 words at most. */
  description?: string | undefined;
  price: number;
  was?: number | undefined;
  spice?: 1 | 2 | 3 | 4 | undefined;
  /** Short marker, e.g. "Bestseller" (rendered uppercase by Badge). */
  badge?: string | undefined;
  image?: MenuItemImage | undefined;
  /** What photograph belongs in the placeholder. Default "Dish photo". */
  imageLabel?: string | undefined;
  /**
   * The Add button or a QuantityStepper — the row never owns cart state. Name it with the dish
   * (`aria-label="Add Masala Fries"`), so a menu is not a list of controls all called "Add".
   */
  action?: ReactNode | undefined;
  hasDivider?: boolean | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The menu list row: no card, a `border-subtle` hairline between items, the thumbnail on the
 * right. Every dish is vegetarian, so the DietMark always shows and there is no `diet` prop.
 */
export function MenuItemRow({
  name,
  nameDevanagari,
  description,
  price,
  was,
  spice,
  badge,
  image,
  imageLabel = "Dish photo",
  action,
  hasDivider = true,
  headingLevel = 3,
  className,
  ...props
}: MenuItemRowProps) {
  const styles = menuItemRow({ hasDivider });

  return (
    <article className={styles.root({ className })} {...props}>
      <div className={styles.body()}>
        <div className={styles.header()}>
          <DietMark size="sm" />
          {/* createElement, not `const Heading = headingTag(…)` (R83): the React Compiler lint reads
              a capitalised call result as a component created during render. */}
          {createElement(headingTag(headingLevel), { className: styles.name() }, name)}
          {nameDevanagari ? (
            <span lang="hi" className={styles.nameDevanagari()}>
              {nameDevanagari}
            </span>
          ) : null}
          {badge ? <Badge tone="soft">{badge}</Badge> : null}
        </div>
        <div className={styles.meta()}>
          <PriceTag amount={price} was={was} size="sm" />
          {spice === undefined ? null : <SpiceLevel level={spice} size="sm" />}
        </div>
        {description ? <p className={styles.description()}>{description}</p> : null}
        {action ? <div className={styles.action()}>{action}</div> : null}
      </div>
      <ImageSlot
        ratio="square"
        radius="md"
        className={styles.thumbnail()}
        {...(image ?? { label: imageLabel })}
      />
    </article>
  );
}
