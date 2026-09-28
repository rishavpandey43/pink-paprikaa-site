import {
  type ChangeEvent,
  type ComponentProps,
  type FocusEventHandler,
  type ReactNode,
  type Ref,
  useId,
} from "react";

import type { FieldStatus } from "../../lib/field-status";

import { joinIds } from "../../lib/choice-control";
import { componentVariants } from "../../lib/component-variants";
import { FieldMessage, hasFieldMessage } from "../../lib/field-message";

/**
 * A grid minimum on the AutoGrid scale (xs 140 · sm 200 · md 260 · lg 320 · xl 380 · 2xl 420px).
 * Restated here because a molecule may not import from layouts, not even a type.
 */
export type ChoiceGridMin = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface ChoiceOption {
  value: string;
  title: ReactNode;
  /** Formatted with formatRupees, or words ("Included", "Quoted · 25+ guests"). */
  price?: ReactNode | undefined;
  was?: ReactNode | undefined;
  description?: ReactNode | undefined;
  /** A Badge beside the title, e.g. "Pick". */
  badge?: ReactNode | undefined;
  /** A line under the description, e.g. an offer Badge. */
  meta?: ReactNode | undefined;
  isDisabled?: boolean | undefined;
}

export interface ChoiceCardGroupProps extends Omit<
  ComponentProps<"fieldset">,
  "defaultValue" | "onBlur" | "onChange" | "ref"
> {
  name: string;
  legend: ReactNode;
  isLegendHidden?: boolean | undefined;
  options: ChoiceOption[];
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** Native change event of the chosen radio — react-hook-form's `register()` handler. */
  onChange?: ((event: ChangeEvent<HTMLInputElement>) => void) | undefined;
  onBlur?: FocusEventHandler<HTMLInputElement> | undefined;
  /** Given to every radio, so `register()` sees each one. */
  ref?: Ref<HTMLInputElement> | undefined;
  /** Tile width floor for the grid (tiles only). */
  min?: ChoiceGridMin | undefined;
  /** `tile`: stacked cards in a grid, price under the title. `row`: full-width rows, price at the end. */
  layout?: "tile" | "row" | undefined;
  /** `on-brand`: white cards with a visible radio, for a pink field (the Home trial selector). */
  tone?: "light" | "on-brand" | undefined;
  /**
   * `error` marks the group invalid and reddens every card's border. A status shows only with its
   * `message`: without words it is ignored, so a card is never marked by colour alone.
   */
  status?: FieldStatus | undefined;
  /**
   * Under the cards, read as the group's description: with a status, its glyph and colour (an
   * error is announced, `role="alert"`); without one, a plain hint.
   */
  message?: ReactNode;
}

const choiceCardGroup = componentVariants({
  slots: {
    root: "min-w-0",
    legend: "mb-2.5 font-display text-choice-card-title text-text-heading",
    list: "grid gap-2",
    message: "mt-2",
    card: "relative flex min-h-16 cursor-pointer rounded-md p-3 text-left transition-control has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus has-disabled:cursor-not-allowed has-disabled:border-border-subtle has-disabled:bg-ink-200 has-disabled:text-ink-400",
    input: "",
    body: "flex min-w-0 flex-1 flex-col items-start gap-1",
    head: "flex w-full flex-wrap items-center justify-between gap-1.5",
    title: "font-display text-choice-card-title",
    price:
      "flex flex-wrap items-baseline gap-1.5 font-display text-h4 font-black whitespace-nowrap",
    was: "font-body text-body-sm font-regular",
    description: "text-caption",
  },
  variants: {
    layout: {
      tile: { card: "flex-col items-start gap-1" },
      row: { card: "items-center gap-3", price: "shrink-0" },
    },
    tone: {
      light: {
        // 1px border + the inset `selected` shadow = a 2px border that never shifts the layout.
        // In error the checked card turns red too (its brand border would out-rank the red), and
        // drops the pink inset so the red is not lined with pink.
        card: "border border-border-default bg-surface-card text-text-heading in-aria-invalid:border-status-danger has-checked:border-border-brand has-checked:bg-pink-50 has-checked:text-pink-700 has-checked:shadow-selected in-aria-invalid:has-checked:border-status-danger in-aria-invalid:has-checked:shadow-none",
        input: "sr-only",
      },
      "on-brand": {
        card: "border-2 border-transparent bg-white-alpha-92 text-text-heading in-aria-invalid:border-status-danger has-checked:border-ink-900 has-checked:bg-ink-000 in-aria-invalid:has-checked:border-status-danger",
        input:
          "size-4.5 shrink-0 cursor-pointer appearance-none rounded-pill border-2 border-ink-600 bg-ink-000 checked:border-pink-600 checked:bg-pink-600 checked:shadow-choice-card-radio focus-visible:outline-none",
      },
    },
    min: {
      xs: { list: "autogrid-min-xs" },
      sm: { list: "autogrid-min-sm" },
      md: { list: "autogrid-min-md" },
      lg: { list: "autogrid-min-lg" },
      xl: { list: "autogrid-min-xl" },
      "2xl": { list: "autogrid-min-2xl" },
    },
    isLegendHidden: { true: { legend: "sr-only" }, false: {} },
  },
});

/**
 * A card-style single choice (plates, plan lengths, dawats, platters, service, the trial, the
 * decide list). Native radios in a fieldset: keyboard, forms and `register()` work unmodified.
 */
export function ChoiceCardGroup({
  name,
  legend,
  isLegendHidden = false,
  options,
  value,
  defaultValue,
  onValueChange,
  onChange,
  onBlur,
  ref,
  min = "xs",
  layout = "tile",
  tone = "light",
  status = "default",
  message,
  className,
  "aria-describedby": describedBy,
  // Dropped: the group's own invalid state wins, so a bare aria-invalid cannot mark it by colour alone.
  "aria-invalid": _callerInvalid,
  ...props
}: ChoiceCardGroupProps) {
  const baseId = useId();
  const messageId = `${baseId}-message`;
  const hasMessage = hasFieldMessage({ message });
  const styles = choiceCardGroup({
    layout,
    tone,
    isLegendHidden,
    ...(layout === "tile" ? { min } : {}),
  });
  // Attached only when the consumer listens, so a server render carries no handler.
  const handleChange =
    onChange === undefined && onValueChange === undefined
      ? undefined
      : (event: ChangeEvent<HTMLInputElement>) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        };

  return (
    <fieldset
      aria-invalid={hasMessage && status === "error" ? true : undefined}
      aria-describedby={joinIds(hasMessage ? messageId : undefined, describedBy)}
      className={styles.root({ className })}
      {...props}
    >
      <legend className={styles.legend()}>{legend}</legend>
      <div className={styles.list()}>
        {options.map((option, index) => {
          const id = `${baseId}-${String(index)}`;
          const price =
            option.price === undefined ? null : (
              <span id={`${id}-price`} className={styles.price()}>
                {option.price}
                {/* The {" "} separators keep the name "₹130 was ₹140", not "₹130was₹140"; a flex row
                    drops whitespace-only text and a line drops a leading space, so neither draws. */}
                {option.was === undefined ? null : (
                  <>
                    {" "}
                    <s className={styles.was()}>
                      {/* PriceTag's hidden word, lower-case (R94). */}
                      <span className="sr-only">was</span> {option.was}
                    </s>
                  </>
                )}
              </span>
            );
          return (
            <label key={option.value} data-surface="light" className={styles.card()}>
              <input
                type="radio"
                name={name}
                value={option.value}
                disabled={option.isDisabled}
                ref={ref}
                onBlur={onBlur}
                onChange={handleChange}
                aria-labelledby={price === null ? `${id}-title` : `${id}-title ${id}-price`}
                aria-describedby={
                  option.description === undefined ? undefined : `${id}-description`
                }
                className={styles.input()}
                {...(value === undefined
                  ? { defaultChecked: option.value === defaultValue }
                  : { checked: option.value === value })}
              />
              <span className={styles.body()}>
                <span className={styles.head()}>
                  <span id={`${id}-title`} className={styles.title()}>
                    {option.title}
                  </span>
                  {option.badge}
                </span>
                {layout === "tile" ? price : null}
                {option.description === undefined ? null : (
                  <span id={`${id}-description`} className={styles.description()}>
                    {option.description}
                  </span>
                )}
                {option.meta}
              </span>
              {layout === "row" ? price : null}
            </label>
          );
        })}
      </div>
      <FieldMessage id={messageId} status={status} message={message} className={styles.message()} />
    </fieldset>
  );
}
