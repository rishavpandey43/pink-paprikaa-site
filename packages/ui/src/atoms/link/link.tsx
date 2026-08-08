import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

import { ArrowUpRight } from "lucide-react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { Icon } from "../icon/icon";

const link = componentVariants({
  base: [
    "inline-flex items-center gap-1.5 font-body font-medium",
    // The underline is the brand's link signal — an unstyled `<a>` would fall back to browser
    // blue, which is not in the palette. Every variant keeps the underline slot and only changes
    // its colour, so a link never shifts its baseline on hover.
    "underline decoration-2 underline-offset-3",
    "transition-[color,text-decoration-color] duration-(--duration-fast) ease-out",
  ],
  variants: {
    variant: {
      default:
        "text-text-link decoration-pink-200 hover:text-text-link-hover hover:decoration-current",
      subtle:
        "text-text-muted decoration-transparent hover:text-text-heading hover:decoration-ink-300",
      inverse: "text-text-on-brand decoration-glass-white hover:decoration-current",
      quiet: "text-text-body decoration-transparent hover:text-text-brand hover:decoration-current",
    },
    size: {
      sm: "text-body2",
      md: "text-body1",
      lg: "text-subtitle2",
    },
  },
  defaultVariants: { variant: "default", size: "md" },
});

/** The glyph size each link size pairs with — never larger than the text it sits beside. */
const ICON_SIZE = { sm: "xs", md: "sm", lg: "sm" } as const;

export interface LinkProps
  extends Omit<ComponentPropsWithoutRef<"a">, "color" | "href">, VariantProps<typeof link> {
  /** Required: an anchor without a destination is not a link to assistive tech. */
  href: string;
  /** Lucide glyph before the label. */
  icon?: LucideIcon | undefined;
  /** Lucide glyph after the label — reserve it for "onward" destinations. */
  iconAfter?: LucideIcon | undefined;
  /**
   * Opens the destination in a new tab with the safe `rel`, and appends the outward arrow so the
   * jump is visible before it happens. The arrow carries the "opens in a new tab" announcement.
   */
  isExternal?: boolean | undefined;
}

export function Link({
  children,
  className,
  variant,
  size = "md",
  icon,
  iconAfter,
  isExternal = false,
  ...props
}: LinkProps) {
  const iconSize = ICON_SIZE[size];
  // The outward arrow is the only glyph that carries an announcement — a caller's own `iconAfter`
  // is decorative, because the label beside it already says where the link goes.
  const hasExternalArrow = isExternal && iconAfter === undefined;
  return (
    <a
      className={link({ variant, size, className })}
      rel={isExternal ? "noreferrer noopener" : undefined}
      target={isExternal ? "_blank" : undefined}
      {...props}
    >
      {icon ? <Icon icon={icon} size={iconSize} /> : null}
      {children}
      {hasExternalArrow ? (
        <Icon icon={ArrowUpRight} label="Opens in a new tab" size={iconSize} />
      ) : null}
      {iconAfter ? <Icon icon={iconAfter} size={iconSize} /> : null}
    </a>
  );
}
