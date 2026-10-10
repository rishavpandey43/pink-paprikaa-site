import {
  type ComponentProps,
  type KeyboardEventHandler,
  type PointerEventHandler,
  type ReactNode,
  useId,
} from "react";

import type { SxProp } from "./common-props";
import { componentVariants } from "./component-variants";
import { withSx } from "./sx";
import { usePress } from "./use-press";

/**
 * The one choice row — Checkbox, Radio and Switch. A <label> holds a visually hidden native input,
 * the drawn control, the label, an optional description and an optional price. Every state is CSS
 * off that input (`group-has-checked/choice:`, `group-has-focus-visible/choice:`,
 * `group-has-disabled/choice:`, `group-has-aria-invalid/choice:`), so the controls stay server
 * components and work controlled, uncontrolled or through react-hook-form alike.
 *
 * Row hover/press tint and `data-pressed` (R139) live here so Checkbox/Radio/Switch share one recipe
 * (IX choice rows). Disabled fades the whole row at 50% opacity — the design's rule for choice rows
 * (pill controls keep a real grey fill instead).
 */
export const choiceVariants = componentVariants({
  slots: {
    root: [
      "group/choice relative -mx-3 flex cursor-pointer rounded-md px-3 py-2.5 font-body text-text-body",
      "transition-colors duration-fast ease-out",
      "hover:bg-state-hover active:bg-state-press data-[pressed]:bg-state-press",
      "has-disabled:cursor-not-allowed has-disabled:opacity-50",
    ].join(" "),
    input: "sr-only",
    control: "flex shrink-0",
    text: "flex min-w-0 flex-1 flex-col gap-0.5 text-control font-medium",
    description:
      "text-control-description font-regular text-text-muted group-has-disabled/choice:text-ink-400",
    price:
      "shrink-0 font-display text-body-sm font-bold text-text-heading group-has-disabled/choice:text-ink-400",
  },
  variants: {
    /** Where the drawn control sits: before the text (checkbox, radio) or after it (switch). */
    placement: {
      start: { root: "items-start gap-3", control: "mt-px" },
      end: { root: "items-center gap-3.5", control: "order-last" },
    },
    isLabelHidden: { true: { text: "sr-only" } },
  },
  defaultVariants: { placement: "start", isLabelHidden: false },
});

/** A space-separated id list for `aria-describedby`, or undefined when there is none. */
export function joinIds(...ids: (string | undefined)[]): string | undefined {
  const joined = ids.filter((id) => id !== undefined && id !== "").join(" ");
  return joined === "" ? undefined : joined;
}

export interface ChoiceControlProps extends Omit<ComponentProps<"input">, "size" | "type">, SxProp {
  type: "checkbox" | "radio";
  /** The drawn box, ring or track. Decorative: the native input carries every semantic. */
  control: ReactNode;
  label: ReactNode;
  /** Announced as the input's description and kept out of its name. */
  description?: ReactNode;
  /** Already formatted ("+₹60", "₹280"); part of the accessible name. */
  price?: string | undefined;
  /** Sets `aria-invalid`; the box turns red through CSS. */
  isInvalid?: boolean | undefined;
  /** Where the drawn control sits: before the text (checkbox, radio) or after it (switch). */
  placement?: "start" | "end" | undefined;
  /** Hides the text visually; it stays the accessible name. */
  isLabelHidden?: boolean | undefined;
}

/** `sx` and `className` style the row; every other prop lands on the native input. */
export function ChoiceControl({
  type,
  control,
  label,
  description,
  price,
  isInvalid = false,
  placement,
  isLabelHidden,
  sx,
  className,
  disabled,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onKeyDown,
  onKeyUp,
  onBlur,
  "aria-describedby": describedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: ChoiceControlProps) {
  const descriptionId = useId();
  const styles = choiceVariants({ placement, isLabelHidden });
  // Press state lives on the row (label); keyboard handlers run on the focused input.
  const { pressProps } = usePress<HTMLElement>({
    disabled,
    onPointerDown: onPointerDown as PointerEventHandler<HTMLElement> | undefined,
    onPointerUp: onPointerUp as PointerEventHandler<HTMLElement> | undefined,
    onPointerLeave: onPointerLeave as PointerEventHandler<HTMLElement> | undefined,
    onKeyDown: onKeyDown as KeyboardEventHandler<HTMLElement> | undefined,
    onKeyUp: onKeyUp as KeyboardEventHandler<HTMLElement> | undefined,
    onBlur,
  });
  const {
    onPointerDown: pressPointerDown,
    onPointerUp: pressPointerUp,
    onPointerLeave: pressPointerLeave,
    onKeyDown: pressKeyDown,
    onKeyUp: pressKeyUp,
    onBlur: pressBlur,
    "data-pressed": dataPressed,
  } = pressProps;

  return (
    <label
      className={styles.root({ className: withSx(sx, className) })}
      onPointerDown={pressPointerDown}
      onPointerUp={pressPointerUp}
      onPointerLeave={pressPointerLeave}
      data-pressed={dataPressed}
    >
      <input
        type={type}
        className={styles.input()}
        disabled={disabled}
        // `isInvalid` wins over a caller's `aria-invalid`, which otherwise stands (Field's `true`).
        aria-invalid={isInvalid ? true : ariaInvalid}
        aria-describedby={joinIds(
          description === undefined ? undefined : descriptionId,
          describedBy
        )}
        onKeyDown={pressKeyDown}
        onKeyUp={pressKeyUp}
        onBlur={pressBlur}
        {...props}
      />
      <span aria-hidden="true" className={styles.control()}>
        {control}
      </span>
      <span className={styles.text()}>
        {label}
        {description === undefined ? null : (
          // aria-hidden keeps the description out of the label's name; the input's
          // aria-describedby still announces it (a referenced node is read even when hidden).
          <span id={descriptionId} aria-hidden="true" className={styles.description()}>
            {description}
          </span>
        )}
      </span>
      {price === undefined ? null : (
        <>
          {" "}
          <span className={styles.price()}>{price}</span>
        </>
      )}
    </label>
  );
}
