"use client";

import type { ReactNode } from "react";

import { Toast as RadixToast } from "radix-ui";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import {
  NOTIFICATION_ICON,
  NOTIFICATION_SURFACE,
  type NotificationProps,
} from "../../lib/notification";
import { useControllableState } from "../../lib/use-controllable-state";

/** Radix Toast's own default time on screen. */
const TOAST_DURATION = 5000;

const toastViewport = componentVariants({
  base: "pointer-events-none z-toast m-0 flex list-none flex-col items-center gap-2 p-0",
  variants: {
    isContained: {
      /** The page edge, clear of the mobile action dock; 32px up from md. */
      false: "fixed inset-x-4 bottom-dock-clearance md:bottom-8",
      /** Inside the nearest positioned ancestor, e.g. AppShell's overlay slot. */
      true: "absolute inset-x-4 bottom-4",
    },
  },
  defaultVariants: { isContained: false },
});

const toast = componentVariants({
  slots: {
    root: "pointer-events-auto inline-flex max-w-full toast-swipe-y items-center gap-3 rounded-pill px-4 py-3 text-text-body shadow-3",
    message: "min-w-0 font-body text-toast font-medium text-pretty",
    // `min-h-hit` + `-my-3`: a 44px target that does not grow the pill (dev parity).
    action:
      "-my-3 inline-flex min-h-hit shrink-0 items-center rounded-xs px-0.5 font-display text-toast-action font-bold text-current uppercase active:press-scale",
  },
  variants: {
    tone: {
      brand: { root: "bg-surface-brand" },
      ink: { root: "bg-surface-inverse" },
      success: { root: "bg-toast-success-bg" },
      danger: { root: "bg-status-danger" },
    },
    isPop: { true: { root: "animate-toast-pop" } },
  },
  defaultVariants: { tone: "ink", isPop: false },
});

export interface ToastProviderProps {
  children: ReactNode;
  /** Default time on screen for every toast, ms. */
  duration?: number | undefined;
  /** Announced before each toast. */
  label?: string | undefined;
  /** Put the viewport inside the nearest positioned ancestor instead of at the page edge. */
  isContained?: boolean | undefined;
}

/**
 * Mount once: at the app root for page toasts (bottom-centre, above the mobile dock), or inside a
 * positioned frame such as AppShell's overlay slot with `isContained`. Every Toast rendered inside
 * it appears in its viewport.
 */
export function ToastProvider({
  children,
  duration = TOAST_DURATION,
  label = "Notification",
  isContained = false,
}: ToastProviderProps) {
  return (
    <RadixToast.Provider duration={duration} label={label} swipeDirection="down">
      {children}
      <RadixToast.Viewport className={toastViewport({ isContained })} />
    </RadixToast.Provider>
  );
}

export interface ToastProps extends NotificationProps {
  /** The single-overshoot entrance — add-to-cart and reward confirmations only. */
  isPop?: boolean | undefined;
}

/** Transient pill confirmation, no dismiss. Use Snackbar when the guest may want to undo. */
export function Toast({
  open,
  defaultOpen,
  onOpenChange,
  tone = "ink",
  icon,
  action,
  isPop = false,
  duration,
  className,
  children,
}: ToastProps) {
  const [isOpen, setIsOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen ?? true,
    onChange: onOpenChange,
  });
  const styles = toast({ tone, isPop });

  return (
    <RadixToast.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      // Severity picks the politeness (dev parity): a failure interrupts, a confirmation waits.
      type={tone === "danger" ? "foreground" : "background"}
      {...(duration === undefined ? {} : { duration })}
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
    </RadixToast.Root>
  );
}
