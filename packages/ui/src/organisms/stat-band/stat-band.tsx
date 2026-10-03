import type { ReactNode } from "react";

import type { IconComponent } from "../../atoms/icon/icon";
import type { BaseProps } from "../../lib/common-props";

import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { SURFACE_DATA } from "../../lib/common-props";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";
import { Stat } from "../../molecules/stat/stat";

export interface StatBandItem {
  value: ReactNode;
  label: ReactNode;
  sub?: ReactNode;
  icon?: IconComponent | undefined;
}

const statBand = componentVariants({
  slots: {
    root: "relative",
    // A decorative layer only: the band's own ground (or a caller's) shows through it.
    pattern: "absolute inset-0 bg-transparent",
    grid: "relative container-page grid autogrid-min-sm gap-stat-band-gap py-stat-band-y",
  },
  variants: {
    surface: {
      soft: { root: "bg-surface-brand-soft" },
      brand: { root: "bg-surface-brand" },
      ink: { root: "bg-surface-inverse" },
    },
  },
  defaultVariants: { surface: "soft" },
});

type StatBandSurface = NonNullable<VariantProps<typeof statBand>["surface"]>;

/** Numbers read in brand pink on the soft field and white on the flooded ones (design system). */
const STAT_COLOR: Readonly<Record<StatBandSurface, "brand" | "inverse">> = {
  soft: "brand",
  brand: "inverse",
  ink: "inverse",
};

export interface StatBandProps
  extends BaseProps<"section">, Pick<VariantProps<typeof statBand>, "surface"> {
  /** Three or four real, verifiable numbers — more reads as noise. */
  stats: StatBandItem[];
}

/** A proof band of big numbers between two content sections, over the tiled diamond. */
export function StatBand({ stats, surface = "soft", sx, className, ...props }: StatBandProps) {
  const slots = statBand({ surface });
  return (
    <section
      data-surface={SURFACE_DATA[surface]}
      className={slots.root({ className: withSx(sx, className) })}
      {...props}
    >
      <PatternField aria-hidden surface={surface} tile={80} className={slots.pattern()} />
      <ul role="list" className={slots.grid()}>
        {stats.map((stat, index) => (
          <li key={index}>
            <Stat {...stat} color={STAT_COLOR[surface]} align="center" />
          </li>
        ))}
      </ul>
    </section>
  );
}
