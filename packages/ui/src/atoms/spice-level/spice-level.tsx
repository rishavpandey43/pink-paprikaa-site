import type { ComponentProps } from "react";

import { BrandDiamond, type BrandDiamondSize } from "../../lib/brand-diamond";
import type { SxProp } from "../../lib/common-props";
import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";

type Level = 1 | 2 | 3 | 4;
type SpiceSize = "sm" | "md" | "lg";

/** Plain heat names a guest already knows (readme §2: controls never carry a word to decode). */
const SPICE_LABEL: Readonly<Record<Level, string>> = {
  1: "Mild",
  2: "Medium",
  3: "Hot",
  4: "Extra Hot",
};

/** Filled diamonds take the heat colour of the level: mint → turmeric → tandoor → pink. */
const HEAT_FILL = { 1: "heat-1", 2: "heat-2", 3: "heat-3", 4: "heat-4" } as const;

/** sm is the menu size (MenuItemRow, MenuItemCard); md the design system's default. */
const DIAMOND_SIZE: Readonly<Record<SpiceSize, BrandDiamondSize>> = {
  sm: "12px",
  md: "14px",
  lg: "20px",
};

const spiceLevel = componentVariants({
  slots: {
    root: "inline-flex items-center gap-2",
    diamonds: "inline-flex items-center gap-1",
    label: "font-display text-overline text-text-muted uppercase",
  },
});

export interface SpiceLevelProps extends ComponentProps<"span">, SxProp {
  level: Level;
  /** = 4 */
  max?: 4 | undefined;
  /** Show Mild / Medium / Hot / Extra Hot beside the diamonds. */
  hasLabel?: boolean | undefined;
  /** sm 12 · md 14 · lg 20px diamonds. = "md" */
  size?: SpiceSize | undefined;
}

/** Heat from the brand's diamond motif — the sanctioned alternative to a chilli emoji. */
export function SpiceLevel({
  level,
  max = 4,
  hasLabel = false,
  size = "md",
  sx,
  className,
  ...props
}: SpiceLevelProps) {
  const styles = spiceLevel();
  return (
    <span
      role="img"
      aria-label={`Spice level ${String(level)} of ${String(max)}`}
      className={styles.root({ className: withSx(sx, className) })}
      {...props}
    >
      <span className={styles.diamonds()}>
        {Array.from({ length: max }, (_, index) => (
          <BrandDiamond
            key={index}
            size={DIAMOND_SIZE[size]}
            fill={index < level ? HEAT_FILL[level] : "empty"}
          />
        ))}
      </span>
      {hasLabel ? <span className={styles.label()}>{SPICE_LABEL[level]}</span> : null}
    </span>
  );
}
