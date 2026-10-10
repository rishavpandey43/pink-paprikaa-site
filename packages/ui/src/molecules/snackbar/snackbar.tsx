"use client";

import { X } from "lucide-react";
import { Toast as RadixToast } from "radix-ui";
import { useRef } from "react";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { Icon } from "../../atoms/icon/icon";
import { TextButton } from "../../atoms/text-button/text-button";
import { componentVariants } from "../../lib/component-variants";
import {
  NOTIFICATION_ICON,
  NOTIFICATION_SURFACE,
  type NotificationProps,
} from "../../lib/notification";
import { withSx } from "../../lib/sx";
import { useControllableState } from "../../lib/use-controllable-state";
import { useFocusReturn } from "../../lib/use-focus-return";

/** The design system's auto-hide delay. */
const SNACKBAR_DURATION = 3200;

/** No F8 hotkey: the app's ToastProvider owns it. */
const NO_HOTKEY: string[] = [];

const snackbar = componentVariants({
  slots: {
    anchor: "pointer-events-none inset-x-6 z-toast m-0 flex list-none p-0",
    root: "pointer-events-auto flex w-full max-w-snackbar min-w-0 toast-swipe-y animate-sheet-in items-center gap-3 rounded-md py-3.25 pr-3.5 pl-4 text-text-body shadow-3",
    message: "min-w-0 flex-1 font-body text-snackbar font-medium text-pretty",
    // Hit areas (dev parity): the action is 44px tall (`min-h-hit`, margin pulled into the 13px
    // padding by `-my-3`); the 24px dismiss takes taps over 40px through `before:-inset-2`.
    action: "-my-3 -mr-2 shrink-0",
    // Margin only — IconButton xs owns the glyph size and expanded hit area.
    dismiss: "-mr-1 shrink-0",
  },
  variants: {
    isContained: {
      /** Inside the nearest positioned ancestor (AppShell, or a `relative` wrapper). */
      true: { anchor: "absolute" },
      /** The window edge. */
      false: { anchor: "fixed" },
    },
    position: {
      "bottom-center": { anchor: "bottom-6 justify-center" },
      "bottom-left": { anchor: "bottom-6 justify-start" },
      "bottom-right": { anchor: "bottom-6 justify-end" },
      "top-center": { anchor: "top-6 justify-center" },
      "top-right": { anchor: "top-6 justify-end" },
    },
    color: {
      neutral: { root: "bg-surface-inverse" },
      brand: { root: "bg-surface-brand" },
      success: { root: "bg-snackbar-success-bg" },
      danger: { root: "bg-status-danger" },
    },
  },
  compoundVariants: [
    {
      isContained: false,
      position: ["bottom-center", "bottom-left", "bottom-right"],
      class: { anchor: "bottom-dock-clearance md:bottom-6" },
    },
  ],
  defaultVariants: { isContained: true, position: "bottom-center", color: "neutral" },
});

type SnackbarPosition =
  "bottom-center" | "bottom-left" | "bottom-right" | "top-center" | "top-right";

/** Swipe towards the edge the bar is anchored to. */
const SWIPE_DIRECTION: Readonly<Record<SnackbarPosition, "up" | "down">> = {
  "bottom-center": "down",
  "bottom-left": "down",
  "bottom-right": "down",
  "top-center": "up",
  "top-right": "up",
};

/** Toast's props minus `isPop` (contract §5), plus where the bar sits. */
export interface SnackbarProps extends NotificationProps {
  position?: SnackbarPosition | undefined;
  /** Anchor to the nearest positioned ancestor (default); `false` pins the bar to the window edge. */
  isContained?: boolean | undefined;
}

/**
 * Anchored confirmation bar for a completed action that may need an escape hatch — copying a code,
 * undoing a removal, retrying a failure. A squared bar with an optional text action and a dismiss;
 * auto-hides after 3.2s. Never show a Snackbar and a Toast at once.
 */
export function Snackbar({
  open,
  defaultOpen,
  onOpenChange,
  color = "neutral",
  icon,
  action,
  duration = SNACKBAR_DURATION,
  position = "bottom-center",
  isContained = true,
  sx,
  className,
  children,
  ref,
  onFocus,
  onBlur,
  ...props
}: SnackbarProps) {
  const [isOpen, setIsOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen ?? true,
    onChange: onOpenChange,
  });
  const styles = snackbar({ color, position, isContained });
  const viewportRef = useRef<HTMLOListElement>(null);
  const { returnFocus, focusProps } = useFocusReturn(isOpen);

  // R82: on close Radix parks focus on its viewport, which unmounts with the bar and drops focus
  // to <body>. When focus is inside the bar, hand it back to what had it before the bar opened.
  function handleOpenChange(next: boolean): void {
    if (!next && viewportRef.current?.contains(document.activeElement) === true) returnFocus();
    setIsOpen(next);
  }

  if (!isOpen) return null;

  return (
    <RadixToast.Provider duration={duration} swipeDirection={SWIPE_DIRECTION[position]}>
      <RadixToast.Root
        {...props}
        ref={ref}
        open={isOpen}
        onOpenChange={handleOpenChange}
        // Severity picks the politeness (dev parity): a failure interrupts, a confirmation waits.
        type={color === "danger" ? "foreground" : "background"}
        data-surface={NOTIFICATION_SURFACE[color]}
        className={styles.root({ className: withSx(sx, className) })}
        onFocus={(event) => {
          focusProps.onFocus();
          onFocus?.(event);
        }}
        onBlur={(event) => {
          focusProps.onBlur(event);
          onBlur?.(event);
        }}
      >
        <Icon icon={icon ?? NOTIFICATION_ICON[color]} size="md" />
        <RadixToast.Description className={styles.message()}>{children}</RadixToast.Description>
        {action === undefined ? null : (
          <RadixToast.Action asChild altText={action.altText}>
            <TextButton
              type="button"
              size="sm"
              isCaps
              color="brand"
              disabled={action.disabled === true}
              onClick={action.onClick}
              className={styles.action()}
            >
              {action.label}
            </TextButton>
          </RadixToast.Action>
        )}
        {onOpenChange === undefined ? null : (
          <RadixToast.Close asChild>
            <IconButton
              icon={X}
              label="Dismiss"
              size="xs"
              variant="tint"
              className={styles.dismiss()}
            />
          </RadixToast.Close>
        )}
      </RadixToast.Root>
      <RadixToast.Viewport
        ref={viewportRef}
        label="Messages"
        hotkey={NO_HOTKEY}
        className={styles.anchor()}
      />
    </RadixToast.Provider>
  );
}
