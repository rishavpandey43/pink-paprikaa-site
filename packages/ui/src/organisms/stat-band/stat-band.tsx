import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { componentVariants } from "../../lib/component-variants";
import { Stat } from "../../molecules/stat/stat";

const statBand = componentVariants({
  slots: {
    // The proof band between two content sections: one flooded ground, one row of numbers.
    root: "w-full",
    inner: [
      "mx-auto grid w-full max-w-(--layout-container-max) gap-8",
      // `min(200px,100%)` is load-bearing — a bare `1fr` track keeps a min-content floor, so one
      // long label would push the row wider than a 360px screen instead of dropping a column.
      "grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))]",
      "px-(--layout-gutter-fluid) py-[clamp(40px,5vw,64px)]",
    ],
  },
});

/** Which `Stat` ink each ground takes. The ink steps have no contrast on a flooded panel. */
const STAT_TONE = { soft: "brand", brand: "inverse", ink: "inverse" } as const;

/** The three grounds the band may flood with. */
export type StatBandTone = keyof typeof STAT_TONE;

export interface StatBandItem {
  /** The number itself. Never invent one — a stat with no source is a content bug. */
  value: ReactNode;
  /** One short line under the number, sentence case and no full stop. */
  label: string;
  /** Optional second line for the detail behind the number. */
  sub?: string;
  /** Lucide glyph above the number. Set it on every item or none — a half-set row reads broken. */
  icon?: LucideIcon;
}

export interface StatBandProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /**
   * Three or four numbers. More than four reads as noise, and every one has to be checkable —
   * the band's whole job is that a guest can verify it.
   */
  stats: StatBandItem[];
  /** The ground. `soft` is the default pale pink; `brand` and `ink` flood and invert the type. */
  tone?: StatBandTone | undefined;
}

export function StatBand({ className, stats, tone = "soft", ...props }: StatBandProps) {
  const parts = statBand();
  return (
    <PatternField className={parts.root({ className })} tile={80} tone={tone} {...props}>
      <div className={parts.inner()}>
        {stats.map(({ icon, label, sub, value }) => (
          <Stat
            align="center"
            key={label}
            label={label}
            tone={STAT_TONE[tone]}
            value={value}
            // `exactOptionalPropertyTypes` forbids passing an explicit `undefined` to an optional
            // prop, so an absent glyph or sub-line is left off rather than handed through.
            {...(icon === undefined ? {} : { icon })}
            {...(sub === undefined ? {} : { sub })}
          />
        ))}
      </div>
    </PatternField>
  );
}
