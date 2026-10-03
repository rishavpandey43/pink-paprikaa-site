"use client";

import { ToggleGroup } from "radix-ui";
import { type FocusEvent, type ReactNode, type Ref, useId, useState } from "react";

import type { BaseProps } from "../../lib/common-props";
import type { FieldStatus } from "../../lib/field-status";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { tagVariants } from "../../atoms/tag/tag";
import { joinIds } from "../../lib/choice-control";
import { componentVariants } from "../../lib/component-variants";
import { FieldMessage, hasFieldMessage } from "../../lib/field-message";
import { withSx } from "../../lib/sx";

export interface ChipOption {
  value: string;
  label: ReactNode;
  icon?: IconComponent | undefined;
  isDisabled?: boolean | undefined;
}

type ChipGroupVariant = "chips" | "segmented";

/** The wrapper takes the div's native props; `ref`, `onBlur` and `defaultValue` mean something else here, and `aria-invalid` is the group's own `status`. */
type ChipGroupRootProps = Omit<
  BaseProps<"div">,
  "ref" | "onBlur" | "defaultValue" | "children" | "aria-invalid"
>;

interface ChipGroupBaseProps extends ChipGroupRootProps {
  /** Accessible name of the group — the visible step heading usually says the same. */
  label: string;
  options: ChipOption[];
  /** `chips`: wrapping Tag pills. `segmented`: a pill track switching one value (no panels). */
  variant?: ChipGroupVariant | undefined;
  /** Renders hidden inputs, so the choice submits with a plain form. */
  name?: string | undefined;
  disabled?: boolean | undefined;
  /** Fires when focus leaves the group — react-hook-form's `field.onBlur`. */
  onBlur?: (() => void) | undefined;
  /**
   * The group element — react-hook-form's `field.ref`. Focusing it lands on the chosen chip (or the
   * first), so `shouldFocusError` reaches the group.
   */
  ref?: Ref<HTMLDivElement> | undefined;
  /**
   * `error` marks the group invalid and reddens every chip's border. A status shows only with its
   * `message`: without words it is ignored, so a group is never marked by colour alone (R101).
   */
  status?: FieldStatus | undefined;
  /**
   * Under the chips, read as the group's description: with a status, its glyph and colour (an
   * error is announced, `role="alert"`); without one, a plain hint.
   */
  message?: ReactNode;
  /** Joins the group's own description (the limit line, the message); never replaces it (R102). */
  "aria-describedby"?: string | undefined;
}

export interface SingleChipGroupProps extends ChipGroupBaseProps {
  type: "single";
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
}

export interface MultipleChipGroupProps extends ChipGroupBaseProps {
  type: "multiple";
  value?: string[] | undefined;
  defaultValue?: string[] | undefined;
  onValueChange?: ((value: string[]) => void) | undefined;
  /** At most this many; the rest become unavailable (focusable, and the reason is announced). */
  maxSelected?: number | undefined;
  /** The status line under a limit. Default "2 of 3 chosen." / "3 of 3 chosen. Remove one to …". */
  getLimitMessage?: ((selected: number, max: number) => string) | undefined;
}

export type ChipGroupProps = SingleChipGroupProps | MultipleChipGroupProps;

const chipGroup = componentVariants({
  slots: {
    root: "flex flex-col gap-2",
    group: "flex flex-wrap gap-2",
    status: "m-0 max-w-none text-caption text-text-muted",
  },
  variants: {
    variant: {
      chips: {},
      segmented: {
        group:
          "w-fit flex-nowrap gap-1 rounded-pill border border-border-subtle bg-surface-card p-1",
      },
    },
  },
});

/**
 * Per-chip additions on top of the Tag skin. The Tag root already carries `controlStates`, so a chip
 * blocked by `maxSelected` (`aria-disabled`, still focusable) gets the grey disabled look and no
 * pointer events for free.
 */
const chipItem = componentVariants({
  // An invalid group (an error with its message) reddens every chip's border, like ChoiceCardGroup.
  base: "in-aria-invalid:border-status-danger",
  variants: {
    // Unchosen segmented options shed the chip's outline and fill (the handoff's pill rail).
    isIdleSegment: { true: "border-transparent bg-transparent text-text-brand", false: "" },
  },
});

function defaultLimitMessage(selected: number, max: number): string {
  return selected >= max
    ? `${String(max)} of ${String(max)} chosen. Remove one to choose another.`
    : `${String(selected)} of ${String(max)} chosen.`;
}

/** Calls `onBlur` only when focus leaves the whole group, not when it moves between chips. */
function blurLeavingGroup(onBlur: () => void) {
  return (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    onBlur();
  };
}

interface HiddenValuesProps {
  name: string | undefined;
  values: readonly string[];
  isDisabled: boolean;
}

/** Native disabled controls do not submit, so a disabled group renders no hidden inputs either. */
function HiddenValues({ name, values, isDisabled }: HiddenValuesProps) {
  if (name === undefined || isDisabled) return null;
  return values.map((item) => <input key={item} type="hidden" name={name} value={item} />);
}

interface ChipItemsProps {
  options: ChipOption[];
  selected: readonly string[];
  variant: ChipGroupVariant;
  isLimitReached?: boolean | undefined;
}

/** ToggleGroup items wearing the Tag skin — never a Tag button nested inside an item. */
function ChipItems({ options, selected, variant, isLimitReached = false }: ChipItemsProps) {
  return options.map((option) => {
    const isSelected = selected.includes(option.value);
    const tag = tagVariants({ isSelected, isInteractive: true });
    return (
      <ToggleGroup.Item
        key={option.value}
        value={option.value}
        disabled={option.isDisabled}
        aria-disabled={isLimitReached && !isSelected ? true : undefined}
        className={tag.root({
          className: chipItem({ isIdleSegment: variant === "segmented" && !isSelected }),
        })}
      >
        {option.icon === undefined ? null : <Icon icon={option.icon} size="sm" />}
        <span className={tag.label()}>{option.label}</span>
      </ToggleGroup.Item>
    );
  });
}

function SingleChipGroup({
  label,
  options,
  variant = "chips",
  sx,
  className,
  name,
  disabled = false,
  onBlur,
  ref,
  status = "default",
  message,
  "aria-describedby": describedBy,
  value,
  defaultValue,
  onValueChange,
  type: _type,
  ...props
}: SingleChipGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
  const messageId = useId();
  const hasMessage = hasFieldMessage({ message });
  const selected = value ?? uncontrolledValue;
  const values = selected === "" ? [] : [selected];
  const styles = chipGroup({ variant });

  const handleValueChange = (next: string) => {
    // A single group is a required choice: Radix clears it when the chosen chip is pressed again.
    if (next === "") return;
    setUncontrolledValue(next);
    onValueChange?.(next);
  };

  return (
    <div
      {...props}
      aria-invalid={undefined}
      className={styles.root({ className: withSx(sx, className) })}
      onBlur={onBlur === undefined ? undefined : blurLeavingGroup(onBlur)}
    >
      <ToggleGroup.Root
        ref={ref}
        type="single"
        aria-label={label}
        aria-describedby={joinIds(hasMessage ? messageId : undefined, describedBy)}
        aria-invalid={hasMessage && status === "error" ? true : undefined}
        value={selected}
        onValueChange={handleValueChange}
        disabled={disabled}
        className={styles.group()}
      >
        <ChipItems options={options} selected={values} variant={variant} />
      </ToggleGroup.Root>
      <FieldMessage id={messageId} status={status} message={message} />
      <HiddenValues name={name} values={values} isDisabled={disabled} />
    </div>
  );
}

function MultipleChipGroup({
  label,
  options,
  variant = "chips",
  sx,
  className,
  name,
  disabled = false,
  onBlur,
  ref,
  status = "default",
  message,
  "aria-describedby": describedBy,
  value,
  defaultValue,
  onValueChange,
  maxSelected,
  getLimitMessage = defaultLimitMessage,
  type: _type,
  ...props
}: MultipleChipGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? []);
  const statusId = useId();
  const messageId = useId();
  const hasMessage = hasFieldMessage({ message });
  if (maxSelected !== undefined && (!Number.isInteger(maxSelected) || maxSelected < 1)) {
    throw new RangeError(
      `ChipGroup: maxSelected must be a whole number ≥ 1, got ${String(maxSelected)}`
    );
  }
  const selected = value ?? uncontrolledValue;
  const isLimitReached = maxSelected !== undefined && selected.length >= maxSelected;
  const styles = chipGroup({ variant });

  const handleValueChange = (next: string[]) => {
    // A chip blocked by the limit was pressed: the selection stays as it is. Only additions are
    // guarded, so a group that starts over its limit can still drop chips.
    if (maxSelected !== undefined && next.length > selected.length && next.length > maxSelected) {
      return;
    }
    setUncontrolledValue(next);
    onValueChange?.(next);
  };

  return (
    <div
      {...props}
      aria-invalid={undefined}
      className={styles.root({ className: withSx(sx, className) })}
      onBlur={onBlur === undefined ? undefined : blurLeavingGroup(onBlur)}
    >
      {maxSelected === undefined ? null : (
        <p id={statusId} aria-live="polite" className={styles.status()}>
          {getLimitMessage(selected.length, maxSelected)}
        </p>
      )}
      <ToggleGroup.Root
        ref={ref}
        type="multiple"
        aria-label={label}
        aria-describedby={joinIds(
          maxSelected === undefined ? undefined : statusId,
          hasMessage ? messageId : undefined,
          describedBy
        )}
        aria-invalid={hasMessage && status === "error" ? true : undefined}
        value={selected}
        onValueChange={handleValueChange}
        disabled={disabled}
        className={styles.group()}
      >
        <ChipItems
          options={options}
          selected={selected}
          variant={variant}
          isLimitReached={isLimitReached}
        />
      </ToggleGroup.Root>
      <FieldMessage id={messageId} status={status} message={message} />
      <HiddenValues name={name} values={selected} isDisabled={disabled} />
    </div>
  );
}

/**
 * Tag-based single or multiple selection for the calculators (meals, breads, spice, add-ons,
 * starter picks) and the segmented value switch. Radix ToggleGroup: roving focus, arrows move,
 * Space/Enter choose. A single group is a radiogroup that does not choose on focus — unlike a
 * native radio group, an arrow only moves; the same model as FilterBar (R100).
 *
 * It owns its `status` / `message` (the group's description and invalid state); do not wrap it in
 * Field: the group names itself (`label`), and it takes no `aria-invalid`, so Field's error could
 * not mark the chips invalid.
 */
export function ChipGroup(props: ChipGroupProps) {
  return props.type === "single" ? (
    <SingleChipGroup {...props} />
  ) : (
    <MultipleChipGroup {...props} />
  );
}
