import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { Plus } from "lucide-react";

import { Badge } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { PriceTag } from "../../atoms/price-tag/price-tag";
import { SpiceLevel } from "../../atoms/spice-level/spice-level";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const menuItemRow = componentVariants({
  slots: {
    // Deliberately not a card: a menu list is a run of rows separated by one hairline, so the eye
    // reads the column of dish names instead of a grid of boxes.
    root: "flex items-start gap-4 py-5 sm:gap-5",
    // `min-w-0` is what lets a long dish name wrap instead of shoving the thumbnail off-screen — a
    // flex child's default `min-width: auto` refuses to shrink below its own content.
    body: "flex min-w-0 flex-1 flex-col gap-2",
    header: "flex min-w-0 flex-wrap items-center gap-2",
    name: "min-w-0",
    /** The Devanagari name sits beside the Latin one, in brand pink and one step down in size. */
    devanagari: "font-devanagari font-semibold text-body1 text-text-brand",
    meta: "flex flex-wrap items-center gap-3",
    action: "mt-1",
    // 80px at 360px, 104px from `sm` up — the row holds its shape at both.
    thumb: "w-20 shrink-0 sm:w-26",
  },
  variants: {
    /** The hairline under the row. Drop it on the last row of a section. */
    hasDivider: { true: { root: "border-b border-border-subtle" }, false: {} },
  },
  defaultVariants: { hasDivider: true },
});

export interface MenuItemRowProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children">, VariantProps<typeof menuItemRow> {
  /** The dish, in Title Case exactly as the kitchen prints it. */
  name: string;
  /** The Devanagari name shown beside the Latin one. Menu copy only, never a transliteration. */
  nameDevanagari?: string | undefined;
  /**
   * The element the dish name renders as. A heading by default, so a menu section reads as a
   * document outline; drop to `"p"` inside something that already owns the heading level.
   */
  nameAs?: ElementType | undefined;
  /** Ingredient-led, at most fourteen words. */
  description?: string | undefined;
  /** Live price in whole rupees. */
  price: number;
  /** Pre-discount price, printed struck through after the live one. */
  was?: number | undefined;
  /** Always pass it — the mark is what makes a 100% vegetarian kitchen legible at a glance. */
  diet?: "veg" | "egg" | undefined;
  /** 1 Mild · 2 Medium · 3 Hot · 4 Extra Hot. Omit it on anything that carries no heat. */
  spice?: 1 | 2 | 3 | 4 | undefined;
  /** One short marker beside the name — "Bestseller", "New". Never more than one. */
  badge?: string | undefined;
  /** The dish photograph. Leave it off and the labelled placeholder holds the space. */
  image?: string | undefined;
  /** What the photograph shows. Leave it empty when the dish name already says it. */
  imageAlt?: string | undefined;
  /** What photography this row is waiting for, named as a crop a photographer can act on. */
  imageLabel?: string | undefined;
  /** Called by the default Add button. Omit this and `action` on a menu that cannot take orders. */
  onAdd?: (() => void) | undefined;
  /** Replaces the default Add button — a quantity stepper once the dish is already in the cart. */
  action?: ReactNode | undefined;
}

export function MenuItemRow({
  name,
  nameDevanagari,
  nameAs = "h3",
  description,
  price,
  was,
  diet = "veg",
  spice,
  badge,
  image,
  imageAlt = "",
  imageLabel = "Dish photo 1:1",
  onAdd,
  action,
  hasDivider,
  className,
  ...props
}: MenuItemRowProps) {
  const slots = menuItemRow({ hasDivider });
  const actionNode =
    action ??
    (onAdd === undefined ? null : (
      // The dish name is folded into the accessible name, so a menu is not a list of controls all
      // called "Add".
      <Button aria-label={`Add ${name}`} icon={Plus} onClick={onAdd} size="sm" variant="secondary">
        Add
      </Button>
    ));

  return (
    <div className={slots.root({ className })} {...props}>
      <div className={slots.body()}>
        <div className={slots.header()}>
          <DietMark size="sm" variant={diet} />
          <Text as={nameAs} className={slots.name()} variant="subtitle1">
            {name}
          </Text>
          {nameDevanagari === undefined ? null : (
            // `lang` so assistive tech switches voice instead of spelling Devanagari in English.
            <span className={slots.devanagari()} lang="hi">
              {nameDevanagari}
            </span>
          )}
          {badge === undefined ? null : <Badge tone="soft">{badge}</Badge>}
        </div>
        <div className={slots.meta()}>
          <PriceTag amount={price} size="sm" was={was} />
          {spice === undefined ? null : <SpiceLevel level={spice} size="sm" />}
        </div>
        {description === undefined ? null : (
          <Text measure="narrow" tone="muted" variant="body2">
            {description}
          </Text>
        )}
        {actionNode === null ? null : <div className={slots.action()}>{actionNode}</div>}
      </div>
      <ImageSlot
        alt={imageAlt}
        className={slots.thumb()}
        label={imageLabel}
        radius="thumb"
        ratio="square"
        src={image}
      />
    </div>
  );
}
