import type { ComponentPropsWithoutRef } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

const offerSeal = componentVariants({
  slots: {
    // A rotated square — the brand's diamond, at badge scale. Never a circular starburst, never a
    // gradient: the seal is one flat fill and nothing else.
    root: "grid shrink-0 rotate-45 place-items-center shadow-elevation3",
    // Counter-rotated so the number stays upright inside the diamond.
    content: "grid -rotate-45 place-items-center gap-0-5 text-center",
    /**
     * Raw type classes rather than the `Text` atom: the seal spans a 128px badge to a 280px canvas
     * mark, and no single step of the screen ramp covers both ends of that. The face and weight
     * are the display ramp's, only the size steps.
     */
    value: "font-display font-extrabold leading-display1 tracking-display1",
    label: "font-display font-bold uppercase leading-overline tracking-overline",
    note: "font-body leading-caption",
  },
  variants: {
    /** Three flat fills. `turmeric` is the only one that is not pink, for a non-price offer. */
    tone: {
      light: {
        root: "bg-surface-card",
        value: "text-text-link",
        label: "text-text-link",
        note: "text-text-muted",
      },
      brand: {
        root: "bg-brand-primary",
        value: "text-text-on-brand",
        label: "text-text-on-brand",
        note: "text-text-on-brand/80",
      },
      turmeric: {
        root: "bg-turmeric",
        value: "text-text-heading",
        label: "text-text-heading",
        note: "text-text-body",
      },
    },
    /** Diagonal 128 / 192 / 280px. `lg` is the canvas mark; `sm` fits a 300px MPU. */
    size: {
      sm: {
        root: "size-32 rounded-4",
        value: "text-h1",
        label: "text-overline",
        note: "text-overline",
      },
      md: {
        root: "size-48 rounded-5",
        value: "text-display2",
        label: "text-overline",
        note: "text-caption",
      },
      lg: {
        root: "size-70 rounded-5",
        value: "text-canvas-h2",
        label: "text-canvas-overline",
        note: "text-subtitle2",
      },
    },
    /**
     * Hangs the seal off a corner of the nearest positioned ancestor. The offset is an 18% self
     * translate rather than a pixel bleed, so it is clamped by construction — the number reaches
     * about 32% of the diagonal from the centre, and anything past 18% would clip it.
     */
    position: {
      none: {},
      topLeft: { root: "absolute top-0 left-0 -translate-x-[18%] -translate-y-[18%]" },
      topRight: { root: "absolute top-0 right-0 translate-x-[18%] -translate-y-[18%]" },
      bottomLeft: { root: "absolute bottom-0 left-0 -translate-x-[18%] translate-y-[18%]" },
      bottomRight: { root: "absolute right-0 bottom-0 translate-x-[18%] translate-y-[18%]" },
    },
  },
  defaultVariants: { tone: "light", size: "md", position: "none" },
});

export interface OfferSealProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children">, VariantProps<typeof offerSeal> {
  /** The number, and the loudest thing on the artboard — "50%", "₹99", "1+1". */
  value: string;
  /** One short word under it, set as an overline: "Off", "Only", "Free". */
  label?: string | undefined;
  /** A line of small print under the label — a deadline, or what the offer applies to. */
  note?: string | undefined;
}

export function OfferSeal({
  className,
  label,
  note,
  position,
  size,
  tone,
  value,
  ...props
}: OfferSealProps) {
  const parts = offerSeal({ position, size, tone });
  return (
    <div className={parts.root({ className })} {...props}>
      <div className={parts.content()}>
        <span className={parts.value()}>{value}</span>
        {label === undefined ? null : <span className={parts.label()}>{label}</span>}
        {note === undefined ? null : <span className={parts.note()}>{note}</span>}
      </div>
    </div>
  );
}
