import type { ComponentProps, ElementType } from "react";

import { ArrowUpRight } from "lucide-react";
import { Slot } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";
import { Icon, type IconComponent } from "../icon/icon";
import {
  Typography,
  typography,
  type TypographyColor,
  type TypographyStyleProps,
} from "../typography/typography";

export interface LinkProps
  extends Omit<ComponentProps<"a">, "color">, Omit<TypographyStyleProps, "color"> {
  /** Text step. Default `link-md`; `inherit` takes the size and face of the surrounding text. */
  variant?: TypographyStyleProps["variant"];
  /** `link` is the pink default · `muted` · `inverse` white on pink/ink · `quiet` for nav links. */
  color?: TypographyColor | "quiet" | undefined;
  /** `always` underlines · `hover` shows the line on hover only · `none` never. */
  underline?: "always" | "hover" | "none" | undefined;
  icon?: IconComponent | undefined;
  iconAfter?: IconComponent | undefined;
  /**
   * Opens in a new tab with a safe `rel` and announces "Opens in a new tab" on a trailing glyph:
   * the outward arrow, or the caller's `iconAfter` when one is set.
   */
  isExternal?: boolean | undefined;
  /** Render the single child (e.g. `next/link`) with Link styling. */
  asChild?: boolean | undefined;
}

/** The colours Link paints itself; any other Typography colour passes through to Typography. */
type OwnColor = "link" | "muted" | "inverse" | "quiet";

/*
 * Colours and the underline. The underline's 1.5px thickness and 3px offset come from the base `a`
 * rule every anchor gets (Tailwind has no 1.5px decoration utility). `link` and `muted` paint with
 * semantic tokens and `quiet` with a surface-aware token, so all follow a pink or ink field. The
 * size, face and margin reset come from Typography.
 */
const link = componentVariants({
  base: "inline-flex items-center gap-1.5 transition-colors duration-fast ease-out",
  variants: {
    tone: {
      link: "text-text-link hover:text-text-link-hover",
      muted: "text-text-muted hover:text-text-heading",
      inverse: "text-ink-000",
      quiet: "text-link-quiet hover:text-text-link",
      other: "",
    },
    underline: { always: "underline", hover: "underline", none: "no-underline" },
  },
  compoundVariants: [
    {
      tone: "link",
      underline: "always",
      class: "decoration-link-underline hover:decoration-current",
    },
    { tone: "link", underline: "hover", class: "decoration-transparent hover:decoration-current" },
    {
      tone: "muted",
      underline: "always",
      class: "decoration-border-default hover:decoration-current",
    },
    {
      tone: "muted",
      underline: "hover",
      class: "decoration-transparent hover:decoration-border-default",
    },
    {
      tone: "inverse",
      underline: "always",
      class: "decoration-white-alpha-40 hover:decoration-white-alpha-90",
    },
    {
      tone: "inverse",
      underline: "hover",
      class: "decoration-transparent hover:decoration-white-alpha-90",
    },
    { tone: "quiet", underline: "always", class: "decoration-current" },
    { tone: "quiet", underline: "hover", class: "decoration-transparent" },
    { tone: "other", underline: "always", class: "decoration-current" },
    { tone: "other", underline: "hover", class: "decoration-transparent hover:decoration-current" },
  ],
  defaultVariants: { tone: "link", underline: "always" },
});

const OWN_COLORS: ReadonlySet<string> = new Set<OwnColor>(["link", "muted", "inverse", "quiet"]);

const EXTERNAL = { target: "_blank", rel: "noreferrer noopener" } as const;

/** Inline or standalone link. Underline is the brand's link signal. Renders through Typography. */
export function Link({
  variant = "link-md",
  color = "link",
  underline = "always",
  weight,
  align,
  noWrap,
  isFluid,
  lineClamp,
  measure,
  isBalanced,
  sx,
  icon,
  iconAfter,
  isExternal = false,
  asChild = false,
  className,
  children,
  ...props
}: LinkProps) {
  const isOwnColor = OWN_COLORS.has(color);
  const typographyProps = {
    variant,
    // Link's own colours carry their classes in the recipe; any other passes to Typography.
    color: isOwnColor ? undefined : (color as TypographyColor),
    weight,
    align,
    noWrap,
    isFluid,
    lineClamp,
    measure,
    isBalanced,
  };
  // sx sits between the recipe and className here, so it can replace a Link default (`display`).
  const classes = link({
    tone: isOwnColor ? (color as OwnColor) : "other",
    underline,
    className: withSx(sx, className),
  });
  // An external link always announces "Opens in a new tab" (R36, built-in English) on its trailing
  // glyph: the outward arrow, or the caller's own `iconAfter`, which replaces the arrow's drawing.
  const after = iconAfter ?? (isExternal ? ArrowUpRight : undefined);
  const icons = {
    before: icon ? <Icon icon={icon} size="sm" /> : null,
    after: after ? (
      <Icon icon={after} size="sm" label={isExternal ? "Opens in a new tab" : undefined} />
    ) : null,
  };
  const external = isExternal ? EXTERNAL : undefined;
  if (asChild) {
    // Slottable must be a direct child of the Slot, so the glyphs cannot share a fragment.
    // The router link has no Typography element to render, so it takes the same classes directly.
    const Component: ElementType = Slot.Root;
    return (
      <Component
        className={typography({ ...typographyProps, className: classes })}
        {...external}
        {...props}
      >
        {icons.before}
        <Slot.Slottable child={children}>{(label) => label}</Slot.Slottable>
        {icons.after}
      </Component>
    );
  }
  // Typography is typed as the paragraph; Link hands it anchor props, so the call site is widened.
  const Anchor = Typography as (
    props: ComponentProps<"a"> & TypographyStyleProps & { as: "a" }
  ) => React.JSX.Element;
  return (
    <Anchor as="a" {...typographyProps} className={classes} {...external} {...props}>
      {icons.before}
      {children}
      {icons.after}
    </Anchor>
  );
}
