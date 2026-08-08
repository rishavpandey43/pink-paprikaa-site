"use client";

import type { ReactNode } from "react";

import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const dialog = componentVariants({
  slots: {
    /** The 56% ink scrim. Nothing is ever readable through it — that is the point. */
    overlay: "inset-0 z-50 bg-surface-overlay animate-pp-fade",
    content: [
      "z-50 flex flex-col overflow-hidden bg-surface-card shadow-elevation4",
      "animate-pp-rise",
    ],
    /** The sheet's grab handle. Purely an affordance, so it is hidden from assistive tech. */
    grabber: "mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-6 bg-ink-300",
    header: "flex shrink-0 items-start justify-between gap-4 px-6 pt-5",
    title: "min-w-0 font-display font-bold text-h3 leading-h3 tracking-h3 text-text-heading",
    description: "shrink-0 px-6 pt-1-5 font-body text-body2 leading-body2 text-text-muted",
    body: [
      "min-h-0 flex-1 overflow-y-auto px-6 pt-3 pb-5",
      "font-body text-body1 leading-body1 text-text-body",
    ],
    /** Buttons sit right, and wrap rather than shrink when two long labels meet 360px. */
    footer: "flex shrink-0 flex-wrap items-center justify-end gap-2.5 px-6 pb-6",
  },
  variants: {
    /**
     * `modal` is the centred decision box. `sheet` rises from the bottom edge with a grab handle
     * and only its top corners rounded — the app default on a phone, where a centred box leaves
     * the thumb nowhere useful to land.
     */
    variant: {
      modal: {
        content: [
          "top-1/2 left-1/2 max-h-[calc(100%-40px)] w-[calc(100%-40px)] rounded-5",
          "-translate-x-1/2 -translate-y-1/2",
        ],
      },
      sheet: { content: "inset-x-0 bottom-0 max-h-[calc(100%-56px)] w-full rounded-t-5" },
    },
    /** 328 / 460 / 640px, capped at the viewport. Ignored by `sheet`, which is always full width. */
    size: {
      sm: { content: "max-w-82" },
      md: { content: "max-w-115" },
      lg: { content: "max-w-160" },
    },
    /**
     * `container` swaps `fixed` for `absolute` so the dialog can be previewed inside a phone frame
     * — pass that frame as `container` too, or it portals to the body and the anchoring is lost.
     */
    position: {
      viewport: { content: "fixed", overlay: "fixed" },
      container: { content: "absolute", overlay: "absolute" },
    },
  },
  compoundVariants: [{ variant: "sheet", class: { content: "max-w-full" } }],
  defaultVariants: { variant: "modal", size: "md", position: "viewport" },
});

export interface DialogProps extends VariantProps<typeof dialog> {
  /**
   * Names the dialog, and is its accessible name — so it is required. Sentence case, and phrased
   * as the decision being asked for: "Remove this item?".
   */
  title: string;
  /** One line under the title saying what will happen. Wired as the dialog's description. */
  description?: string | undefined;
  /** The body. Form fields, a list, a sentence — whatever the decision needs. */
  children?: ReactNode | undefined;
  /** Buttons, right-aligned. The confirming action goes last. */
  footer?: ReactNode | undefined;
  /** The control that opens it. Leave it off and drive `isOpen` yourself. */
  trigger?: ReactNode | undefined;
  /** Drive it from outside. Leave unset and the trigger runs it. */
  isOpen?: boolean | undefined;
  /** Open it on mount — for stories and specimens, not for real pages. */
  isDefaultOpen?: boolean | undefined;
  /** Fires whenever the dialog opens or closes, controlled or not. */
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
  /** Drops the close glyph, for a decision that must be answered rather than dismissed. */
  hasCloseButton?: boolean | undefined;
  /** Accessible name for the close glyph. */
  closeLabel?: string | undefined;
  /** Portal target. Pass the positioned ancestor when `position` is `container`. */
  container?: HTMLElement | null | undefined;
  className?: string | undefined;
}

/**
 * The modal for a decision that has to be made now: a 24px card on a 56% ink scrim, with focus
 * trapped inside it and Escape wired to close — all of it Radix's, never hand-rolled. Reach for
 * `variant="sheet"` on a phone screen.
 */
export function Dialog({
  children,
  className,
  closeLabel = "Close",
  container,
  description,
  footer,
  hasCloseButton = true,
  isDefaultOpen,
  isOpen,
  onOpenChange,
  position,
  size,
  title,
  trigger,
  variant,
}: DialogProps) {
  const slots = dialog({ position, size, variant });

  // Radix declares these three without `| undefined`, and the workspace runs
  // `exactOptionalPropertyTypes`, so an unset prop has to be left off rather than passed through
  // as `undefined` — which is also exactly what "uncontrolled" means to Radix.
  const rootProps: DialogPrimitive.DialogProps = {};
  if (isDefaultOpen !== undefined) rootProps.defaultOpen = isDefaultOpen;
  if (isOpen !== undefined) rootProps.open = isOpen;
  if (onOpenChange !== undefined) rootProps.onOpenChange = onOpenChange;

  const portalProps: DialogPrimitive.DialogPortalProps = {};
  if (container !== null && container !== undefined) portalProps.container = container;

  // Radix wires `aria-describedby` to its own `Description` and warns in development when neither
  // that nor an explicit `aria-describedby={undefined}` is present. A dialog whose body is a form
  // has no one-line description, so the opt-out is set for it rather than inventing prose.
  const contentProps = description === undefined ? { "aria-describedby": undefined } : {};

  return (
    <DialogPrimitive.Root {...rootProps}>
      {trigger === undefined ? null : (
        <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      )}
      <DialogPrimitive.Portal {...portalProps}>
        <DialogPrimitive.Overlay className={slots.overlay()} />
        <DialogPrimitive.Content className={slots.content({ class: className })} {...contentProps}>
          {variant === "sheet" ? <span aria-hidden className={slots.grabber()} /> : null}
          <div className={slots.header()}>
            <DialogPrimitive.Title className={slots.title()}>{title}</DialogPrimitive.Title>
            {hasCloseButton ? (
              <DialogPrimitive.Close asChild>
                <IconButton icon={X} label={closeLabel} size="sm" />
              </DialogPrimitive.Close>
            ) : null}
          </div>
          {description === undefined ? null : (
            <DialogPrimitive.Description className={slots.description()}>
              {description}
            </DialogPrimitive.Description>
          )}
          <div className={slots.body()}>{children}</div>
          {footer === undefined ? null : <div className={slots.footer()}>{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
