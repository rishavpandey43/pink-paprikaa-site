"use client";

import type { ChangeEventHandler, KeyboardEvent, ReactNode, Ref } from "react";

import { ChevronDown } from "lucide-react";
import { useCallback, useId, useRef, useState } from "react";

import type { SxProp } from "../../lib/common-props";
import type { FieldStatus } from "../../lib/field-status";
import type { SheetMode } from "../../lib/popover-shell";
import type { IconComponent } from "../icon/icon";

import { FieldControl } from "../../lib/field-control";
import { commitNativeSelectValue, HiddenNativeSelect } from "../../lib/hidden-native-select";
import { ListboxPopover } from "../../lib/listbox-popover";
import { type MenuItemData, MenuPanel } from "../../lib/menu-panel";
import { useAsSheet } from "../../lib/popover-shell";
import { withSx } from "../../lib/sx";
import { useListbox } from "../../lib/use-listbox";

export interface SelectOption {
  value: string;
  label: string;
  description?: string | undefined;
  isDisabled?: boolean | undefined;
}

export interface SelectProps extends SxProp {
  options: SelectOption[];
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** Lands on the hidden native select for `{...register()}`. */
  onChange?: ChangeEventHandler<HTMLSelectElement> | undefined;
  onBlur?: ChangeEventHandler<HTMLSelectElement> | undefined;
  name?: string | undefined;
  placeholder?: string | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  status?: FieldStatus | undefined;
  icon?: IconComponent | undefined;
  readOnly?: boolean | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  sheet?: SheetMode | undefined;
  portalContainer?: HTMLElement | null | undefined;
  id?: string | undefined;
  className?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  "aria-describedby"?: string | undefined;
  /** Hidden native select ref — `{...register()}` attaches here. */
  ref?: Ref<HTMLSelectElement> | undefined;
}

function toMenuItems(options: SelectOption[]): MenuItemData[] {
  return options.map((option) => ({
    value: option.value,
    label: option.label,
    description: option.description,
    disabled: option.isDisabled,
  }));
}

/**
 * Combobox trigger + MenuPanel listbox (never the browser popup). Closed look matches Input via
 * FieldControl; open list uses the Task 6 panel (brand diamond, sheet ≤640). A hidden native
 * `<select>` in lib keeps `{...register("x")}` and FormData posts working.
 */
export function Select({
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  onChange,
  onBlur,
  name,
  placeholder,
  size = "md",
  status = "default",
  icon,
  readOnly = false,
  disabled = false,
  required = false,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  sheet = "auto",
  portalContainer = null,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
  ref,
  sx,
  className,
}: SelectProps) {
  const listId = useId();
  const autoId = useId();
  const triggerId = id ?? autoId;
  const hiddenRef = useRef<HTMLSelectElement | null>(null);
  const setHiddenRef = useCallback(
    (node: HTMLSelectElement | null) => {
      hiddenRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref && typeof ref === "object") {
        (ref as { current: HTMLSelectElement | null }).current = node;
      }
    },
    [ref]
  );

  const firstEnabled = options.find((option) => !option.isDisabled)?.value ?? "";
  const [isUncontrolledValue, setIsUncontrolledValue] = useState(
    defaultValue ?? (placeholder !== undefined ? "" : firstEnabled)
  );
  const isValueControlled = valueProp !== undefined;
  const value = isValueControlled ? valueProp : isUncontrolledValue;

  const [isUncontrolledOpen, setIsUncontrolledOpen] = useState(defaultOpen);
  const isOpenControlled = openProp !== undefined;
  const isOpen = isOpenControlled ? openProp : isUncontrolledOpen;
  const setIsOpen = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setIsUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange]
  );

  const isLocked = disabled || readOnly;
  const isSheet = useAsSheet(isOpen ? sheet : false);
  const items = toMenuItems(options);
  const { activeIndex, move, toStart, toEnd, typeahead, resetActive } = useListbox(
    items.map((item) => ({
      ...item,
      text: typeof item.label === "string" ? item.label : item.value,
    }))
  );

  const chosen = options.find((option) => option.value === value);
  const triggerLabel: ReactNode = chosen === undefined ? (placeholder ?? "\u00a0") : chosen.label;

  const commit = useCallback(
    (next: string) => {
      if (!isValueControlled) setIsUncontrolledValue(next);
      onValueChange?.(next);
      commitNativeSelectValue(hiddenRef.current, next, onChange);
      setIsOpen(false);
    },
    [isValueControlled, onChange, onValueChange, setIsOpen]
  );

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (isLocked) return;
    if (!isOpen && ["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      setIsOpen(true);
      const preferred = options.findIndex((option) => option.value === value);
      resetActive(preferred > -1 ? preferred : undefined);
      return;
    }
    if (!isOpen) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      toStart();
    } else if (event.key === "End") {
      event.preventDefault();
      toEnd();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const item = items[activeIndex];
      if (item !== undefined && !item.disabled) commit(item.value);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
    } else if (event.key === "Tab") {
      setIsOpen(false);
    } else {
      typeahead(event.key);
    }
  };

  return (
    <FieldControl
      control="select"
      size={size}
      status={status}
      icon={icon}
      isReadOnly={readOnly && !disabled}
      affordance={ChevronDown}
      isExpanded={isOpen && status === "default" && !readOnly}
      className={withSx(sx, className)}
    >
      {(controlClassName) => (
        <>
          <ListboxPopover
            open={isOpen}
            onOpenChange={(next) => {
              if (isLocked && next) return;
              setIsOpen(next);
              if (next) {
                const preferred = options.findIndex((option) => option.value === value);
                resetActive(preferred > -1 ? preferred : undefined);
              }
            }}
            sheet={sheet}
            portalContainer={portalContainer}
            title={ariaLabel ?? placeholder}
            aria-label={ariaLabel ?? "Options"}
            trigger={
              <button
                id={triggerId}
                type="button"
                role="combobox"
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listId}
                aria-required={required || undefined}
                aria-invalid={status === "error" ? true : undefined}
                aria-readonly={readOnly || undefined}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledby}
                aria-describedby={ariaDescribedby}
                className={`${controlClassName}${chosen === undefined ? "text-text-subtle" : ""}`}
                onKeyDown={onTriggerKeyDown}
                onClick={() => {
                  if (!isLocked) setIsOpen(!isOpen);
                }}
              >
                <span className="truncate">{triggerLabel}</span>
              </button>
            }
          >
            <MenuPanel
              id={listId}
              role="listbox"
              aria-label={ariaLabel ?? placeholder ?? "Options"}
              items={items}
              value={value}
              isSheet={isSheet}
              activeIndex={activeIndex}
              onSelect={(item) => {
                commit(item.value);
              }}
            />
          </ListboxPopover>
          <HiddenNativeSelect
            selectRef={setHiddenRef}
            name={readOnly && !disabled ? undefined : name}
            value={value}
            options={options}
            disabled={disabled || readOnly}
            onChange={onChange}
            onBlur={onBlur}
          />
          {readOnly && !disabled && name !== undefined && value !== "" ? (
            <input type="hidden" name={name} value={value} />
          ) : null}
        </>
      )}
    </FieldControl>
  );
}
