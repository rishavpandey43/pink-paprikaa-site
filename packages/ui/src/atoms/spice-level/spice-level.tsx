import type { ComponentPropsWithoutRef } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

const spiceLevel = componentVariants({
  slots: {
    root: "inline-flex items-center gap-2",
    marks: "inline-flex items-center",
    // A diamond is the brand's square mark turned 45°. Unfilled marks stay on the neutral ramp;
    // the filled ones are recoloured by `HEAT` below.
    mark: "shrink-0 rotate-45 rounded-1 bg-ink-200",
    label: "font-display font-bold text-overline uppercase tracking-overline text-text-muted",
  },
  variants: {
    /** 10 / 14 / 20px per diamond. The gap grows with the mark so the row never reads as one blob. */
    size: {
      xs: { marks: "gap-1", mark: "size-2.5" },
      sm: { marks: "gap-1-5", mark: "size-3.5" },
      md: { marks: "gap-2", mark: "size-5" },
      lg: { marks: "gap-3", mark: "size-7" },
    },
  },
  defaultVariants: { size: "md" },
});

/**
 * The heat ramp: mint → turmeric → tandoor → pink, with the brand's Hinglish names. Every filled
 * diamond takes the colour of the *level*, not of its own position, so a level reads as one signal.
 *
 * The fill class is a lookup rather than a variant because it is keyed by a numeric level; the same
 * pattern as `Text`'s line-clamp table, and it merges over the base `bg-ink-200` through
 * `componentVariants`.
 */
const HEAT = {
  1: { label: "Mild", fill: "bg-heat-1" },
  2: { label: "Medium", fill: "bg-heat-2" },
  3: { label: "Hot", fill: "bg-heat-3" },
  4: { label: "Extra Hot", fill: "bg-heat-4" },
} as const;

export interface SpiceLevelProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children">, VariantProps<typeof spiceLevel> {
  /** 1 Mild · 2 Medium · 3 Hot · 4 Extra Hot. */
  level?: 1 | 2 | 3 | 4 | undefined;
  /** How many diamonds the scale shows. Four is the whole scale; lower it only in tight rows. */
  max?: 1 | 2 | 3 | 4 | undefined;
  /**
   * Prints the heat name beside the diamonds in the overline style. Set it wherever the mark stands
   * alone — colour on its own is never allowed to carry the meaning.
   */
  hasLabel?: boolean | undefined;
}

export function SpiceLevel({
  className,
  level = 1,
  max = 4,
  hasLabel = false,
  size,
  ...props
}: SpiceLevelProps) {
  const { root, marks, mark, label } = spiceLevel({ size });
  const heat = HEAT[level];
  return (
    <span className={root({ className })} {...props}>
      <span aria-label={`Spice level: ${heat.label}`} className={marks()} role="img">
        {Array.from({ length: max }, (_, index) => (
          <span
            className={mark({ className: index < level ? heat.fill : undefined })}
            key={index}
          />
        ))}
      </span>
      {/* The group above already announces the heat, so the printed name is not read twice. */}
      {hasLabel ? (
        <span aria-hidden="true" className={label()}>
          {heat.label}
        </span>
      ) : null}
    </span>
  );
}
