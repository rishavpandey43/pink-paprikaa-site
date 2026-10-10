import { type FocusEvent, useLayoutEffect, useRef } from "react";

/**
 * R82 / R91: hand focus back to what had it when a notification opened, instead of letting it
 * drop to `<body>` (or onto Radix's empty viewport) when the notification closes under focus.
 *
 * Radix never moves focus on open, so what has focus then is the element to return to. Spread
 * `focusProps` on the notification's root. Two close paths:
 *
 * - A Radix close (action, Dismiss, Escape, swipe, timer) parks focus on the viewport first: the
 *   caller checks that and calls `returnFocus()` from its `onOpenChange`.
 * - A parent setting `open` to false skips Radix and unmounts the notification with focus inside
 *   it. `onFocus` / `onBlur` track that, and the effect restores focus on close. React ignores the
 *   blur a removed node fires during a commit, so the flag still reads true after the unmount; a
 *   Radix close has already moved focus to the viewport, whose blur cleared it (no double restore).
 */
export function useFocusReturn(isOpen: boolean) {
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const isFocusInsideRef = useRef(false);

  function returnFocus(): void {
    const target = returnFocusRef.current;
    if (target?.isConnected === true) target.focus();
  }

  useLayoutEffect(() => {
    if (isOpen) {
      const active = document.activeElement;
      returnFocusRef.current = active instanceof HTMLElement ? active : null;
      return;
    }
    if (isFocusInsideRef.current) {
      isFocusInsideRef.current = false;
      returnFocus();
    }
  }, [isOpen]);

  return {
    returnFocus,
    focusProps: {
      onFocus: () => {
        isFocusInsideRef.current = true;
      },
      onBlur: (event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) isFocusInsideRef.current = false;
      },
    },
  };
}
