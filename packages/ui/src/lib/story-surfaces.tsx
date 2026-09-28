import type { ReactNode } from "react";

import { componentVariants } from "./component-variants";

/**
 * Stories only — never exported from the barrel. Renders its children on each ground a
 * surface-aware component must survive (spec §10.2: page, alt, brand, ink, soft). Brand, ink and
 * soft set `data-surface`, exactly as Section, Card and PatternField do in product code.
 *
 * `grounds` narrows the rows to the grounds a component is designed for (R67: the choice controls
 * have no on-brand skin, so they leave `brand` out). A function child renders per ground, for a
 * component whose prop changes with it (ProgressBar's `tone="inverse"` on brand).
 */
const GROUNDS = [
  { ground: "page", surface: undefined },
  { ground: "alt", surface: undefined },
  { ground: "brand", surface: "brand" },
  { ground: "ink", surface: "ink" },
  { ground: "soft", surface: "soft" },
] as const;

export type Ground = (typeof GROUNDS)[number]["ground"];

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

export function OnSurfaces({
  grounds,
  children,
}: {
  grounds?: readonly Ground[] | undefined;
  children: ReactNode | ((ground: Ground) => ReactNode);
}) {
  const shown = grounds === undefined ? GROUNDS : GROUNDS.filter((g) => grounds.includes(g.ground));
  return (
    <div className="grid w-full gap-3">
      {shown.map(({ ground, surface }) => {
        const slots = stage({ ground });
        return (
          <div key={ground} data-surface={surface} className={slots.row()}>
            <span className={slots.label()}>{ground}</span>
            {typeof children === "function" ? children(ground) : children}
          </div>
        );
      })}
    </div>
  );
}
