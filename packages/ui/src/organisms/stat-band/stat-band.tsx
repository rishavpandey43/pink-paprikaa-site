import type { ComponentProps, ReactNode } from "react";

import type { IconComponent } from "../../atoms/icon/icon";

import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
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
    tone: {
      soft: { root: "bg-surface-brand-soft" },
      brand: { root: "bg-surface-brand" },
      ink: { root: "bg-surface-inverse" },
    },
  },
  defaultVariants: { tone: "soft" },
});

type StatBandTone = NonNullable<VariantProps<typeof statBand>["tone"]>;

/** Numbers read in brand pink on the soft field and white on the flooded ones (design system). */
const STAT_COLOR: Readonly<Record<StatBandTone, "brand" | "inverse">> = {
  soft: "brand",
  brand: "inverse",
  ink: "inverse",
};

export interface StatBandProps
  extends ComponentProps<"section">, Pick<VariantProps<typeof statBand>, "tone"> {
  /** Three or four real, verifiable numbers — more reads as noise. */
  stats: StatBandItem[];
}

/** A proof band of big numbers between two content sections, over the tiled diamond. */
export function StatBand({ stats, tone = "soft", className, ...props }: StatBandProps) {
  const slots = statBand({ tone });
  return (
    <section data-surface={tone} className={slots.root({ className })} {...props}>
      <PatternField aria-hidden surface={tone} tile={80} className={slots.pattern()} />
      <ul role="list" className={slots.grid()}>
        {stats.map((stat, index) => (
          <li key={index}>
            <Stat {...stat} color={STAT_COLOR[tone]} align="center" />
          </li>
        ))}
      </ul>
    </section>
  );
}
