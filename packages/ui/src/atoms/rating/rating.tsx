import type { ComponentPropsWithoutRef } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { SYMBOL_PATHS, SYMBOL_VIEW_BOX } from "../logo/logo-paths";

const rating = componentVariants({
  slots: {
    root: "inline-flex items-center gap-2",
    track: "inline-flex items-center",
    /** One score unit. Everything inside it is absolutely placed, so it needs a fixed box. */
    unit: "relative block shrink-0",
    /** A full-size layer inside the unit. The clip below shrinks, this never does. */
    layer: "absolute top-0 left-0 grid place-items-center",
    /** The screen-space window that makes 4.3 fill exactly 30% of the fifth mark's width. */
    clip: "absolute inset-y-0 left-0 overflow-hidden",
    diamond: "grid place-items-center",
    glyph: "",
    score: "font-display font-bold text-text-heading tabular-nums",
    reviews: "font-body text-caption text-text-subtle tabular-nums",
  },
  variants: {
    size: {
      xs: { unit: "size-3", layer: "size-3", track: "gap-1", score: "text-caption" },
      sm: { unit: "size-4", layer: "size-4", track: "gap-1", score: "text-body2" },
      md: { unit: "size-6", layer: "size-6", track: "gap-1-5", score: "text-subtitle2" },
      lg: { unit: "size-8", layer: "size-8", track: "gap-2", score: "text-subtitle1" },
    },
    /**
     * `diamond` is the default score mark: a rotated square carrying the brand symbol, counter
     * rotated so the symbol itself stays upright. `symbol` drops the square and shows the bare
     * mark — the treatment review cards and marketing artwork use.
     *
     * A square of side s rotated 45deg has a bounding box of s * sqrt(2), so the square is sized
     * at 1 / sqrt(2) of the unit and the diamond lands exactly inside it. That is what lets the
     * partial fill clip in screen space without any offset arithmetic.
     */
    variant: {
      diamond: {
        diamond: "size-[70.711%] rotate-45 rounded-1",
        glyph: "size-[78%] -rotate-45",
      },
      symbol: { diamond: "size-full", glyph: "size-full" },
    },
    isFilled: { true: {}, false: {} },
  },
  compoundVariants: [
    {
      variant: "diamond",
      isFilled: false,
      class: { diamond: "bg-ink-200 text-brand-primary", glyph: "opacity-50" },
    },
    {
      variant: "diamond",
      isFilled: true,
      class: { diamond: "bg-brand-primary text-text-on-brand", glyph: "opacity-60" },
    },
    {
      variant: "symbol",
      isFilled: false,
      class: { diamond: "text-brand-primary", glyph: "opacity-25" },
    },
    {
      variant: "symbol",
      isFilled: true,
      class: { diamond: "text-brand-primary", glyph: "opacity-100" },
    },
    // Below 14px the embedded mark stops resolving, so its opacity steps up to compensate.
    { size: "sm", variant: "diamond", isFilled: false, class: { glyph: "opacity-80" } },
    { size: "sm", variant: "diamond", isFilled: true, class: { glyph: "opacity-85" } },
  ],
  defaultVariants: { size: "md", variant: "diamond", isFilled: false },
});

/** The brand symbol, inheriting whatever colour the mark around it sets. */
function SymbolMark({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="currentColor"
      viewBox={SYMBOL_VIEW_BOX}
      xmlns="http://www.w3.org/2000/svg"
    >
      {SYMBOL_PATHS.map((d) => (
        <path d={d} key={d} />
      ))}
    </svg>
  );
}

export interface RatingProps
  extends
    Omit<ComponentPropsWithoutRef<"span">, "children">,
    Omit<VariantProps<typeof rating>, "isFilled"> {
  /** The score. Halves and any other fraction are honoured — 4.3 fills 30% of the fifth mark. */
  value?: number | undefined;
  /** How many marks the scale has. Five everywhere on the site; the prop exists for fixtures. */
  max?: number | undefined;
  /** Review count, rendered in brackets with Indian digit grouping — (2,184). */
  count?: number | undefined;
  /** Set false to drop the numeric score and leave the marks to speak for themselves. */
  hasValueLabel?: boolean | undefined;
}

export function Rating({
  className,
  size,
  variant,
  value = 5,
  max = 5,
  count,
  hasValueLabel = true,
  ...props
}: RatingProps) {
  const { root, track, unit, layer, clip, diamond, glyph, score, reviews } = rating({
    size,
    variant,
  });
  const safeMax = Math.max(1, Math.round(max));
  const safeValue = Math.min(safeMax, Math.max(0, value));
  const label =
    count === undefined
      ? `Rated ${safeValue.toFixed(1)} out of ${safeMax.toString()}`
      : `Rated ${safeValue.toFixed(1)} out of ${safeMax.toString()} from ${count.toLocaleString("en-IN")} reviews`;

  return (
    <span aria-label={label} className={root({ className })} role="img" {...props}>
      <span aria-hidden="true" className={track()}>
        {Array.from({ length: safeMax }, (_, index) => {
          const fill = Math.min(1, Math.max(0, safeValue - index));
          return (
            <span className={unit()} key={index}>
              <span className={layer()}>
                <span className={diamond({ isFilled: false })}>
                  <SymbolMark className={glyph({ isFilled: false })} />
                </span>
              </span>
              {fill > 0 ? (
                <span className={clip()} style={{ width: `${(fill * 100).toFixed(3)}%` }}>
                  <span className={layer()}>
                    <span className={diamond({ isFilled: true })}>
                      <SymbolMark className={glyph({ isFilled: true })} />
                    </span>
                  </span>
                </span>
              ) : null}
            </span>
          );
        })}
      </span>
      {hasValueLabel ? (
        <span aria-hidden="true" className={score()}>
          {safeValue.toFixed(1)}
        </span>
      ) : null}
      {count === undefined ? null : (
        <span aria-hidden="true" className={reviews()}>
          ({count.toLocaleString("en-IN")})
        </span>
      )}
    </span>
  );
}
