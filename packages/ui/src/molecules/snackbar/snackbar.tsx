"use client";

import { X } from "lucide-react";
import { Toast as RadixToast } from "radix-ui";
import { useLayoutEffect, useRef } from "react";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import {
  NOTIFICATION_ICON,
  NOTIFICATION_SURFACE,
  type NotificationProps,
} from "../../lib/notification";
import { useControllableState } from "../../lib/use-controllable-state";

/** The design system's auto-hide delay. */
const SNACKBAR_DURATION = 3200;

/** No F8 hotkey: the app's ToastProvider owns it. */
const NO_HOTKEY: string[] = [];

const snackbar = componentVariants({
  slots: {
    anchor: "pointer-events-none inset-x-6 z-toast m-0 flex list-none p-0",
    root: "pointer-events-auto flex w-full max-w-snackbar min-w-0 animate-sheet-in items-center gap-3 rounded-md py-3.25 pr-3.5 pl-4 text-text-body shadow-3",
    message: "min-w-0 flex-1 font-body text-snackbar font-medium text-pretty",
    // Hit areas (dev parity): the action is 44px tall (`min-h-hit`, margin pulled into the 13px
    // padding by `-my-3`); the 24px dismiss takes taps over 40px through `before:-inset-2`.
    action:
      "-my-3 inline-flex min-h-hit shrink-0 items-center rounded-xs px-1.5 font-display text-snackbar-action font-bold uppercase active:press-scale",
    dismiss:
      "relative grid size-6 shrink-0 place-items-center rounded-pill text-current opacity-70 transition-opacity duration-fast ease-out before:absolute before:-inset-2 hover:opacity-100",
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
    tone: {
      ink: { root: "bg-surface-inverse", action: "text-text-brand" },
      brand: { root: "bg-surface-brand", action: "text-text-body" },
      success: { root: "bg-snackbar-success-bg", action: "text-text-body" },
      danger: { root: "bg-status-danger", action: "text-text-body" },
    },
  },
  compoundVariants: [
    {
      isContained: false,
      position: ["bottom-center", "bottom-left", "bottom-right"],
      class: { anchor: "bottom-dock-clearance md:bottom-6" },
    },
  ],
  defaultVariants: { isContained: true, position: "bottom-center", tone: "ink" },
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
  tone = "ink",
  icon,
  action,
  duration = SNACKBAR_DURATION,
  position = "bottom-center",
  isContained = true,
  className,
  children,
}: SnackbarProps) {
  const [isOpen, setIsOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen ?? true,
    onChange: onOpenChange,
  });
  const styles = snackbar({ tone, position, isContained });
  const viewportRef = useRef<HTMLOListElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Remember what had focus when the bar opened (Radix never moves focus on open).
  useLayoutEffect(() => {
    if (!isOpen) return;
    const active = document.activeElement;
    returnFocusRef.current = active instanceof HTMLElement ? active : null;
  }, [isOpen]);

  // R82: on close Radix parks focus on its viewport, which unmounts with the bar and drops focus
  // to <body>. When focus is inside the bar, hand it back to what had it before the bar opened.
  function handleOpenChange(next: boolean): void {
    if (!next && viewportRef.current?.contains(document.activeElement) === true) {
      const target = returnFocusRef.current;
      if (target?.isConnected === true) target.focus();
    }
    setIsOpen(next);
  }

  if (!isOpen) return null;

  return (
    <RadixToast.Provider duration={duration} swipeDirection={SWIPE_DIRECTION[position]}>
      <RadixToast.Root
        open={isOpen}
        onOpenChange={handleOpenChange}
        // Severity picks the politeness (dev parity): a failure interrupts, a confirmation waits.
        type={tone === "danger" ? "foreground" : "background"}
        data-surface={NOTIFICATION_SURFACE[tone]}
        className={styles.root({ className })}
      >
        <Icon icon={icon ?? NOTIFICATION_ICON[tone]} size="md" />
        <RadixToast.Description className={styles.message()}>{children}</RadixToast.Description>
        {action === undefined ? null : (
          <RadixToast.Action
            altText={action.altText}
            onClick={action.onClick}
            className={styles.action()}
          >
            {action.label}
          </RadixToast.Action>
        )}
        <RadixToast.Close aria-label="Dismiss" className={styles.dismiss()}>
          <Icon icon={X} size="sm" />
        </RadixToast.Close>
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
