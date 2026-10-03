import type { ComponentProps, ReactNode } from "react";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { Card } from "../../atoms/card/card";
import { Divider } from "../../atoms/divider/divider";
import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { StepTracker, type TrackerStep } from "../../molecules/step-tracker/step-tracker";

const orderTracker = componentVariants({
  slots: {
    root: "flex flex-col",
    header: "px-5 pt-4.5 pb-7.5",
    status: "flex flex-col items-start gap-1.5",
    title: "mt-1.5",
    code: "mt-4.5 uppercase",
    body: "grid gap-3.5 p-5",
    divider: "my-1.5",
    receipt: "flex justify-between gap-3",
    total: "font-display",
  },
  variants: {
    variant: {
      flush: { root: "min-h-0 flex-1 overflow-y-auto" },
      card: {
        root: "overflow-hidden rounded-xl border border-border-subtle bg-surface-card shadow-1",
      },
    },
  },
  defaultVariants: { variant: "flush" },
});

export interface OrderTrackerProps
  extends ComponentProps<"section">, Pick<VariantProps<typeof orderTracker>, "variant"> {
  /** Brand-voice steps ("Kitchen's on it."), never system status. */
  steps: TrackerStep[];
  /** Index of the current step; clamped to the steps given. */
  current: number;
  /** Order code, uppercase, without the hash. */
  code: string;
  /** The word before the code: "Order #PPK-4821". */
  codeLabel?: string | undefined;
  outlet?: string | undefined;
  total?: number | undefined;
  /** The payment method, e.g. "UPI" — the line reads "Paid · UPI". */
  payment?: string | undefined;
  /** The word before the method. */
  paymentLabel?: string | undefined;
  /** The step list's accessible name. */
  progressLabel?: string | undefined;
  /** The status chip in the header, e.g. `<Badge tone="ink">Preparing</Badge>`. */
  badge?: ReactNode;
  /** Usually one full-width secondary Button ("Back to Home"). */
  action?: ReactNode;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The screen a guest watches while the kitchen cooks: a flooded-pink header announcing the
 * current step (a polite live region, so updates are read out), the step tracker and the receipt.
 */
export function OrderTracker({
  steps,
  current,
  code,
  codeLabel = "Order",
  outlet,
  total,
  payment,
  paymentLabel = "Paid",
  progressLabel = "Order progress",
  badge,
  action,
  variant = "flush",
  headingLevel = 2,
  className,
  ...props
}: OrderTrackerProps) {
  const slots = orderTracker({ variant });
  const index = Math.min(Math.max(current, 0), steps.length - 1);
  const step = steps[index];
  const hasReceipt = payment !== undefined || total !== undefined;
  return (
    <section
      data-surface={variant === "card" ? "light" : undefined}
      className={slots.root({ className })}
      {...props}
    >
      <PatternField tone="brand" tile={56} className={slots.header()}>
        <div role="status" className={slots.status()}>
          {badge}
          <Text as={headingTag(headingLevel)} variant="h2" className={slots.title()}>
            {step?.label}
          </Text>
          {step?.note ? (
            <Text as="div" tone="muted">
              {step.note}
            </Text>
          ) : null}
        </div>
        <Text as="div" variant="mono" tone="muted" className={slots.code()}>
          {codeLabel} #{code}
          {outlet ? ` · ${outlet}` : null}
        </Text>
      </PatternField>
      <div className={slots.body()}>
        <StepTracker steps={steps} current={index} aria-label={progressLabel} />
        <Divider variant="diamond" className={slots.divider()} />
        {hasReceipt ? (
          <Card variant="quiet" padding="sm">
            <div className={slots.receipt()}>
              <Text as="span" variant="body-sm" tone="muted">
                {payment === undefined ? null : `${paymentLabel} · ${payment}`}
              </Text>
              {total === undefined ? null : (
                <Text as="span" variant="body-sm" weight="bold" className={slots.total()}>
                  {formatRupees(total)}
                </Text>
              )}
            </div>
          </Card>
        ) : null}
        {action}
      </div>
    </section>
  );
}
