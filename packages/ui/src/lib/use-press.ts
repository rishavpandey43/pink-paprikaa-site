import {
  type FocusEventHandler,
  type KeyboardEventHandler,
  type PointerEventHandler,
  useState,
} from "react";

type PressableElement = HTMLElement;

export interface UsePressOptions<E extends PressableElement> {
  onPointerDown?: PointerEventHandler<E> | undefined;
  onPointerUp?: PointerEventHandler<E> | undefined;
  onPointerLeave?: PointerEventHandler<E> | undefined;
  onKeyDown?: KeyboardEventHandler<E> | undefined;
  onKeyUp?: KeyboardEventHandler<E> | undefined;
  onBlur?: FocusEventHandler<E> | undefined;
  disabled?: boolean | undefined;
}

/**
 * Press feedback for Space/Enter and pointer (R139). Spread `pressProps` on the pressable element;
 * when pressed it sets `data-pressed=""` so CSS can style it (active alone cannot show keyboard press).
 * Callers' handlers still run; this never preventDefaults.
 */
export function usePress<E extends PressableElement = HTMLButtonElement>(
  options: UsePressOptions<E> = {}
) {
  const [isPressed, setIsPressed] = useState(false);
  const disabled = options.disabled === true;

  const clear = () => {
    setIsPressed(false);
  };

  const pressProps = {
    onPointerDown: ((event) => {
      options.onPointerDown?.(event);
      if (disabled || event.defaultPrevented) return;
      setIsPressed(true);
    }) as PointerEventHandler<E>,
    onPointerUp: ((event) => {
      options.onPointerUp?.(event);
      clear();
    }) as PointerEventHandler<E>,
    onPointerLeave: ((event) => {
      options.onPointerLeave?.(event);
      clear();
    }) as PointerEventHandler<E>,
    onKeyDown: ((event) => {
      options.onKeyDown?.(event);
      if (disabled || event.defaultPrevented) return;
      if (event.key === "Enter" || event.key === " ") setIsPressed(true);
    }) as KeyboardEventHandler<E>,
    onKeyUp: ((event) => {
      options.onKeyUp?.(event);
      if (event.key === "Enter" || event.key === " ") clear();
    }) as KeyboardEventHandler<E>,
    onBlur: ((event) => {
      options.onBlur?.(event);
      clear();
    }) as FocusEventHandler<E>,
    "data-pressed": isPressed && !disabled ? "" : undefined,
  };

  return { isPressed: isPressed && !disabled, pressProps };
}
