import type { ComponentPropsWithoutRef, ElementType } from "react";

import { Plus } from "lucide-react";

import { Badge } from "../../atoms/badge/badge";
import { Card } from "../../atoms/card/card";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { IconButton } from "../../atoms/icon-button/icon-button";
import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { PriceTag } from "../../atoms/price-tag/price-tag";
import { SpiceLevel } from "../../atoms/spice-level/spice-level";
import { Text } from "../../atoms/text/text";
import { componentVariants } from "../../lib/component-variants";

const menuItemCard = componentVariants({
  slots: {
    // `relative` anchors the stretched link below; `h-full` lets a row of cards in a grid share one
    // height instead of stepping down as descriptions get shorter.
    root: "relative flex h-full flex-col",
    media: "relative",
    badge: "absolute top-3 left-3",
    /**
     * The floating add button overlaps the image edge by half its height. `z-1` puts it above the
     * stretched link's overlay, so tapping it adds the dish instead of opening the item page.
     */
    add: "absolute -bottom-4 right-3 z-1",
    body: "flex min-w-0 flex-1 flex-col gap-2 p-5",
    header: "flex min-w-0 items-center gap-2",
    name: "min-w-0",
    /**
     * The whole card is the link's hit area. The anchor stays a real, focusable, keyboard-reachable
     * element in the accessibility tree — which a click handler hung on the card would not be.
     */
    link: "after:absolute after:inset-0 after:content-['']",
    // `mt-auto` pins the price row to the bottom edge whatever the description does above it.
    meta: "mt-auto flex min-w-0 items-center justify-between gap-3 pt-1",
  },
});

export interface MenuItemCardProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** The dish, in Title Case exactly as the kitchen prints it. */
  name: string;
  /**
   * The element the dish name renders as. A heading by default, so a rail of cards reads as a
   * document outline; drop to `"p"` inside something that already owns the heading level.
   */
  nameAs?: ElementType | undefined;
  /** Ingredient-led, at most fourteen words — the card clamps it to two lines. */
  description?: string | undefined;
  /** Live price in whole rupees. */
  price: number;
  /** Pre-discount price, printed struck through after the live one. */
  was?: number | undefined;
  /** Always pass it — the mark is what makes a 100% vegetarian kitchen legible at a glance. */
  diet?: "veg" | "egg" | undefined;
  /** 1 Mild · 2 Medium · 3 Hot · 4 Extra Hot. Omit it on anything that carries no heat. */
  spice?: 1 | 2 | 3 | 4 | undefined;
  /** One short marker over the photograph — "Bestseller", "New". Never more than one. */
  badge?: string | undefined;
  /** The dish photograph. Leave it off and the labelled placeholder holds the space. */
  image?: string | undefined;
  /** What the photograph shows. Leave it empty when the dish name already says it. */
  imageAlt?: string | undefined;
  /** What photography this card is waiting for, named as a crop a photographer can act on. */
  imageLabel?: string | undefined;
  /** The dish's own page. Passing it turns the whole card into one link and adds the hover lift. */
  href?: string | undefined;
  /** Called by the floating pink add button. Omit it and no button is drawn. */
  onAdd?: (() => void) | undefined;
}

export function MenuItemCard({
  name,
  nameAs = "h3",
  description,
  price,
  was,
  diet = "veg",
  spice,
  badge,
  image,
  imageAlt = "",
  imageLabel = "Dish photo 4:3",
  href,
  onAdd,
  className,
  ...props
}: MenuItemCardProps) {
  const slots = menuItemCard();
  return (
    <Card
      className={slots.root({ className })}
      isInteractive={href !== undefined}
      padding="none"
      {...props}
    >
      <div className={slots.media()}>
        <ImageSlot alt={imageAlt} label={imageLabel} radius="none" ratio="4:3" src={image} />
        {badge === undefined ? null : (
          <Badge className={slots.badge()} tone="brand">
            {badge}
          </Badge>
        )}
        {onAdd === undefined ? null : (
          <IconButton
            className={slots.add()}
            icon={Plus}
            label={`Add ${name}`}
            onClick={onAdd}
            size="lg"
            variant="primary"
          />
        )}
      </div>
      <div className={slots.body()}>
        <div className={slots.header()}>
          <DietMark size="sm" variant={diet} />
          <Text as={nameAs} className={slots.name()} variant="subtitle1">
            {href === undefined ? (
              name
            ) : (
              <a className={slots.link()} href={href}>
                {name}
              </a>
            )}
          </Text>
        </div>
        {description === undefined ? null : (
          <Text lineClamp={2} tone="muted" variant="body2">
            {description}
          </Text>
        )}
        <div className={slots.meta()}>
          <PriceTag amount={price} was={was} />
          {spice === undefined ? null : <SpiceLevel level={spice} size="sm" />}
        </div>
      </div>
    </Card>
  );
}
