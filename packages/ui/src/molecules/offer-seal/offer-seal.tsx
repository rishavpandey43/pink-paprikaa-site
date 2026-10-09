import type { BasePropsWithColor } from "../../lib/common-props";
import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";

const offerSeal = componentVariants({
  slots: {
    root: "grid size-offer-seal shrink-0 rotate-45 place-items-center rounded-offer-seal shadow-3",
    content: "grid -rotate-45 gap-0.5 text-center",
    value: "font-display text-offer-seal-value",
    label: "font-display text-offer-seal-label uppercase",
    note: "font-body text-offer-seal-note",
  },
  variants: {
    size: {
      sm: { root: "text-offer-seal-sm" },
      md: { root: "text-offer-seal-md" },
      lg: { root: "text-offer-seal-lg" },
      xl: { root: "text-offer-seal-xl" },
    },
    color: {
      neutral: { root: "bg-ink-000 text-pink-600" },
      brand: { root: "bg-pink-500 text-ink-000" },
      accent: { root: "bg-turmeric text-ink-900" },
    },
    // In flow, a margin reserves the rotated tips' overhang (~0.15 × side; rotate-45 is not
    // layout), so neighbours and a 360px page never meet a tip. A bleeding seal overhangs on purpose.
    bleed: {
      none: { root: "m-offer-seal-clear" },
      sm: { root: "absolute" },
      md: { root: "absolute" },
    },
    corner: { "top-right": {}, "top-left": {}, "bottom-right": {}, "bottom-left": {} },
  },
  // Bleed is a fraction of the seal's own side. The counter-rotated value reaches 0.32 × side from
  // the centre, so an offset past 0.18 × side clips it (design-system readme §4b): the only steps
  // are 1/12 and 1/6, which is the design system's clamp made a compile-time guarantee.
  compoundVariants: [
    {
      bleed: "sm",
      corner: "top-right",
      class: { root: "top-0 right-0 translate-x-1/12 -translate-y-1/12" },
    },
    {
      bleed: "sm",
      corner: "top-left",
      class: { root: "top-0 left-0 -translate-x-1/12 -translate-y-1/12" },
    },
    {
      bleed: "sm",
      corner: "bottom-right",
      class: { root: "right-0 bottom-0 translate-x-1/12 translate-y-1/12" },
    },
    {
      bleed: "sm",
      corner: "bottom-left",
      class: { root: "bottom-0 left-0 -translate-x-1/12 translate-y-1/12" },
    },
    {
      bleed: "md",
      corner: "top-right",
      class: { root: "top-0 right-0 translate-x-1/6 -translate-y-1/6" },
    },
    {
      bleed: "md",
      corner: "top-left",
      class: { root: "top-0 left-0 -translate-x-1/6 -translate-y-1/6" },
    },
    {
      bleed: "md",
      corner: "bottom-right",
      class: { root: "right-0 bottom-0 translate-x-1/6 translate-y-1/6" },
    },
    {
      bleed: "md",
      corner: "bottom-left",
      class: { root: "bottom-0 left-0 -translate-x-1/6 translate-y-1/6" },
    },
  ],
});

export interface OfferSealProps extends BasePropsWithColor<"div"> {
  /** The number — "50%", "₹99" (format with formatRupees), "1+1". */
  value: string;
  /** Short word under it, e.g. "Off" (rendered uppercase). */
  label?: string | undefined;
  /** Small print under the label. Not rendered at `sm`, where it would print at ~7px. */
  note?: string | undefined;
  /**
   * Side: sm 110 · md 156 (handoff hero) · lg 260 (1080 canvases) · xl 360px. In flow the seal
   * also reserves 0.15 × side on every edge for its tips, so on a 360px page use `sm` or `md`.
   */
  size?: "sm" | "md" | "lg" | "xl" | undefined;
  /** `neutral` is the white seal, `accent` the turmeric one. */
  color?: "neutral" | "brand" | "accent" | undefined;
  /** Where the seal hangs off its container when it bleeds. */
  corner?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | undefined;
  /** How far past the corner: 1/12 or 1/6 of the side. The container needs `relative`. */
  bleed?: "none" | "sm" | "md" | undefined;
}

/** Offer badge for posts, stories and banners — a rotated brand diamond, never a starburst. */
export function OfferSeal({
  value,
  label,
  note,
  size = "lg",
  color = "neutral",
  corner = "top-right",
  bleed = "none",
  sx,
  className,
  ...props
}: OfferSealProps) {
  const styles = offerSeal({ size, color, corner, bleed });
  return (
    <div className={styles.root({ className: withSx(sx, className) })} {...props}>
      <div className={styles.content()}>
        <span className={styles.value()}>{value}</span>
        {label ? <span className={styles.label()}>{label}</span> : null}
        {note && size !== "sm" ? <span className={styles.note()}>{note}</span> : null}
      </div>
    </div>
  );
}
