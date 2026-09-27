import type { ComponentProps, ElementType } from "react";

import { ArrowUpRight } from "lucide-react";
import { Slot } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";
import { Icon, type IconComponent } from "../icon/icon";

export interface LinkProps extends ComponentProps<"a"> {
  /** default = pink underline · subtle = muted · inverse = white, on pink/ink · quiet = nav links. */
  variant?: "default" | "subtle" | "inverse" | "quiet" | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  icon?: IconComponent | undefined;
  iconAfter?: IconComponent | undefined;
  /** Opens in a new tab with a safe `rel` and appends the outward arrow, announced "Opens in a new tab". */
  isExternal?: boolean | undefined;
  /** Render the single child (e.g. `next/link`) with Link styling. */
  asChild?: boolean | undefined;
}

/*
 * Colours only: the underline's 1.5px thickness and 3px offset come from the base `a` rule every
 * anchor gets (Tailwind has no 1.5px decoration utility). `default` and `subtle` paint with
 * semantic tokens and `quiet` with a surface-aware token, so all three follow a pink or ink field.
 */
const link = componentVariants({
  base: "inline-flex items-center gap-1.5 font-body underline transition-colors duration-fast ease-out",
  variants: {
    variant: {
      default:
        "text-text-link decoration-link-underline hover:text-text-link-hover hover:decoration-current",
      subtle:
        "text-text-muted decoration-transparent hover:text-text-heading hover:decoration-border-default",
      inverse: "text-ink-000 decoration-white-alpha-40 hover:decoration-white-alpha-90",
      quiet: "text-link-quiet decoration-transparent hover:text-text-link",
    },
    size: { sm: "text-link-sm", md: "text-link-md", lg: "text-link-lg" },
  },
  defaultVariants: { variant: "default", size: "md" },
});

const EXTERNAL = { target: "_blank", rel: "noreferrer noopener" } as const;

/** Inline or standalone link. Underline is the brand's link signal. */
export function Link({
  variant,
  size,
  icon,
  iconAfter,
  isExternal = false,
  asChild = false,
  className,
  children,
  ...props
}: LinkProps) {
  const Component: ElementType = asChild ? Slot.Root : "a";
  // An external link always announces "Opens in a new tab" (R36, built-in English) on its trailing
  // glyph: the outward arrow, or the caller's own `iconAfter`, which replaces the arrow's drawing.
  const after = iconAfter ?? (isExternal ? ArrowUpRight : undefined);
  return (
    <Component
      className={link({ variant, size, className })}
      {...(isExternal ? EXTERNAL : undefined)}
      {...props}
    >
      {icon ? <Icon icon={icon} size="sm" /> : null}
      <Slot.Slottable child={children}>{(label) => label}</Slot.Slottable>
      {after ? (
        <Icon icon={after} size="sm" label={isExternal ? "Opens in a new tab" : undefined} />
      ) : null}
    </Component>
  );
}
