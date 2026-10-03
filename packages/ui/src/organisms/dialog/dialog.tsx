"use client";

import type { ReactElement, ReactNode } from "react";

import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useRef } from "react";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { isShown } from "../../lib/is-shown";

const dialog = componentVariants({
  slots: {
    overlay: "fixed inset-0 z-overlay flex bg-surface-overlay",
    // Only the body scrolls: the title, the close button and the footer's actions stay on screen.
    content:
      "flex max-h-full w-full animate-sheet-in flex-col overflow-hidden bg-surface-card shadow-4",
    handle: "flex shrink-0 justify-center pt-2.5",
    handleBar: "h-1 w-10 rounded-pill bg-ink-300",
    header: "flex shrink-0 items-start justify-between gap-4 px-6 pt-5",
    title: "font-display text-dialog-title text-text-heading",
    description: "shrink-0 px-6 pt-1 text-body-sm text-text-muted",
    body: "min-h-0 flex-1 overflow-y-auto px-6 pt-3 pb-5 text-dialog-body text-text-body",
    footer: "flex shrink-0 flex-wrap justify-end gap-2.5 px-6 pb-6",
  },
  variants: {
    variant: {
      modal: { overlay: "items-center justify-center p-6", content: "rounded-xl" },
      sheet: { overlay: "items-end", content: "rounded-t-xl" },
    },
    size: { sm: {}, md: {}, lg: {} },
  },
  compoundVariants: [
    { variant: "modal", size: "sm", class: { content: "max-w-dialog-sm" } },
    { variant: "modal", size: "md", class: { content: "max-w-dialog-md" } },
    { variant: "modal", size: "lg", class: { content: "max-w-dialog-lg" } },
  ],
  defaultVariants: { variant: "modal", size: "md" },
});

export interface DialogProps
  extends
    Pick<DialogPrimitive.DialogProps, "open" | "defaultOpen" | "onOpenChange">,
    Pick<VariantProps<typeof dialog>, "variant" | "size"> {
  /** The element that opens the dialog, e.g. a Button. */
  trigger?: ReactElement | undefined;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Buttons, right-aligned. */
  footer?: ReactNode;
  closeLabel?: string | undefined;
  /**
   * `false` hides the close button only. Escape and the scrim still ask to close through
   * `onOpenChange` — a decision that must be answered is controlled, keeps itself open, and gives
   * its own action buttons in `footer`.
   */
  hasCloseButton?: boolean | undefined;
  /** Portal target; default `document.body`. Pass a positioned frame (AppShell's overlay slot) to keep the dialog inside it. */
  portalContainer?: HTMLElement | null | undefined;
  /** Merged onto the panel (the element with `role="dialog"`). */
  className?: string | undefined;
}

/**
 * A decision that must be made now: a centred modal (24px radius, `--shadow-4`, 56% ink scrim),
 * or a bottom sheet with a grab handle — the app default. Radix Dialog: focus is trapped, Escape
 * and the scrim close it, focus returns to the trigger (or, without one, to what had focus when it
 * opened), the page behind cannot scroll.
 */
export function Dialog({
  trigger,
  title,
  description,
  children,
  footer,
  variant = "modal",
  size = "md",
  closeLabel = "Close",
  hasCloseButton = true,
  portalContainer = null,
  className,
  ...root
}: DialogProps) {
  const slots = dialog({ variant, size });
  // Radix refocuses only its own trigger on close; without one, focus would drop to <body>.
  const returnFocusRef = useRef<HTMLElement | null>(null);
  return (
    <DialogPrimitive.Root {...root}>
      {trigger ? <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger> : null}
      <DialogPrimitive.Portal container={portalContainer}>
        <DialogPrimitive.Overlay className={slots.overlay()}>
          <DialogPrimitive.Content
            data-surface="light"
            className={slots.content({ className })}
            onOpenAutoFocus={() => {
              const active = document.activeElement;
              returnFocusRef.current = active instanceof HTMLElement ? active : null;
            }}
            onCloseAutoFocus={
              trigger
                ? undefined
                : (event) => {
                    event.preventDefault();
                    if (returnFocusRef.current?.isConnected === true)
                      returnFocusRef.current.focus();
                  }
            }
          >
            {variant === "sheet" ? (
              <div aria-hidden className={slots.handle()}>
                <span className={slots.handleBar()} />
              </div>
            ) : null}
            <div className={slots.header()}>
              <DialogPrimitive.Title className={slots.title()}>{title}</DialogPrimitive.Title>
              {hasCloseButton ? (
                <DialogPrimitive.Close asChild>
                  <IconButton icon={X} label={closeLabel} size="sm" variant="ghost" />
                </DialogPrimitive.Close>
              ) : null}
            </div>
            {isShown(description) ? (
              <DialogPrimitive.Description className={slots.description()}>
                {description}
              </DialogPrimitive.Description>
            ) : null}
            {isShown(children) ? <div className={slots.body()}>{children}</div> : null}
            {isShown(footer) ? <div className={slots.footer()}>{footer}</div> : null}
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
