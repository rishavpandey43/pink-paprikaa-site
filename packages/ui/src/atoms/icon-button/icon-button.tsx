import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { Icon } from "../icon/icon";

const iconButton = componentVariants({
  slots: {
    /**
     * The hit target, not the visual. It is always at least 44 x 44 (`--layout-hit-min`) even when
     * the painted circle is 32px, so a small toolbar glyph is still comfortably tappable — the
     * reason this atom is two elements rather than one.
     */
    root: [
      "group inline-flex shrink-0 items-center justify-center rounded-6 border-0 bg-transparent p-0",
      "min-h-(--layout-hit-min) min-w-(--layout-hit-min)",
      "transition-transform duration-(--duration-instant) ease-out",
      "not-disabled:active:scale-(--motion-press-scale)",
      "disabled:cursor-not-allowed",
    ],
    /** The painted circle. Sized independently of the hit target. */
    surface: [
      "inline-flex items-center justify-center rounded-6",
      "transition-[background-color,border-color,color,box-shadow] duration-(--duration-fast) ease-out",
      // Disabled is a real grey fill, never a reduced opacity (state contract).
      "group-disabled:border-transparent group-disabled:shadow-none",
      "group-disabled:bg-(--button-bg-disabled) group-disabled:text-(--button-fg-disabled)",
    ],
  },
  variants: {
    variant: {
      primary: {
        surface:
          "bg-brand-primary text-text-on-brand shadow-brand group-not-disabled:group-hover:bg-brand-primary-hover",
      },
      secondary: {
        surface:
          "border border-border-default bg-surface-card text-text-link group-not-disabled:group-hover:bg-brand-tint",
      },
      ghost: {
        surface: "bg-transparent text-text-body group-not-disabled:group-hover:bg-brand-tint",
      },
      /** Translucent white over food photography — the only variant that blurs what is behind it. */
      glass: {
        surface:
          "bg-surface-glass text-text-heading shadow-elevation2 backdrop-blur-(--effect-blur-glass) group-not-disabled:group-hover:bg-surface-card",
      },
    },
    size: {
      sm: { surface: "size-8" },
      md: { surface: "size-10" },
      lg: { surface: "size-12" },
    },
    /**
     * Set `brand` when the button sits on a flooded pink panel: the fills invert, because
     * pink-on-pink has no contrast to work with.
     */
    on: { light: {}, brand: {} },
  },
  compoundVariants: [
    {
      on: "brand",
      variant: "primary",
      class: {
        surface:
          "bg-surface-card text-text-link shadow-elevation2 group-not-disabled:group-hover:bg-brand-tint",
      },
    },
    {
      on: "brand",
      variant: "secondary",
      class: {
        surface:
          "border-text-on-brand bg-transparent text-text-on-brand group-not-disabled:group-hover:bg-glass-white group-not-disabled:group-hover:text-text-link",
      },
    },
    {
      on: "brand",
      variant: "ghost",
      class: {
        surface:
          "text-text-on-brand group-not-disabled:group-hover:bg-glass-white group-not-disabled:group-hover:text-text-link",
      },
    },
  ],
  defaultVariants: { variant: "ghost", size: "md", on: "light" },
});

/** The glyph size each circle size pairs with — 16 / 20 / 24px. */
const ICON_SIZE = { sm: "sm", md: "md", lg: "lg" } as const;

export interface IconButtonProps
  extends
    Omit<ComponentPropsWithoutRef<"button">, "children" | "color">,
    VariantProps<typeof iconButton> {
  /** The Lucide glyph itself, imported by name: `import { Heart } from "lucide-react"`. */
  icon: LucideIcon;
  /**
   * Required accessible name — an icon-only control is silent without it. Title Case, and phrased
   * as the action it performs: "Save", "Share", "Back".
   */
  label: string;
}

export function IconButton({
  className,
  variant,
  size = "md",
  on,
  icon,
  label,
  disabled = false,
  type = "button",
  ...props
}: IconButtonProps) {
  const { root, surface } = iconButton({ variant, size, on });
  return (
    <button
      aria-label={label}
      className={root({ className })}
      disabled={disabled}
      type={type}
      {...props}
    >
      <span className={surface()}>
        <Icon icon={icon} size={ICON_SIZE[size]} />
      </span>
    </button>
  );
}
