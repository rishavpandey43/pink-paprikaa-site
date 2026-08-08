import type { ComponentPropsWithoutRef } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

const imageSlot = componentVariants({
  slots: {
    // A ratio box, never a bare `<img>`: with no photo, or before one decodes, the box still holds
    // its space so nothing around it reflows (responsive contract §5).
    root: "grid w-full place-items-center overflow-hidden",
    image: "size-full object-cover",
    // The placeholder caption is set in the overline style so it reads as a production note, not
    // as content someone forgot to replace.
    caption:
      "px-3 text-center font-display font-bold text-overline text-balance uppercase leading-overline tracking-overline",
  },
  variants: {
    /**
     * The crop the slot holds. Every value is a fixed class — a computed `aspect-[${n}]` would
     * never be generated, because Tailwind scans source text rather than running the component.
     */
    ratio: {
      square: { root: "aspect-[1/1]" },
      "4:3": { root: "aspect-[4/3]" },
      "3:4": { root: "aspect-[3/4]" },
      "4:5": { root: "aspect-[4/5]" },
      "16:9": { root: "aspect-[16/9]" },
      "16:10": { root: "aspect-[16/10]" },
      wide: { root: "aspect-[21/9]" },
    },
    /**
     * The placeholder's ground. `soft` sits on white, `strong` on a pink-tinted section where the
     * softer tint would disappear, `ink` on a photo-heavy dark panel.
     */
    tone: {
      soft: { root: "bg-pink-100", caption: "text-pink-400" },
      strong: { root: "bg-pink-200", caption: "text-pink-700" },
      ink: { root: "bg-ink-200", caption: "text-ink-500" },
    },
    /** Thumbnails and inline photos round at 10px; cards at 16px; full-bleed hero panels at 24px. */
    radius: {
      none: { root: "rounded-none" },
      thumb: { root: "rounded-3" },
      card: { root: "rounded-4" },
      sheet: { root: "rounded-5" },
    },
    /** Fills the parent's height instead of holding a ratio — for full-bleed panels. */
    isFullHeight: { true: { root: "h-full" }, false: { root: "" } },
  },
  defaultVariants: { ratio: "4:3", tone: "soft", radius: "card", isFullHeight: false },
});

/**
 * The `isFullHeight` variant is re-declared below rather than inherited: the documented prop also
 * suppresses the ratio, so the box can never be handed a crop it cannot honour.
 */
export interface ImageSlotProps
  extends
    Omit<ComponentPropsWithoutRef<"div">, "children">,
    Omit<VariantProps<typeof imageSlot>, "isFullHeight"> {
  // `| undefined` is explicit on every optional below: the workspace sets
  // `exactOptionalPropertyTypes`, under which `prop?: T` REJECTS an explicitly-passed
  // `undefined`. Without it a consumer cannot forward its own optional straight through
  // (`<Thing src={item.photo} />` fails when `photo` is `string | undefined`).
  /** The photograph. Leave it off and the slot renders the labelled placeholder instead. */
  src?: string | undefined;
  /** What the photograph shows. Empty means decorative — say why in a comment when you do that. */
  alt?: string | undefined;
  /**
   * What photography this slot is waiting for. Name the real crop — "Kitchen portrait 3:4, warm,
   * close-cropped" is something a photographer can act on; "Dish photo" is not.
   */
  label?: string | undefined;
  /**
   * Stretches to the parent's height instead of holding `ratio`. Reserve it for full-bleed panels
   * whose height is already decided by a sibling.
   */
  isFullHeight?: boolean | undefined;
}

/**
 * The opt-out `tailwind-variants` understands: an explicit `null` skips a variant outright, where
 * `undefined` falls back to `defaultVariants` and would put the `4:3` crop back on a stretched box.
 * Its published prop type models only the value union, so the opt-out needs the cast.
 */
const NO_RATIO = null as unknown as ImageSlotProps["ratio"];

export function ImageSlot({
  src,
  alt = "",
  label = "Dish photo",
  ratio,
  tone,
  radius,
  isFullHeight = false,
  className,
  ...props
}: ImageSlotProps) {
  const { root, image, caption } = imageSlot({
    // A ratio and a stretched height are mutually exclusive, so the box only ever gets one of them.
    ratio: isFullHeight ? NO_RATIO : ratio,
    tone,
    radius,
    isFullHeight,
  });
  return (
    <div className={root({ className })} {...props}>
      {src === undefined ? (
        <span className={caption()}>{label}</span>
      ) : (
        <img alt={alt} className={image()} src={src} />
      )}
    </div>
  );
}
