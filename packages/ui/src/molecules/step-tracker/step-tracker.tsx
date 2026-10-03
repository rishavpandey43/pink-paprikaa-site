import { Check } from "lucide-react";

import type { BaseProps } from "../../lib/common-props";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";
import { SymbolMark } from "../../lib/symbol-mark";

type StepState = "complete" | "current" | "upcoming";

const stepTracker = componentVariants({
  slots: {
    root: "m-0 list-none p-0",
    step: "flex min-w-0",
    marker: "relative mt-0.5 size-step-tracker-marker shrink-0",
    diamond: "absolute inset-0 grid rotate-45 place-items-center overflow-hidden rounded-xs",
    // 16px: the base scale step, 74% of the 22px marker.
    mark: "size-4 -rotate-45 opacity-50",
    check: "absolute inset-0 grid place-items-center text-step-tracker-mark-on",
    bar: "h-1.25 rounded-pill transition-colors duration-base ease-out",
    copy: "grid min-w-0",
    label: "font-display",
    note: "text-caption text-text-muted",
  },
  variants: {
    orientation: {
      vertical: { root: "grid gap-3.5", step: "gap-3.5", label: "text-body-sm" },
      horizontal: { root: "flex gap-2", step: "flex-1 flex-col gap-2", label: "text-caption" },
    },
    state: {
      complete: {
        diamond: "bg-step-tracker-marker-on",
        mark: "text-step-tracker-mark-on",
        bar: "bg-step-tracker-bar-on",
        label: "font-medium text-text-heading",
      },
      current: {
        diamond: "bg-step-tracker-marker-on",
        mark: "text-step-tracker-mark-on",
        bar: "bg-step-tracker-bar-on",
        label: "font-bold text-text-heading",
      },
      upcoming: {
        diamond: "bg-step-tracker-marker-off",
        mark: "text-step-tracker-mark-off",
        bar: "bg-step-tracker-bar-off",
        label: "font-medium text-text-subtle",
      },
    },
  },
  defaultVariants: { orientation: "vertical", state: "upcoming" },
});

function stateOf(index: number, current: number): StepState {
  if (index < current) return "complete";
  return index === current ? "current" : "upcoming";
}

/** What a screen reader hears before each step's label (dev parity: state never by colour alone). */
const STATE_TEXT: Readonly<Record<StepState, string>> = {
  complete: "Done",
  current: "In progress",
  upcoming: "Not started yet",
};

export interface TrackerStep {
  label: string;
  /** Vertical only: one line of brand voice, e.g. "Chilli paneer is charring." */
  note?: string | undefined;
}

export interface StepTrackerProps extends BaseProps<"ol"> {
  steps: TrackerStep[];
  /** Index of the current step; earlier steps are complete. */
  current: number;
  /** `vertical` for order tracking, `horizontal` for checkout progress. */
  orientation?: "vertical" | "horizontal" | undefined;
}

/**
 * Progress through named steps. Vertical: brand diamonds, checked when complete. Horizontal: a
 * segmented bar. Step copy is the brand voice, not system status text.
 */
export function StepTracker({
  steps,
  current,
  orientation = "vertical",
  sx,
  className,
  ...props
}: StepTrackerProps) {
  const isVertical = orientation === "vertical";
  const styles = stepTracker({ orientation });

  return (
    // Safari/VoiceOver drops list semantics from a list-style:none list; the explicit role
    // restores them.
    <ol role="list" className={styles.root({ className: withSx(sx, className) })} {...props}>
      {steps.map((step, index) => {
        const state = stateOf(index, current);
        return (
          <li
            key={index}
            data-state={state}
            aria-current={state === "current" ? "step" : undefined}
            className={styles.step()}
          >
            {isVertical ? (
              <span aria-hidden="true" className={styles.marker()}>
                <span className={styles.diamond({ state })}>
                  <SymbolMark className={styles.mark({ state })} />
                </span>
                {state === "complete" ? (
                  <span className={styles.check()}>
                    <Icon icon={Check} size="xs" className="size-3" />
                  </span>
                ) : null}
              </span>
            ) : (
              <span aria-hidden="true" className={styles.bar({ state })} />
            )}
            <span className="sr-only">{STATE_TEXT[state]}</span>
            <span className={styles.copy()}>
              <span className={styles.label({ state })}>{step.label}</span>
              {isVertical && step.note !== undefined ? (
                <span className={styles.note()}>{step.note}</span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
