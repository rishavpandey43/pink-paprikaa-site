import { useCallback, useRef, useState } from "react";

export interface ListboxItem {
  disabled?: boolean | undefined;
  /** Plain text for type-to-jump when the label is not a string. */
  text?: string | undefined;
  label?: unknown;
}

function itemText(item: ListboxItem): string {
  if (typeof item.text === "string" && item.text.length > 0) return item.text;
  if (typeof item.label === "string") return item.label;
  return "";
}

function isSelectable(item: ListboxItem | undefined): boolean {
  return item !== undefined && item.disabled !== true;
}

/**
 * Active index + typeahead for MenuPanel / Select / Combobox (design Menu.jsx).
 * Typeahead buffer clears after `bufferMs` (handoff 600ms; plan 500ms — use 500).
 */
export function useListbox(items: readonly ListboxItem[], bufferMs = 500) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const typed = useRef({ buffer: "", at: 0 });

  const step = useCallback(
    (from: number, direction: 1 | -1): number => {
      if (items.length === 0) return -1;
      for (let n = 1; n <= items.length; n += 1) {
        const next = (from + direction * n + items.length * 2) % items.length;
        if (isSelectable(items[next])) return next;
      }
      return from;
    },
    [items]
  );

  const firstSelectable = useCallback((): number => step(-1, 1), [step]);

  const move = useCallback(
    (direction: 1 | -1) => {
      setActiveIndex((current) =>
        step(current < 0 ? (direction === 1 ? -1 : 0) : current, direction)
      );
    },
    [step]
  );

  const toStart = useCallback(() => {
    setActiveIndex(step(-1, 1));
  }, [step]);

  const toEnd = useCallback(() => {
    setActiveIndex(step(items.length, -1));
  }, [items.length, step]);

  const typeahead = useCallback(
    (key: string) => {
      if (key.length !== 1 || !/\S/.test(key)) return;
      const now = Date.now();
      const buffer =
        now - typed.current.at > bufferMs
          ? key.toLowerCase()
          : typed.current.buffer + key.toLowerCase();
      typed.current = { buffer, at: now };
      const hit = items.findIndex(
        (item) => isSelectable(item) && itemText(item).toLowerCase().startsWith(buffer)
      );
      if (hit > -1) setActiveIndex(hit);
    },
    [bufferMs, items]
  );

  const resetActive = useCallback(
    (preferred?: number) => {
      if (preferred !== undefined && isSelectable(items[preferred])) {
        setActiveIndex(preferred);
        return;
      }
      setActiveIndex(firstSelectable());
    },
    [firstSelectable, items]
  );

  return {
    activeIndex,
    setActiveIndex,
    move,
    toStart,
    toEnd,
    typeahead,
    resetActive,
    firstSelectable,
  };
}
