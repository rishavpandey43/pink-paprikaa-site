import type { ComponentPropsWithoutRef } from "react";

import { Check } from "lucide-react";

import { Icon } from "../../atoms/icon/icon";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const stepTracker = componentVariants({
  slots: {
    root: "flex w-full min-w-0 p-0 list-none",
    step: "flex min-w-0",
    // 22px brand diamond: a square turned 45°, with the check laid back over it upright.
    marker: "relative mt-0.5 grid size-5.5 shrink-0 place-items-center",
    diamond: [
      "absolute inset-0 rotate-45 rounded-1",
      "transition-colors duration-(--duration-base) ease-out",
    ],
    check: "relative",
    bar: "h-1.5 w-full shrink-0 rounded-6 transition-colors duration-(--duration-base) ease-out",
    body: "flex min-w-0 flex-col gap-0-5",
    label: "font-display",
    note: "",
  },
  variants: {
    /** `vertical` is order tracking, `horizontal` is checkout progress. */
    orientation: {
      vertical: { root: "flex-col gap-3.5", step: "flex-row items-start gap-3.5" },
      horizontal: { root: "flex-row gap-2", step: "flex-1 flex-col gap-2" },
    },
    /** `inverse` is the white colourway, for a brand-flooded panel or a dark photograph. */
    tone: { light: {}, inverse: {} },
    /** Derived from `current`, not passed — a step is behind it, on it, or ahead of it. */
    variant: {
      done: { label: "font-medium" },
      current: { label: "font-bold" },
      upcoming: { label: "font-medium" },
    },
  },
  compoundVariants: [
    {
      tone: "light",
      variant: "upcoming",
      class: {
        diamond: "bg-ink-200",
        bar: "bg-ink-200",
        label: "text-text-subtle",
        note: "text-text-subtle",
      },
    },
    {
      tone: "light",
      variant: "done",
      class: {
        diamond: "bg-brand-primary",
        bar: "bg-brand-primary",
        check: "text-text-on-brand",
        label: "text-text-heading",
        note: "text-text-muted",
      },
    },
    {
      tone: "light",
      variant: "current",
      class: {
        diamond: "bg-brand-primary",
        bar: "bg-brand-primary",
        label: "text-text-heading",
        note: "text-text-muted",
      },
    },
    {
      tone: "inverse",
      variant: "upcoming",
      class: {
        diamond: "bg-glass-white",
        bar: "bg-glass-white",
        label: "text-text-on-brand",
        note: "text-text-on-brand",
      },
    },
    {
      tone: "inverse",
      variant: "done",
      class: {
        diamond: "bg-surface-card",
        bar: "bg-surface-card",
        check: "text-text-brand",
        label: "text-text-on-brand",
        note: "text-text-on-brand",
      },
    },
    {
      tone: "inverse",
      variant: "current",
      class: {
        diamond: "bg-surface-card",
        bar: "bg-surface-card",
        label: "text-text-on-brand",
        note: "text-text-on-brand",
      },
    },
  ],
  defaultVariants: { orientation: "vertical", tone: "light", variant: "upcoming" },
});

/** What each state is called when a screen reader reaches the step. */
const STATE_TEXT = {
  done: "Done",
  current: "In progress",
  upcoming: "Not started yet",
} as const;

type StepState = keyof typeof STATE_TEXT;

export interface TrackerStep {
  /** The step in the brand's voice — "On the tandoor", not "Status: cooking". */
  label: string;
  /** One line of detail under the label. Vertical only; the horizontal bar has no room. */
  note?: string;
}

export interface StepTrackerProps
  extends
    Omit<ComponentPropsWithoutRef<"ol">, "children">,
    Omit<VariantProps<typeof stepTracker>, "variant"> {
  /** The steps in order. A bare string is shorthand for a step with no note. */
  steps: (string | TrackerStep)[];
  /** Index of the step in progress, counting from 0. Everything before it renders as done. */
  current?: number | undefined;
  /** Names the tracker for assistive tech — "Order progress", "Checkout progress". */
  label?: string | undefined;
}

export function StepTracker({
  className,
  steps,
  current = 0,
  orientation,
  tone,
  label = "Progress",
  ...props
}: StepTrackerProps) {
  const isVertical = (orientation ?? "vertical") === "vertical";

  return (
    <ol
      aria-label={label}
      className={stepTracker({ orientation, tone }).root({ class: className })}
      {...props}
    >
      {steps.map((entry, index) => {
        const step = typeof entry === "string" ? { label: entry } : entry;
        const state: StepState =
          index < current ? "done" : index === current ? "current" : "upcoming";
        const slots = stepTracker({ orientation, tone, variant: state });

        return (
          <li
            aria-current={state === "current" ? "step" : undefined}
            className={slots.step()}
            key={step.label}
          >
            {isVertical ? (
              <span className={slots.marker()}>
                <span className={slots.diamond()} />
                {state === "done" ? (
                  <Icon className={slots.check()} icon={Check} size="xs" />
                ) : null}
              </span>
            ) : (
              <span className={slots.bar()} />
            )}
            <span className="sr-only">{STATE_TEXT[state]}</span>
            <span className={slots.body()}>
              <Text as="span" className={slots.label()} variant={isVertical ? "body2" : "caption"}>
                {step.label}
              </Text>
              {isVertical && step.note !== undefined ? (
                <Text as="span" className={slots.note()} variant="caption">
                  {step.note}
                </Text>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
