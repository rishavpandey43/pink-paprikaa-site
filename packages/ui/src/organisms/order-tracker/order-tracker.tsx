import type { ComponentPropsWithoutRef } from "react";

import { Badge } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import { Card } from "../../atoms/card/card";
import { Divider } from "../../atoms/divider/divider";
import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { PriceTag } from "../../atoms/price-tag/price-tag";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { StepTracker, type TrackerStep } from "../../molecules/step-tracker/step-tracker";

const orderTracker = componentVariants({
  slots: {
    root: "flex w-full min-w-0 flex-col bg-surface-page",
    /** The flooded pink header — the one brand-coloured panel on the screen. */
    header: "shrink-0",
    headerInner: "flex flex-col items-start gap-3 px-5 pt-4.5 pb-7.5",
    /** Space Mono, so the order code can be read out over a counter without ambiguity. */
    code: "mt-1-5",
    body: "flex min-w-0 flex-col gap-3.5 px-5 py-5",
    rule: "my-1-5",
    paid: "flex min-w-0 items-center justify-between gap-3",
    paidLabel: "min-w-0 truncate font-body text-body2 leading-body2 text-text-muted",
  },
  variants: {
    /** `flush` fills the app screen it is mounted in; `card` rounds and clips for a page. */
    variant: {
      flush: {},
      card: { root: "overflow-hidden rounded-4 border border-border-subtle" },
    },
  },
  defaultVariants: { variant: "flush" },
});

/** The kitchen's three moments, in the brand's voice — never a system status string. */
const DEFAULT_STEPS: TrackerStep[] = [
  { label: "Order in", note: "Kitchen's on it." },
  { label: "On the tandoor", note: "The paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2, ask for Pink Paprikaa." },
];

export interface OrderTrackerProps
  extends Omit<ComponentPropsWithoutRef<"div">, "title">, VariantProps<typeof orderTracker> {
  /** The steps the kitchen works through. A bare string is shorthand for a step with no note. */
  steps?: (string | TrackerStep)[] | undefined;
  /** Which step the order is on, counting from 0. The last one is what makes it "Ready". */
  current?: number | undefined;
  /** Order code, uppercase and without the hash — it is printed with one. */
  code?: string | undefined;
  /** The outlet handling it, in caps, matching the code line's treatment. */
  outlet?: string | undefined;
  /** Amount already paid, in whole rupees. */
  total?: number | undefined;
  /** How it was paid, e.g. "UPI", "Card", "Cash". */
  payment?: string | undefined;
  /** Fires from the one action at the foot. Leave it off and no button renders. */
  onDone?: (() => void) | undefined;
  /** Label for that action. Title Case. */
  doneLabel?: string | undefined;
}

/**
 * The screen a guest watches while the kitchen cooks: a flooded pink header carrying the moment
 * they are in, the vertical `StepTracker` under it, and what they paid. Step copy is the brand's
 * voice — "Kitchen's on it." — never a system status.
 */
export function OrderTracker({
  className,
  code = "PPK-4821",
  current = 0,
  doneLabel = "Back to Home",
  onDone,
  outlet = "SECTOR 57",
  payment = "UPI",
  steps = DEFAULT_STEPS,
  total = 0,
  variant,
  ...props
}: OrderTrackerProps) {
  const slots = orderTracker({ variant });

  const index = steps.length === 0 ? 0 : Math.min(Math.max(current, 0), steps.length - 1);
  const entry = steps[index];
  const step = typeof entry === "string" ? { label: entry } : entry;
  const isReady = steps.length > 0 && index === steps.length - 1;

  return (
    <div className={slots.root({ class: className })} {...props}>
      <PatternField className={slots.header()} tile={58} tone="brand">
        <div className={slots.headerInner()}>
          <Badge tone="ink">{isReady ? "Ready" : "Preparing"}</Badge>
          {step === undefined ? null : (
            <>
              <Text as="h2" tone="onBrand" variant="h2">
                {step.label}
              </Text>
              {step.note === undefined ? null : (
                <Text as="p" tone="onBrand" variant="body1">
                  {step.note}
                </Text>
              )}
            </>
          )}
          <Text as="p" className={slots.code()} tone="onBrand" variant="mono">
            {`ORDER #${code} · ${outlet}`}
          </Text>
        </div>
      </PatternField>

      <div className={slots.body()}>
        <StepTracker current={index} label="Order progress" steps={steps} />
        <Divider className={slots.rule()} variant="diamond" />
        <Card padding="sm" variant="quiet">
          <div className={slots.paid()}>
            <span className={slots.paidLabel()}>{`Paid · ${payment}`}</span>
            <PriceTag amount={total} size="sm" />
          </div>
        </Card>
        {onDone === undefined ? null : (
          <Button isFullWidth onClick={onDone} variant="secondary">
            {doneLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
