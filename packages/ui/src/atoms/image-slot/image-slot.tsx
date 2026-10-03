import type { ReactNode } from "react";

import type { BaseProps } from "../../lib/common-props";

import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";

/** Native div props reach the root (R35); `role` and `aria-label` are the placeholder's own. */
export interface ImageSlotBase extends Omit<BaseProps<"div">, "children" | "role" | "aria-label"> {
  ratio?: "square" | "4:3" | "3:4" | "4:5" | "16:9" | "16:10" | "wide" | undefined;
  radius?: "none" | "md" | "lg" | "xl" | undefined;
  /** Placeholder colourway: soft pink-100 · strong pink-200 · ink grey. */
  fill?: "soft" | "strong" | "ink" | undefined;
  /** Fill the parent's height instead of using an aspect ratio (full-bleed panels). */
  isFill?: boolean | undefined;
  /** A `<picture>` from the image pipeline; its `<img>` should carry `size-full object-cover`. */
  children?: ReactNode | undefined;
}

/** A real image (alt and intrinsic size required), or a placeholder that names the crop it needs. */
export type ImageSlotProps = ImageSlotBase &
  (
    | {
        src: string;
        alt: string;
        width: number;
        height: number;
        sizes?: string | undefined;
        srcSet?: string | undefined;
        loading?: "lazy" | "eager" | undefined;
        fetchPriority?: "high" | "low" | "auto" | undefined;
        label?: never;
      }
    | { src?: undefined; label: string }
  );

const imageSlot = componentVariants({
  slots: {
    root: "relative grid w-full place-items-center overflow-hidden",
    image: "size-full object-cover",
    label: "px-3 text-center font-display text-image-slot-label text-balance uppercase",
  },
  variants: {
    ratio: {
      square: { root: "aspect-square" },
      "4:3": { root: "aspect-4-3" },
      "3:4": { root: "aspect-3-4" },
      "4:5": { root: "aspect-4-5" },
      "16:9": { root: "aspect-16-9" },
      "16:10": { root: "aspect-16-10" },
      wide: { root: "aspect-wide" },
    },
    radius: {
      none: { root: "rounded-none" },
      md: { root: "rounded-md" },
      lg: { root: "rounded-lg" },
      xl: { root: "rounded-xl" },
    },
    fill: {
      soft: { root: "bg-pink-100", label: "text-pink-700" },
      strong: { root: "bg-pink-200", label: "text-pink-800" },
      ink: { root: "bg-ink-200", label: "text-ink-600" },
    },
    // Declared after `ratio`, so `aspect-auto` replaces the ratio in the merge.
    isFill: { true: { root: "aspect-auto h-full" } },
  },
  defaultVariants: { ratio: "4:3", radius: "md", fill: "soft", isFill: false },
});

/**
 * Every image in the system. Until real photography lands, a labelled placeholder that names the
 * crop it needs; with `src`, a lazy `<img>` in the same aspect box, so a layout never collapses.
 */
export function ImageSlot({
  ratio,
  radius,
  fill,
  isFill,
  sx,
  className,
  children,
  ...props
}: ImageSlotProps) {
  const slots = imageSlot({ ratio, radius, fill, isFill });
  if (props.src !== undefined) {
    const {
      src,
      alt,
      width,
      height,
      sizes,
      srcSet,
      loading = "lazy",
      fetchPriority,
      label: _label,
      ...rest
    } = props;
    return (
      <div className={slots.root({ className: withSx(sx, className) })} {...rest}>
        {children ?? (
          <img
            className={slots.image()}
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            srcSet={srcSet}
            loading={loading}
            decoding="async"
            fetchPriority={fetchPriority}
          />
        )}
      </div>
    );
  }
  const { src: _src, label, ...rest } = props;
  // A blank label would make an unnamed `img`: without a name the placeholder is plain decoration.
  const isNamedPlaceholder = children === undefined && label.trim() !== "";
  return (
    <div
      role={isNamedPlaceholder ? "img" : undefined}
      aria-label={isNamedPlaceholder ? label : undefined}
      className={slots.root({ className: withSx(sx, className) })}
      {...rest}
    >
      {children ?? <span className={slots.label()}>{label}</span>}
    </div>
  );
}
