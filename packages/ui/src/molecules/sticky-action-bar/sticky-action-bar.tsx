import type { ComponentProps, ReactNode } from "react";

import { componentVariants } from "../../lib/component-variants";

const stickyActionBar = componentVariants({
  slots: {
    root: "sticky bottom-dock-clearance z-raised mt-3 flex items-center justify-between gap-3 rounded-pill bg-surface-inverse py-2 pr-2 pl-5 text-text-body shadow-4",
    summary: "flex min-w-0 flex-col",
    amount: "font-display text-sticky-action-bar-amount text-text-heading",
    caption: "truncate text-caption text-text-muted",
    action: "shrink-0",
  },
  variants: {
    hideFrom: { lg: { root: "lg:hidden" }, never: {} },
  },
});

export interface StickyActionBarProps extends ComponentProps<"div"> {
  /** The running total, formatted. */
  amount: ReactNode;
  /** One line under it; truncates rather than wrapping. */
  caption?: ReactNode | undefined;
  /** The primary action (a Button). */
  action: ReactNode;
  /** `lg`: hidden once the calculator is two-column. `never`: always shown. */
  hideFrom?: "lg" | "never" | undefined;
}

/** The calculators' ink pill: total, a caption and the send action, stuck above the mobile dock. */
export function StickyActionBar({
  amount,
  caption,
  action,
  hideFrom = "lg",
  className,
  ...props
}: StickyActionBarProps) {
  const styles = stickyActionBar({ hideFrom });
  return (
    <div data-surface="ink" className={styles.root({ className })} {...props}>
      <div className={styles.summary()}>
        <span className={styles.amount()}>{amount}</span>
        {caption ? <span className={styles.caption()}>{caption}</span> : null}
      </div>
      <div className={styles.action()}>{action}</div>
    </div>
  );
}
