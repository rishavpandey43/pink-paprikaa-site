import type { ComponentPropsWithoutRef } from "react";

import { Card } from "../../atoms/card/card";
import { Logo } from "../../atoms/logo/logo";
import { ProgressBar } from "../../atoms/progress-bar/progress-bar";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const loyaltyCard = componentVariants({
  slots: {
    root: "flex items-center gap-4",
    // `min-w-0` so a long reward name shrinks the column instead of pushing the stamps off screen.
    body: "grid min-w-0 flex-1 gap-2",
    // The headline is display-face, a pairing no step of the `Text` ramp carries, so the face and
    // weight are set here and the ramp only supplies the size (see `HEADLINE_VARIANT`).
    headline: "font-display font-bold",
  },
  variants: {
    /**
     * `feature` is the pale pink card the account screen uses. `brand` is the flooded pink one —
     * the app home's single loud element, so never put two on one screen.
     */
    variant: {
      feature: { headline: "text-text-brand" },
      brand: { headline: "text-text-on-brand" },
    },
  },
  defaultVariants: { variant: "feature" },
});

/** The symbol colourway and the stamp tone each skin pairs with. */
const SKIN = {
  feature: { logoTone: "brand", progressTone: "brand" },
  brand: { logoTone: "white", progressTone: "inverse" },
} as const;

export interface LoyaltyCardProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children">, VariantProps<typeof loyaltyCard> {
  /** Stamps earned so far. Clamped into `0…goal`, so a stale count cannot overflow the track. */
  visits?: number | undefined;
  /** Stamps the reward costs. It is also the number of segments the track draws. */
  goal?: number | undefined;
  /**
   * What the guest earns, lowercase and article-first where one is needed: "chai", "a kulfi". It
   * is dropped into a generated sentence, so it must read naturally mid-line.
   */
  reward?: string | undefined;
}

export function LoyaltyCard({
  className,
  goal = 6,
  reward = "chai",
  variant = "feature",
  visits = 0,
  ...props
}: LoyaltyCardProps) {
  const parts = loyaltyCard({ variant });
  const safeGoal = Math.max(1, Math.round(goal));
  const safeVisits = Math.min(safeGoal, Math.max(0, Math.round(visits)));
  const remaining = safeGoal - safeVisits;
  // Copy is generated rather than templated so it reads naturally at one, many and none remaining.
  const headline =
    remaining === 0
      ? `Your ${reward} is on us.`
      : `${remaining.toString()} more ${remaining === 1 ? "visit" : "visits"} and ${reward} is on us.`;
  const { logoTone, progressTone } = SKIN[variant];

  return (
    <Card className={parts.root({ className })} padding="sm" variant={variant} {...props}>
      <Logo label="" size="md" tone={logoTone} variant="symbol" />
      <div className={parts.body()}>
        <Text className={parts.headline()} variant="body2">
          {headline}
        </Text>
        {/*
          Segmented, never a percentage bar: a stamp card counts visits, and a guest reads "four of
          six stamps" off the track far faster than they read "67%".
        */}
        <ProgressBar
          aria-label={`${safeVisits.toString()} of ${safeGoal.toString()} visits`}
          segments={safeGoal}
          size="sm"
          tone={progressTone}
          value={safeVisits}
        />
      </div>
    </Card>
  );
}
