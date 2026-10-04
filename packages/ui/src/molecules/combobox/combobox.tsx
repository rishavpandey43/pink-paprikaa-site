"use client";

import type { FocusEvent, KeyboardEvent, ReactNode, Ref } from "react";

import { X } from "lucide-react";
import { useId, useRef, useState } from "react";

import type { SxProp } from "../../lib/common-props";
import type { FieldStatus } from "../../lib/field-status";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { componentVariants } from "../../lib/component-variants";
import { FieldControl } from "../../lib/field-control";
import { withSx } from "../../lib/sx";
import { useControllableState } from "../../lib/use-controllable-state";

export interface ComboboxOption {
  value: string;
  label: string;
  /** A second line under the label. */
  description?: string | undefined;
  disabled?: boolean | undefined;
}

export interface ComboboxProps extends SxProp {
  options: readonly ComboboxOption[];
  value?: string | null | undefined;
  defaultValue?: string | null | undefined;
  onValueChange?: ((value: string | null) => void) | undefined;
  /** The text in the input. Controlled when given (async search); otherwise the combobox owns it. */
  inputValue?: string | undefined;
  onInputChange?: ((text: string) => void) | undefined;
  /** Default: case- and diacritic-insensitive `includes` on the label. */
  filter?: ((option: ComboboxOption, text: string) => boolean) | undefined;
  placeholder?: string | undefined;
  /** Default "No matches". */
  emptyMessage?: string | undefined;
  isLoading?: boolean | undefined;
  /** Default "Loading…". */
  loadingLabel?: string | undefined;
  isClearable?: boolean | undefined;
  /** Default "Clear". */
  clearLabel?: string | undefined;
  /** Submitted through a hidden input carrying the chosen `value`. */
  name?: string | undefined;
  disabled?: boolean | undefined;
  status?: FieldStatus | undefined;
  /** Field wiring, like Select: the id the label points at. */
  id?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-describedby"?: string | undefined;
  /** On the input, for react-hook-form's `Controller`. */
  ref?: Ref<HTMLInputElement> | undefined;
}

const combobox = componentVariants({
  slots: {
    root: "relative w-full min-w-0",
    popup:
      "absolute inset-x-0 top-full z-overlay mt-1 overflow-hidden rounded-lg border-default border-border-subtle bg-surface-card text-body-sm text-text-body shadow-3",
    list: "max-h-menu-max-md overflow-y-auto p-1.5",
    option:
      "flex min-h-hit cursor-pointer flex-col justify-center rounded-md px-3 py-2 select-none aria-disabled:cursor-not-allowed aria-disabled:text-ink-400 data-[active=true]:bg-surface-sunken",
    selected: "font-semibold",
    description: "text-caption text-text-muted",
    mark: "bg-transparent font-semibold text-text-heading",
    message: "p-3 text-text-muted",
  },
});

const DIACRITICS = /\p{Diacritic}/gu;

function normalize(text: string): string {
  return text.normalize("NFD").replace(DIACRITICS, "").toLowerCase();
}

function defaultFilter(option: ComboboxOption, text: string): boolean {
  return normalize(option.label).includes(normalize(text));
}

/**
 * Where `text` matches inside `label`, in the label's own indexes: the label is folded one
 * character at a time (accents stripped, lower-cased) so a folded index maps back to a real one.
 */
function matchRange(label: string, text: string): readonly [number, number] | undefined {
  const needle = normalize(text);
  if (needle === "") return undefined;
  let folded = "";
  const starts: number[] = [];
  let index = 0;
  for (const char of label) {
    const piece = normalize(char);
    starts.push(...Array<number>(piece.length).fill(index));
    folded += piece;
    index += char.length;
  }
  const at = folded.indexOf(needle);
  if (at === -1) return undefined;
  const last = at + needle.length - 1;
  const lastChar = starts[last] ?? 0;
  const end = lastChar + (String.fromCodePoint(label.codePointAt(lastChar) ?? 0).length || 1);
  return [starts[at] ?? 0, end];
}

function labelOf(options: readonly ComboboxOption[], value: string | null): string {
  return value === null ? "" : (options.find((option) => option.value === value)?.label ?? "");
}

/** The index of the next enabled option from `from` going `step`, wrapping; -1 when none. */
function stepIndex(items: readonly ComboboxOption[], from: number, step: 1 | -1): number {
  if (items.length === 0) return -1;
  // Nothing active (-1): stepping down starts before the first option, stepping up past the last.
  const origin = from === -1 && step === -1 ? items.length : from;
  for (let taken = 1; taken <= items.length; taken += 1) {
    const index = (((origin + step * taken) % items.length) + items.length) % items.length;
    if (items[index]?.disabled !== true) return index;
  }
  return -1;
}

function edgeIndex(items: readonly ComboboxOption[], end: "first" | "last"): number {
  const order = items.map((_, index) => index);
  if (end === "last") order.reverse();
  return order.find((index) => items[index]?.disabled !== true) ?? -1;
}

/**
 * A text field with a filtered list of options, one of which is chosen (WAI-ARIA 1.2 combobox
 * with a list popup, single select, hand-built). Type to narrow, ArrowDown/ArrowUp to move the
 * active option (focus stays in the input — `aria-activedescendant`), Enter or Tab to commit,
 * Escape to close and then to clear. For a short known list use Select; reach for this when the
 * list is long enough that people search it (dishes, localities).
 *
 * Leaving the field with other text typed restores the chosen label (or empties the field when
 * nothing is chosen): the text is only a way to find an option, never a value of its own.
 */
export function Combobox({
  options,
  value,
  defaultValue,
  onValueChange,
  inputValue,
  onInputChange,
  filter = defaultFilter,
  placeholder,
  emptyMessage = "No matches",
  isLoading = false,
  loadingLabel = "Loading…",
  isClearable = false,
  clearLabel = "Clear",
  name,
  disabled = false,
  status = "default",
  id,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedby,
  ref,
  sx,
}: ComboboxProps) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const listId = `${baseId}-listbox`;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const slots = combobox();

  const [current, setCurrent] = useControllableState<string | null>({
    value,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  });
  const [localText, setLocalText] = useState(() => labelOf(options, value ?? defaultValue ?? null));
  const text = inputValue ?? localText;
  const [isOpen, setIsOpen] = useState(false);
  // Narrowing applies only to text the person typed: a committed label shows the whole list.
  const [isFiltering, setIsFiltering] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  // The id of the <label> pointing at the input (inside a Field), so the open listbox is named
  // by it: `aria-label` is cleared there. Read when the list opens, once the label is in the DOM.
  const [labelId, setLabelId] = useState<string | undefined>(undefined);

  // A controlled value that changes from outside rewrites the (uncontrolled) text to its label.
  const [seenValue, setSeenValue] = useState(value);
  if (seenValue !== value) {
    setSeenValue(value);
    if (inputValue === undefined) setLocalText(labelOf(options, value ?? null));
  }

  const visible = isFiltering ? options.filter((option) => filter(option, text)) : options;
  const isListShown = isOpen && !disabled;
  const activeOption = visible[activeIndex];
  const hasMessage = isLoading || visible.length === 0;
  const optionId = (option: ComboboxOption): string =>
    `${baseId}-option-${String(options.indexOf(option))}`;

  function setText(next: string): void {
    if (inputValue === undefined) setLocalText(next);
    onInputChange?.(next);
  }

  function close(): void {
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function open(index: number): void {
    const id = inputRef.current?.labels?.[0]?.id;
    setLabelId(id === "" ? undefined : id);
    setIsOpen(true);
    setActiveIndex(index);
  }

  function commit(option: ComboboxOption): void {
    if (option.disabled === true) return;
    setCurrent(option.value);
    setText(option.label);
    setIsFiltering(false);
    close();
  }

  function clear(): void {
    setCurrent(null);
    setText("");
    setIsFiltering(false);
    close();
    inputRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        const step = event.key === "ArrowDown" ? 1 : -1;
        if (!isListShown) {
          const selected = visible.findIndex((option) => option.value === current);
          const first = step === 1 ? edgeIndex(visible, "first") : edgeIndex(visible, "last");
          open(selected === -1 ? first : selected);
        } else {
          setActiveIndex(stepIndex(visible, activeIndex, step));
        }
        break;
      }
      case "Home":
      case "End":
        // Only inside the list; with no active option they still move the text cursor.
        if (isListShown && activeIndex !== -1) {
          event.preventDefault();
          setActiveIndex(edgeIndex(visible, event.key === "Home" ? "first" : "last"));
        }
        break;
      case "Enter":
        if (isListShown && activeOption !== undefined) {
          event.preventDefault();
          commit(activeOption);
        }
        break;
      case "Escape":
        if (isListShown) {
          event.preventDefault();
          close();
        } else if (text !== "" || current !== null) {
          event.preventDefault();
          if (current !== null) setCurrent(null);
          setText("");
          setIsFiltering(false);
        }
        break;
      case "Tab":
        // Commit and let focus move on.
        if (isListShown && activeOption !== undefined) commit(activeOption);
        else close();
        break;
      default:
    }
  }

  function onBlur(event: FocusEvent<HTMLInputElement>): void {
    if (rootRef.current?.contains(event.relatedTarget) === true) return;
    close();
    setIsFiltering(false);
    const label = labelOf(options, current);
    if (text !== label) setText(label);
  }

  function optionAt(target: EventTarget): ComboboxOption | undefined {
    if (!(target instanceof Element)) return undefined;
    const index = target.closest("[role=option]")?.getAttribute("data-index");
    return index === null || index === undefined ? undefined : visible[Number(index)];
  }

  function renderLabel(option: ComboboxOption): ReactNode {
    const range = isFiltering ? matchRange(option.label, text) : undefined;
    if (range === undefined) return option.label;
    return (
      <>
        {option.label.slice(0, range[0])}
        <mark className={slots.mark()}>{option.label.slice(range[0], range[1])}</mark>
        {option.label.slice(range[1])}
      </>
    );
  }

  return (
    <div ref={rootRef} className={slots.root({ className: withSx(sx, undefined) })}>
      <FieldControl
        status={status}
        isLoading={isLoading && !isListShown}
        trailing={
          isClearable && !disabled && text !== "" ? (
            <IconButton
              icon={X}
              label={clearLabel}
              size="sm"
              variant="ghost"
              className="-me-2 shrink-0"
              // Keep focus in the input: the press must not blur and close the list first.
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={clear}
            />
          ) : undefined
        }
      >
        {(controlClassName) => (
          <>
            <input
              ref={(node) => {
                inputRef.current = node;
                if (typeof ref === "function") ref(node);
                else if (ref) ref.current = node;
              }}
              id={id}
              type="text"
              role="combobox"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={isListShown}
              aria-controls={listId}
              aria-activedescendant={
                activeOption === undefined ? undefined : optionId(activeOption)
              }
              aria-label={ariaLabel}
              aria-describedby={ariaDescribedby}
              aria-invalid={status === "error" ? true : undefined}
              className={controlClassName}
              placeholder={placeholder}
              disabled={disabled}
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setIsFiltering(true);
                open(-1);
              }}
              onClick={() => {
                if (!isListShown) open(-1);
              }}
              onKeyDown={onKeyDown}
              onBlur={onBlur}
            />
            {name === undefined || disabled ? null : (
              <input type="hidden" name={name} value={current ?? ""} />
            )}
          </>
        )}
      </FieldControl>
      {isListShown ? (
        <div
          data-surface="light"
          role="presentation"
          className={slots.popup()}
          // Pressing in the popup (a scrollbar, a gap) must not blur the input and close it.
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          // One delegate for the options: the input owns the keyboard (`aria-activedescendant`).
          onClick={(event) => {
            const option = optionAt(event.target);
            if (option !== undefined) commit(option);
          }}
          onPointerMove={(event) => {
            const option = optionAt(event.target);
            if (option !== undefined && option.disabled !== true && option !== activeOption) {
              setActiveIndex(visible.indexOf(option));
            }
          }}
        >
          <ul
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabel === undefined ? labelId : undefined}
            hidden={visible.length === 0}
            className={slots.list()}
          >
            {visible.map((option) => {
              const isActive = option === activeOption;
              return (
                <li
                  key={option.value}
                  id={optionId(option)}
                  role="option"
                  aria-selected={option.value === current}
                  aria-disabled={option.disabled === true ? true : undefined}
                  data-index={visible.indexOf(option)}
                  data-active={isActive}
                  className={slots.option({
                    className: option.value === current ? slots.selected() : undefined,
                  })}
                >
                  <span>{renderLabel(option)}</span>
                  {option.description === undefined ? null : (
                    <span className={slots.description()}>{option.description}</span>
                  )}
                </li>
              );
            })}
          </ul>
          {hasMessage ? (
            <div role="status" className={slots.message()}>
              {isLoading ? loadingLabel : emptyMessage}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
