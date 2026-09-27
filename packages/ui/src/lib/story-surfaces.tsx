import type { ReactNode } from "react";

import { componentVariants } from "./component-variants";

/**
 * Stories only — never exported from the barrel. Renders its children on each ground a
 * surface-aware component must survive (spec §10.2: page, alt, brand, ink, soft). Brand, ink and
 * soft set `data-surface`, exactly as Section, Card and PatternField do in product code.
 */
const GROUNDS = [
  { ground: "page", surface: undefined },
  { ground: "alt", surface: undefined },
  { ground: "brand", surface: "brand" },
  { ground: "ink", surface: "ink" },
  { ground: "soft", surface: "soft" },
] as const;

const stage = componentVariants({
  slots: {
    row: "flex flex-wrap items-center gap-3 rounded-lg p-4",
    label: "w-12 shrink-0 font-mono text-mono text-text-subtle",
  },
  variants: {
    ground: {
      page: { row: "bg-surface-page" },
      alt: { row: "bg-surface-page-alt" },
      brand: { row: "bg-surface-brand" },
      ink: { row: "bg-surface-inverse" },
      soft: { row: "bg-surface-brand-soft" },
    },
  },
});

export function OnSurfaces({ children }: { children: ReactNode }) {
  return (
    <div className="grid w-full gap-3">
      {GROUNDS.map(({ ground, surface }) => {
        const slots = stage({ ground });
        return (
          <div key={ground} data-surface={surface} className={slots.row()}>
            <span className={slots.label()}>{ground}</span>
            {children}
          </div>
        );
      })}
    </div>
  );
}
