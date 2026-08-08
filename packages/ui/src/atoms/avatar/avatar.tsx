"use client";

import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

import { Avatar as AvatarPrimitive } from "radix-ui";

import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { Icon } from "../icon/icon";

const avatar = componentVariants({
  slots: {
    // Always circular — the brand never draws a square avatar, and never a hashed colour block.
    root: "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-6 bg-brand-soft select-none",
    image: "size-full object-cover",
    fallback: "inline-grid size-full place-items-center font-display font-bold text-text-brand",
  },
  variants: {
    size: {
      xs: { root: "size-6", fallback: "text-overline" },
      sm: { root: "size-8", fallback: "text-caption" },
      md: { root: "size-10", fallback: "text-body2" },
      lg: { root: "size-14", fallback: "text-subtitle1" },
      xl: { root: "size-20", fallback: "text-h3" },
    },
    /**
     * The pink halo that marks the signed-in guest. It is drawn as a ring with a page-coloured
     * offset so the avatar keeps its full diameter — never as a border, which would eat into it.
     */
    hasRing: {
      true: { root: "ring-2 ring-brand-primary ring-offset-2 ring-offset-surface-card" },
      false: {},
    },
  },
  defaultVariants: { size: "md", hasRing: false },
});

/** The glyph size each avatar size pairs with — roughly half the diameter. */
const ICON_SIZE = { xs: "xs", sm: "sm", md: "md", lg: "lg", xl: "xl" } as const;

/** "Aditi Rao" -> "AR", "Kabir" -> "K", "Meera S Iyer" -> "MS". Two letters, never three. */
function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

export interface AvatarProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children">, VariantProps<typeof avatar> {
  /**
   * Guest, reviewer or staff name. It drives the initials fallback and becomes the photo's alt
   * text, so pass it even when a `src` is available.
   */
  name?: string | undefined;
  /** Photo URL. Until it loads — and forever, if it fails — the fallback shows in its place. */
  src?: string | undefined;
  /**
   * Lucide glyph to show instead of initials, for the signed-out placeholder. It wins over
   * `name`, so pass one or the other.
   */
  icon?: LucideIcon | undefined;
}

export function Avatar({ className, size, hasRing, name, src, icon, ...props }: AvatarProps) {
  const { root, image, fallback } = avatar({ size, hasRing });
  const initials = name === undefined ? "" : initialsOf(name);
  return (
    <AvatarPrimitive.Root className={root({ className })} {...props}>
      {src === undefined ? null : (
        <AvatarPrimitive.Image alt={name ?? ""} className={image()} src={src} />
      )}
      <AvatarPrimitive.Fallback className={fallback()}>
        {icon === undefined ? (
          initials === "" ? null : (
            initials
          )
        ) : (
          <Icon icon={icon} size={ICON_SIZE[size ?? "md"]} />
        )}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
