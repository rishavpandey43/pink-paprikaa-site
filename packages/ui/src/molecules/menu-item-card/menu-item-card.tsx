import { type ComponentProps, createElement, type ReactNode } from "react";

import type { LinkAs } from "../../lib/link-as";
import type { MenuItemImage } from "../menu-item-row/menu-item-row";

import { Badge } from "../../atoms/badge/badge";
import { Card } from "../../atoms/card/card";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { PriceTag } from "../../atoms/price-tag/price-tag";
import { SpiceLevel } from "../../atoms/spice-level/spice-level";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { STRETCHED_LINK } from "../../lib/stretched-link";

const menuItemCard = componentVariants({
  slots: {
    // The stretched link's keyboard ring goes round the whole card (lib/stretched-link).
    root: ["flex h-full flex-col", STRETCHED_LINK.card],
    media: "relative",
    badge: "absolute top-3 left-3",
    // Above the stretched link's overlay, so the Add button stays its own target.
    action: "absolute right-3.5 -bottom-4.5 z-raised",
    // flex-1 + the footer's mt-auto pin the price row to the bottom, so a grid of cards lines up.
    body: "flex flex-1 flex-col gap-2 p-4.5",
    header: "flex items-center gap-2",
    name: "min-w-0 font-display text-menu-item-name text-text-heading",
    // Stretched link: the ::after covers the whole card, so the card clicks through to the dish.
    link: STRETCHED_LINK.link,
    description: "m-0 line-clamp-2 max-w-none text-body-sm text-text-muted",
    footer: "mt-auto flex items-center justify-between gap-2.5 pt-0.5",
  },
});

export interface MenuItemCardProps extends ComponentProps<"article"> {
  name: string;
  description?: string | undefined;
  price: number;
  was?: number | undefined;
  spice?: 1 | 2 | 3 | 4 | undefined;
  badge?: string | undefined;
  image?: MenuItemImage | undefined;
  /** What photograph belongs in the placeholder. Default "Dish photo". */
  imageLabel?: string | undefined;
  /**
   * The floating add button (IconButton, `shadow-brand`), or nothing on a card that cannot take an
   * order. Name it with the dish (`label="Add Masala Cold Brew"`), so a grid of cards is not a
   * list of controls all called "Add".
   */
  action?: ReactNode | undefined;
  /** Makes the dish name a link that covers the card. */
  href?: string | undefined;
  linkAs?: LinkAs | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * Image-first dish card for grids and rails: a 4:3 photo with an overlapping floating action,
 * then the DietMark, the name, the price and the heat. With `href` the card is a link and lifts
 * on hover; the action stays a separate button.
 */
export function MenuItemCard({
  name,
  description,
  price,
  was,
  spice,
  badge,
  image,
  imageLabel = "Dish photo",
  action,
  href,
  linkAs: LinkComponent = "a",
  headingLevel = 3,
  className,
  ...props
}: MenuItemCardProps) {
  const styles = menuItemCard();

  return (
    <Card
      asChild
      padding="none"
      isInteractive={href !== undefined}
      className={styles.root({ className })}
    >
      <article {...props}>
        <div className={styles.media()}>
          <ImageSlot ratio="4:3" radius="none" {...(image ?? { label: imageLabel })} />
          {badge ? (
            <Badge tone="brand" className={styles.badge()}>
              {badge}
            </Badge>
          ) : null}
          {action ? <div className={styles.action()}>{action}</div> : null}
        </div>
        <div className={styles.body()}>
          <div className={styles.header()}>
            <DietMark size="sm" />
            {/* createElement, not `const Heading = headingTag(…)` (R83): the React Compiler lint reads
                a capitalised call result as a component created during render. */}
            {createElement(
              headingTag(headingLevel),
              {
                className: styles.name(),
                "data-stretched-link": href === undefined ? undefined : "",
              },
              href === undefined ? (
                name
              ) : (
                <LinkComponent href={href} className={styles.link()}>
                  {name}
                </LinkComponent>
              )
            )}
          </div>
          {description ? <p className={styles.description()}>{description}</p> : null}
          <div className={styles.footer()}>
            <PriceTag amount={price} was={was} />
            {spice === undefined ? null : <SpiceLevel level={spice} size="sm" />}
          </div>
        </div>
      </article>
    </Card>
  );
}
