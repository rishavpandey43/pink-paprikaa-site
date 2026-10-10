"use client";

import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ReactElement, ReactNode } from "react";
import { useRef } from "react";

import { IconButton } from "../../atoms/icon-button/icon-button";
import type { BaseProps } from "../../lib/common-props";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { isShown } from "../../lib/is-shown";
import { reportOpenChange } from "../../lib/popover-shell";
import { withSx } from "../../lib/sx";

const dialog = componentVariants({
  slots: {
    overlay: "fixed inset-0 z-overlay flex bg-surface-overlay",
    // Only the body scrolls: the title, the close button and the footer's actions stay on screen.
    content: "flex max-h-full w-full flex-col overflow-hidden bg-surface-card shadow-4",
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
      modal: {
        overlay: "items-center justify-center p-6",
        content: "rounded-xl motion-safe:animate-pop-in",
      },
      sheet: { overlay: "items-end", content: "rounded-t-xl motion-safe:animate-sheet-in" },
      // Full height on one edge. `start-0` / `end-0` are logical, so the edge flips in RTL.
      drawer: { content: "h-full rounded-none" },
    },
    size: { sm: {}, md: {}, lg: {} },
    side: { start: {}, end: {} },
  },
  compoundVariants: [
    {
      variant: "drawer",
      side: "start",
      class: { overlay: "justify-start", content: "start-0 animate-drawer-in-start" },
    },
    {
      variant: "drawer",
      side: "end",
      class: { overlay: "justify-end", content: "end-0 animate-drawer-in-end" },
    },
    { variant: "drawer", size: "sm", class: { content: "max-w-dialog-drawer-sm" } },
    { variant: "drawer", size: "md", class: { content: "max-w-dialog-drawer-md" } },
    { variant: "drawer", size: "lg", class: { content: "max-w-dialog-drawer-lg" } },
    { variant: "modal", size: "sm", class: { content: "max-w-dialog-sm" } },
    { variant: "modal", size: "md", class: { content: "max-w-dialog-md" } },
    { variant: "modal", size: "lg", class: { content: "max-w-dialog-lg" } },
  ],
  defaultVariants: { variant: "modal", size: "md", side: "end" },
});

export interface DialogProps
  extends
    Omit<BaseProps<"div">, "title" | "children">,
    Pick<DialogPrimitive.DialogProps, "open" | "defaultOpen" | "onOpenChange">,
    Pick<VariantProps<typeof dialog>, "variant" | "size" | "side"> {
  /**
   * The element that opens the dialog, e.g. a Button; focus returns to it on close. Without one,
   * focus returns to the element focused when the dialog opened — reliable for keyboard opens, but
   * Safari and Firefox on macOS do not focus a button on click, so a dialog opened by pointer
   * returns focus to `<body>`. Pass a trigger where focus return must survive a pointer open.
   */
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
  /** Design `onClose` — called when the dialog goes from open to closed (R148). */
  onClose?: ((reason: string) => void) | undefined;
}

/**
 * A decision that must be made now: a centred modal (24px radius, `--shadow-4`, 56% ink scrim),
 * or a bottom sheet with a grab handle — the app default. Radix Dialog: focus is trapped, Escape
 * and the scrim close it, focus returns to the trigger (or, without one, to what had focus when it
 * opened — see `trigger` for pointer opens), the page behind cannot scroll.
 *
 * The Radix root renders no element, so the native props, `ref`, `className` and `sx` all land on
 * the panel (the element with `role="dialog"`).
 */
export function Dialog({
  trigger,
  title,
  description,
  children,
  footer,
  variant = "modal",
  size = "md",
  side = "end",
  closeLabel = "Close",
  hasCloseButton = true,
  portalContainer = null,
  open,
  defaultOpen,
  onOpenChange,
  onClose,
  sx,
  className,
  ...props
}: DialogProps) {
  const slots = dialog({ variant, size, side });
  // Radix refocuses only its own trigger on close; without one, focus would drop to <body>.
  const returnFocusRef = useRef<HTMLElement | null>(null);
  return (
    <DialogPrimitive.Root
      {...(open === undefined ? {} : { open })}
      {...(defaultOpen === undefined ? {} : { defaultOpen })}
      {...(onOpenChange === undefined && onClose === undefined
        ? {}
        : {
            onOpenChange: (next: boolean) => {
              reportOpenChange(next, onOpenChange, onClose);
            },
          })}
    >
      {trigger ? <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger> : null}
      <DialogPrimitive.Portal container={portalContainer}>
        <DialogPrimitive.Overlay className={slots.overlay()}>
          <DialogPrimitive.Content
            data-surface="light"
            {...props}
            className={slots.content({ className: withSx(sx, className) })}
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

export type DrawerProps = Omit<DialogProps, "variant">;

/**
 * A full-height panel on one edge — filters, the cart, a menu on mobile. Dialog's behaviour
 * (focus trap, Escape, scrim, focus return) with `side` ("end" by default, "start" for RTL-aware
 * left-hand drawers) and `size` as its max width (320 / 400 / 480px; full width below that).
 */
export function Drawer(props: DrawerProps) {
  return <Dialog variant="drawer" {...props} />;
}
