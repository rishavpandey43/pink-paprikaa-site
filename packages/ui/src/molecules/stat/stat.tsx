import type { ComponentProps, ReactNode } from "react";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

const stat = componentVariants({
  slots: {
    root: "grid gap-1",
    icon: "mb-1",
    value: "font-display text-stat-value",
    label: "font-body text-stat-label font-medium text-text-body",
    sub: "text-stat-sub text-text-subtle",
  },
  variants: {
    tone: {
      ink: { icon: "text-stat-icon", value: "text-text-heading" },
      brand: { icon: "text-stat-icon", value: "text-text-brand" },
      inverse: { icon: "text-white-alpha-70", value: "text-text-on-inverse" },
    },
    align: {
      start: { root: "justify-items-start text-start" },
      center: { root: "justify-items-center text-center" },
    },
  },
  defaultVariants: { tone: "ink", align: "start" },
});

export interface StatProps extends ComponentProps<"div"> {
  value: ReactNode;
  /** One short line, sentence case, no full stop. */
  label: ReactNode;
  sub?: ReactNode;
  icon?: IconComponent | undefined;
  /** Colours the number: heading ink, brand pink, or white on a dark band. */
  tone?: "ink" | "brand" | "inverse" | undefined;
  align?: "start" | "center" | undefined;
}

/** A single big fact — outlet counts, spices ground, years open. At most 3–4 in a row; never invent numbers. */
export function Stat({
  value,
  label,
  sub,
  icon,
  tone = "ink",
  align = "start",
  className,
  ...props
}: StatProps) {
  const styles = stat({ tone, align });

  return (
    <div className={styles.root({ className })} {...props}>
      {icon === undefined ? null : <Icon icon={icon} size="lg" className={styles.icon()} />}
      <span className={styles.value()}>{value}</span>
      <span className={styles.label()}>{label}</span>
      {sub === undefined || sub === null ? null : <span className={styles.sub()}>{sub}</span>}
    </div>
  );
}
