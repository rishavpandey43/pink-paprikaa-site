"use client";

import type { ComponentProps, ReactNode } from "react";

import { Search, X } from "lucide-react";
import { useId, useRef } from "react";

import type { SxProp } from "../../lib/common-props";
import type { FieldStatus } from "../../lib/field-status";

import { Icon } from "../../atoms/icon/icon";
import { assignRef } from "../../lib/assign-ref";
import { joinIds } from "../../lib/choice-control";
import { componentVariants } from "../../lib/component-variants";
import { FieldControl } from "../../lib/field-control";
import { FieldMessage, hasFieldMessage } from "../../lib/field-message";
import { withSx } from "../../lib/sx";
import { useControllableState } from "../../lib/use-controllable-state";

const searchField = componentVariants({
  slots: {
    root: "grid min-w-0 gap-1.5",
    /** The design system's search box is a pill with a 16px inset, not the 10px-radius field. */
    box: "rounded-pill px-4",
    input: "search-reset",
    // 24px to see, 40px to hit (`before:-inset-2`, dev parity): the pseudo-element takes the tap.
    clear:
      "relative grid size-6 shrink-0 place-items-center rounded-pill text-text-subtle transition-colors duration-fast ease-out before:absolute before:-inset-2 hover:text-text-heading",
    message: "px-4",
  },
});

export interface SearchFieldProps
  extends
    Omit<ComponentProps<"input">, "size" | "type" | "value" | "defaultValue" | "onChange">,
    SxProp {
  /** Accessible name of the search box, e.g. "Search the menu". */
  label: string;
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** The clear button's accessible name (default "Clear search"). */
  clearLabel?: string | undefined;
  /** Called after the clear button empties the box. */
  onClear?: (() => void) | undefined;
  size?: "sm" | "md" | undefined;
  /**
   * Border and glyph colour; the hint becomes the status message. A status needs a `hint`: never
   * a colour without words.
   */
  status?: FieldStatus | undefined;
  /** Pulses the brand mark while results load (hides the clear button). */
  isLoading?: boolean | undefined;
  /** One short line under the field, e.g. "Nothing matches that. Try another dish." */
  hint?: ReactNode;
}

/** The pill search box the site and the app share. Placeholder names real dishes, never "Search…". */
export function SearchField({
  label,
  value,
  defaultValue,
  onValueChange,
  onClear,
  clearLabel = "Clear search",
  size = "md",
  status = "default",
  isLoading = false,
  hint,
  disabled,
  readOnly,
  sx,
  className,
  ref,
  "aria-describedby": describedBy,
  ...props
}: SearchFieldProps) {
  const [query, setQuery] = useControllableState({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messageId = `${useId()}-message`;
  const hasMessage = hasFieldMessage({ status, message: hint, hint });
  const canClear = query !== "" && !isLoading && disabled !== true && readOnly !== true;
  const styles = searchField();

  function handleClear(): void {
    setQuery("");
    onClear?.();
    inputRef.current?.focus();
  }

  return (
    <div className={styles.root({ className: withSx(sx, className) })}>
      <FieldControl
        size={size}
        status={status}
        icon={Search}
        isLoading={isLoading}
        isReadOnly={readOnly === true}
        trailing={
          canClear ? (
            <button
              type="button"
              aria-label={clearLabel}
              onClick={handleClear}
              className={styles.clear()}
            >
              <Icon icon={X} size="sm" />
            </button>
          ) : null
        }
        className={styles.box()}
      >
        {(controlClassName) => (
          // The bare input, the box's direct child: its `has-[>:is(input,…):disabled]` paint reads
          // it. The clear button renders only on an enabled box, so no disabled button meets it.
          <input
            {...props}
            ref={(node) => {
              inputRef.current = node;
              assignRef(ref, node);
            }}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.currentTarget.value);
            }}
            disabled={disabled}
            readOnly={readOnly}
            aria-label={label}
            aria-describedby={joinIds(describedBy, hasMessage ? messageId : undefined)}
            // A caller's own aria-invalid (spread above) survives the default status.
            aria-invalid={status === "error" ? true : props["aria-invalid"]}
            aria-busy={isLoading ? true : undefined}
            className={styles.input({ className: controlClassName })}
          />
        )}
      </FieldControl>
      <FieldMessage
        id={messageId}
        status={status}
        message={hint}
        hint={hint}
        className={styles.message()}
      />
    </div>
  );
}
