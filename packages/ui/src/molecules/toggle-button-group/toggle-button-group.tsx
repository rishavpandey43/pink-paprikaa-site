"use client";

import { ToggleGroup as RadixToggleGroup } from "radix-ui";
import { type ReactNode, useMemo } from "react";

import type { BasePropsWithColor, SizeProp } from "../../lib/common-props";
import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";
import {
  ToggleButtonGroupContext,
  type ToggleButtonGroupContextValue,
} from "../../lib/toggle-button-group-context";
import { useControllableState } from "../../lib/use-controllable-state";

/** The root div's native props; `value`, `defaultValue` and `dir` mean something else here. */
type ToggleButtonGroupRootProps = Omit<
  BasePropsWithColor<"div">,
  "defaultValue" | "children" | "dir" | "aria-label"
>;

interface ToggleButtonGroupBaseProps extends ToggleButtonGroupRootProps {
  /** Accessible name of the group — required, since the buttons are often icon-only. */
  "aria-label": string;
  orientation?: "horizontal" | "vertical" | undefined;
  /** Falls back per button: a ToggleButton's own `size` wins. = "md" */
  size?: SizeProp | undefined;
  /** Falls back per button: a ToggleButton's own `color` wins. = "brand" */
  color?: "brand" | "neutral" | undefined;
  isFullWidth?: boolean | undefined;
  disabled?: boolean | undefined;
  /**
   * MUI's "enforce value set": an exclusive group cannot be emptied by pressing the selected
   * button again. Has no effect on a multiple group. = false
   */
  isValueRequired?: boolean | undefined;
  /** ToggleButton children. */
  children: ReactNode;
}

export interface ExclusiveToggleButtonGroupProps extends ToggleButtonGroupBaseProps {
  /** One value or `null` (nothing chosen). Pressing the chosen button again clears it to `null`. */
  exclusive: true;
  value?: string | null | undefined;
  defaultValue?: string | null | undefined;
  onValueChange?: ((value: string | null) => void) | undefined;
}

export interface MultipleToggleButtonGroupProps extends ToggleButtonGroupBaseProps {
  /** Each button toggles independently; the value is an array. */
  exclusive?: false | undefined;
  value?: string[] | undefined;
  defaultValue?: string[] | undefined;
  onValueChange?: ((value: string[]) => void) | undefined;
}

export type ToggleButtonGroupProps =
  ExclusiveToggleButtonGroupProps | MultipleToggleButtonGroupProps;

/**
 * Buttons join into one segmented control: shared borders (each overlaps its neighbour by one
 * pixel) and only the outer corners rounded. The child selectors win over the button's own
 * `rounded-md` on specificity.
 */
const toggleButtonGroup = componentVariants({
  base: "items-stretch",
  variants: {
    orientation: {
      horizontal:
        "flex-row [&>*]:rounded-none [&>*:first-child]:rounded-s-md [&>*:last-child]:rounded-e-md [&>*:not(:first-child)]:-ms-px",
      vertical:
        "flex-col [&>*]:rounded-none [&>*:first-child]:rounded-t-md [&>*:last-child]:rounded-b-md [&>*:not(:first-child)]:-mt-px",
    },
    isFullWidth: { true: "flex w-full", false: "inline-flex" },
  },
  defaultVariants: { orientation: "horizontal", isFullWidth: false },
});

interface GroupShellProps {
  base: ToggleButtonGroupRootProps;
  size: SizeProp;
  color: "brand" | "neutral";
  isFullWidth: boolean;
  orientation: "horizontal" | "vertical";
}

/** The pieces both variants share: the context for the buttons and the root's class. */
function useGroupStyle({ size, color, isFullWidth, orientation }: Omit<GroupShellProps, "base">) {
  const context = useMemo<ToggleButtonGroupContextValue>(
    () => ({ size, color, isFullWidth }),
    [size, color, isFullWidth]
  );
  return { context, className: toggleButtonGroup({ orientation, isFullWidth }) };
}

function ExclusiveGroup({
  exclusive: _exclusive,
  value,
  defaultValue,
  onValueChange,
  isValueRequired = false,
  orientation = "horizontal",
  size = "md",
  color = "brand",
  isFullWidth = false,
  disabled = false,
  sx,
  className,
  children,
  ...props
}: ExclusiveToggleButtonGroupProps) {
  const [current, setCurrent] = useControllableState<string | null>({
    value,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  });
  const style = useGroupStyle({ size, color, isFullWidth, orientation });

  // Radix `single` has no null: it empties by emitting "", and takes "" for nothing chosen.
  const handleValueChange = (next: string) => {
    if (next === "") {
      if (isValueRequired) return;
      setCurrent(null);
      return;
    }
    setCurrent(next);
  };

  return (
    <ToggleButtonGroupContext value={style.context}>
      <RadixToggleGroup.Root
        {...props}
        type="single"
        value={current ?? ""}
        onValueChange={handleValueChange}
        orientation={orientation}
        disabled={disabled}
        className={withClasses(style.className, sx, className)}
      >
        {children}
      </RadixToggleGroup.Root>
    </ToggleButtonGroupContext>
  );
}

function MultipleGroup({
  exclusive: _exclusive,
  value,
  defaultValue,
  onValueChange,
  isValueRequired: _isValueRequired,
  orientation = "horizontal",
  size = "md",
  color = "brand",
  isFullWidth = false,
  disabled = false,
  sx,
  className,
  children,
  ...props
}: MultipleToggleButtonGroupProps) {
  const [current, setCurrent] = useControllableState<string[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange: onValueChange,
  });
  const style = useGroupStyle({ size, color, isFullWidth, orientation });

  return (
    <ToggleButtonGroupContext value={style.context}>
      <RadixToggleGroup.Root
        {...props}
        type="multiple"
        value={current}
        onValueChange={setCurrent}
        orientation={orientation}
        disabled={disabled}
        className={withClasses(style.className, sx, className)}
      >
        {children}
      </RadixToggleGroup.Root>
    </ToggleButtonGroupContext>
  );
}

function withClasses(
  base: string,
  sx: ToggleButtonGroupProps["sx"],
  className: string | undefined
): string {
  return `${base} ${withSx(sx, className) ?? ""}`.trim();
}

/**
 * MUI `<ToggleButtonGroup>`: a toolbar control of ToggleButtons (view switcher, alignment, quick
 * filters), on Radix ToggleGroup — one tab stop, arrows move, Home/End jump, Space/Enter toggle.
 * `exclusive` holds one value or `null`; without it the value is an array. Not a form value
 * control: for a labelled choice with status and a message, use ChipGroup.
 */
export function ToggleButtonGroup(props: ToggleButtonGroupProps) {
  return props.exclusive === true ? <ExclusiveGroup {...props} /> : <MultipleGroup {...props} />;
}
