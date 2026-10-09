import type { BasePropsWithColor, ColorProp } from "../../lib/common-props";
import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";
import { Icon, type IconComponent } from "../icon/icon";

export interface BadgeProps extends BasePropsWithColor<"span"> {
  /** The palette. A status colour (success · warning · danger) only has a soft skin. = "brand" */
  color?: Extract<ColorProp, "brand" | "neutral" | "success" | "warning" | "danger"> | undefined;
  /** solid = flooded fill (brand surface-aware, neutral ink) · soft = tinted fill. = "soft" */
  variant?: "solid" | "soft" | undefined;
  /** Optional 12px glyph. */
  icon?: IconComponent | undefined;
}

const badge = componentVariants({
  slots: {
    root: "inline-flex max-w-full shrink-0 items-center gap-1.25 rounded-pill px-2.5 py-1 font-display text-overline whitespace-nowrap uppercase",
    icon: "size-badge-icon",
    label: "min-w-0 truncate",
  },
  variants: {
    color: { brand: {}, neutral: {}, success: {}, warning: {}, danger: {} },
    variant: { solid: {}, soft: {} },
  },
  compoundVariants: [
    // Brand solid is the one surface-aware skin: white with pink text on a pink field.
    { color: "brand", variant: "solid", class: { root: "bg-badge-brand-bg text-badge-brand-fg" } },
    { color: "brand", variant: "soft", class: { root: "bg-pink-100 text-pink-700" } },
    { color: "neutral", variant: "solid", class: { root: "bg-ink-900 text-ink-000" } },
    { color: "neutral", variant: "soft", class: { root: "bg-ink-100 text-ink-700" } },
    // Status skins bring their own soft fill, so their text is the surface-invariant strong
    // primitive — `text-text-*` turns to a soft tint on brand and ink. They have no solid skin:
    // either variant paints the soft one.
    {
      color: "success",
      class: { root: "bg-status-success-soft text-mint-strong" },
    },
    {
      color: "warning",
      class: { root: "bg-status-warning-soft text-turmeric-strong" },
    },
    { color: "danger", class: { root: "bg-status-danger-soft text-danger" } },
  ],
  defaultVariants: { color: "brand", variant: "soft" },
});

/** Small uppercase status marker. Reads as a label, never as a button. */
export function Badge({ color, variant, icon, sx, className, children, ...props }: BadgeProps) {
  const slots = badge({ color, variant });
  return (
    <span className={slots.root({ className: withSx(sx, className) })} {...props}>
      {icon ? <Icon icon={icon} size="xs" className={slots.icon()} /> : null}
      <span className={slots.label()}>{children}</span>
    </span>
  );
}
