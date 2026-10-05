import type { BaseProps } from "../../lib/common-props";

import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";
import { withTooltip } from "../../lib/with-tooltip";
import { Icon, type IconComponent } from "../icon/icon";

export interface AvatarProps extends BaseProps<"span"> {
  /** The person's name — the initials and the accessible name. */
  name?: string | undefined;
  /** Photo URL; fills the circle. */
  src?: string | undefined;
  /** xs 24 · sm 32 · md 40 · lg 56 · xl 80. */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | undefined;
  /** A glyph in place of initials (e.g. a signed-out guest). */
  icon?: IconComponent | undefined;
  /** The pink halo of the signed-in guest. */
  hasRing?: boolean | undefined;
  /**
   * Optional hint via our Tooltip (never the browser `title` bubble). When set, the avatar is
   * focusable so keyboard users can open it.
   */
  tooltip?: string | undefined;
}

const avatar = componentVariants({
  slots: {
    root: "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-pill bg-pink-100 font-display text-pink-700 select-none",
    // Over the initials: they show while the photo loads, and stay if it fails (alt="" paints nothing).
    image: "absolute inset-0 size-full object-cover",
    // Half the circle; `Icon`'s own size only picks the stroke (2px ≤ 16px, 1.75px above).
    icon: "size-1/2",
  },
  variants: {
    size: {
      xs: { root: "size-avatar-xs text-avatar-xs" },
      sm: { root: "size-avatar-sm text-avatar-sm" },
      md: { root: "size-avatar-md text-avatar-md" },
      lg: { root: "size-avatar-lg text-avatar-lg" },
      xl: { root: "size-avatar-xl text-avatar-xl" },
    },
    hasRing: { true: { root: "shadow-avatar-ring" } },
  },
  defaultVariants: { size: "md", hasRing: false },
});

/** Up to two initials, from the first two words; code-point safe for Devanagari names. */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => word !== "")
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("")
    .toUpperCase();
}

/** Circular guest or staff avatar. Falls back to initials on pink-100. */
export function Avatar({
  name,
  src,
  size = "md",
  icon,
  hasRing,
  tooltip,
  sx,
  className,
  tabIndex,
  ...props
}: AvatarProps) {
  const slots = avatar({ size, hasRing });
  const label = name?.trim() ?? "";
  const hasName = label !== "";
  const tip = tooltip?.trim() ?? "";
  const hasTooltip = tip !== "";

  const node = (
    <span
      role={hasName ? "img" : undefined}
      aria-label={hasName ? label : undefined}
      aria-hidden={hasName ? undefined : true}
      tabIndex={hasTooltip ? (tabIndex ?? 0) : tabIndex}
      className={slots.root({ className: withSx(sx, className) })}
      {...props}
    >
      {icon ? <Icon icon={icon} size={size} className={slots.icon()} /> : initialsOf(label)}
      {src === undefined ? null : <img src={src} alt="" className={slots.image()} />}
    </span>
  );

  return hasTooltip ? withTooltip(tip, node) : node;
}
