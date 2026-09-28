import type { ComponentProps, ReactNode } from "react";

import { Card } from "../../atoms/card/card";
import { Logo } from "../../atoms/logo/logo";
import { ProgressBar } from "../../atoms/progress-bar/progress-bar";
import { componentVariants } from "../../lib/component-variants";

const loyaltyCard = componentVariants({
  slots: {
    root: "flex items-center gap-3.5",
    mark: "w-8.5 shrink-0",
    body: "grid min-w-0 flex-1 gap-2",
    headline: "m-0 max-w-none font-display text-body-sm font-bold text-text-heading",
  },
});

export interface LoyaltyCardProps extends ComponentProps<"div"> {
  visits: number;
  goal: number;
  /** What the guest earns, lowercase: "chai", "a kulfi". */
  reward: string;
  variant?: "feature" | "brand" | undefined;
  /** Replaces the generated sentence. */
  headline?: ReactNode | undefined;
}

function assertCount(value: number, minimum: number, name: string): void {
  if (!Number.isInteger(value) || value < minimum) {
    throw new RangeError(
      `LoyaltyCard: ${name} must be a whole number ≥ ${String(minimum)}, got ${String(value)}`
    );
  }
}

/** Design-system copy: reads naturally at many, one and zero visits left. */
function defaultHeadline(remaining: number, reward: string): string {
  if (remaining === 0) return `Your ${reward} is on us.`;
  const visits = remaining === 1 ? "visit" : "visits";
  return `${String(remaining)} more ${visits} and ${reward} is on us.`;
}

/** The loyalty stamp card on the app home and account screen. Segmented progress only. */
export function LoyaltyCard({
  visits,
  goal,
  reward,
  variant = "feature",
  headline,
  className,
  ...props
}: LoyaltyCardProps) {
  assertCount(goal, 1, "goal");
  assertCount(visits, 0, "visits");
  const stamped = Math.min(visits, goal);
  const isBrand = variant === "brand";
  const styles = loyaltyCard();

  return (
    <Card variant={variant} padding="sm" className={styles.root({ className })} {...props}>
      <Logo
        variant="symbol"
        tone={isBrand ? "white" : "pink"}
        isDecorative
        className={styles.mark()}
      />
      <div className={styles.body()}>
        <p className={styles.headline()}>{headline ?? defaultHeadline(goal - stamped, reward)}</p>
        <ProgressBar
          value={stamped}
          max={goal}
          segments={goal}
          label={`${String(stamped)} of ${String(goal)} visits`}
          isLabelHidden
          tone={isBrand ? "inverse" : "brand"}
          size="sm"
        />
      </div>
    </Card>
  );
}
