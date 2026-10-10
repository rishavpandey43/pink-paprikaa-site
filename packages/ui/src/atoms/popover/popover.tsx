"use client";

import { X } from "lucide-react";
import { Popover as RadixPopover } from "radix-ui";
import type { ReactNode } from "react";
import { createElement, useId } from "react";

import type { BaseProps } from "../../lib/common-props";
import { componentVariants } from "../../lib/component-variants";
import type { HeadingLevel } from "../../lib/heading";
import { headingTag } from "../../lib/heading";
import { iconButtonVariants } from "../../lib/icon-button-variants";
import { isShown } from "../../lib/is-shown";
import {
  PopoverSheetChrome,
  popoverShellVariants,
  reportOpenChange,
  type SheetMode,
  useAsSheet,
} from "../../lib/popover-shell";
import { withSx } from "../../lib/sx";
import { Icon } from "../icon/icon";

const popover = componentVariants({
  slots: {
    content: `${popoverShellVariants().floating()} max-w-popover-max-w p-popover-pad`,
    popIn: popoverShellVariants().popIn(),
    header: "flex items-start justify-between gap-3",
    title: "font-display text-h4 text-text-heading",
    body: "",
    arrow: "fill-surface-card",
  },
  variants: {
    hasTitleRow: { true: { body: "mt-2" } },
  },
});

export interface PopoverProps extends Omit<BaseProps<"div">, "title" | "children"> {
  /** The element that opens it, rendered through Radix Trigger `asChild`: one focusable element that forwards props and ref (Button, IconButton). */
  trigger: ReactNode;
  children: ReactNode;
  /** Names the popover (`aria-labelledby`). Without one, pass `aria-label`. Sheet heading when `sheet` is on. */
  title?: ReactNode | undefined;
  /** Default 2. */
  headingLevel?: HeadingLevel | undefined;
  /** Default "bottom". Flips when there is no room. */
  side?: "top" | "right" | "bottom" | "left" | undefined;
  /** Default "center". */
  align?: "start" | "center" | "end" | undefined;
  hasArrow?: boolean | undefined;
  hasCloseButton?: boolean | undefined;
  /** Default "Close". */
  closeLabel?: string | undefined;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Design `onClose` — called when the popover goes from open to closed (R148). */
  onClose?: ((reason: string) => void) | undefined;
  /** Portal target; default `document.body`. */
  portalContainer?: HTMLElement | null | undefined;
  /** `"auto"` = bottom sheet at ≤640px. */
  sheet?: SheetMode | undefined;
  /** In-flow specimen (no portal / floating). */
  inline?: boolean | undefined;
}

/**
 * A small panel anchored to a trigger: what is in the thali, why a charge applies. Not modal — the
 * page behind stays usable — but focus moves in, Escape closes it and returns focus to the
 * trigger, and an outside click dismisses it. Radix Popover. For a decision that must be made, use
 * Dialog; for a list of actions, use Menu. At ≤640px (`sheet="auto"`) it becomes a bottom sheet.
 *
 * The Radix root renders no element, so the native props, `ref`, `className` and `sx` all land on
 * the panel (the element with `role="dialog"`).
 */
export function Popover({
  trigger,
  children,
  title,
  headingLevel = 2,
  side = "bottom",
  align = "center",
  hasArrow = false,
  hasCloseButton = false,
  closeLabel = "Close",
  open,
  defaultOpen,
  onOpenChange,
  onClose,
  portalContainer = null,
  sheet = "auto",
  inline = false,
  sx,
  className,
  ...props
}: PopoverProps) {
  const titleId = useId();
  const hasTitle = isShown(title);
  const hasTitleRow = hasTitle || hasCloseButton;
  const isSheet = useAsSheet(inline ? false : sheet);
  const slots = popover({ hasTitleRow });
  const shell = popoverShellVariants();

  if (inline) {
    if (sheet === true) {
      return (
        <div className={withSx(sx, className)}>
          <PopoverSheetChrome title={title} isAnimated={false}>
            {children}
          </PopoverSheetChrome>
        </div>
      );
    }
    return (
      <div
        data-surface="light"
        role="dialog"
        {...(hasTitle ? { "aria-labelledby": titleId } : {})}
        {...props}
        className={slots.content({ className: withSx(sx, className) })}
      >
        {hasTitleRow ? (
          <div className={slots.header()}>
            {hasTitle
              ? createElement(
                  headingTag(headingLevel),
                  { id: titleId, className: slots.title() },
                  title
                )
              : null}
          </div>
        ) : null}
        <div className={slots.body()}>{children}</div>
      </div>
    );
  }

  return (
    <RadixPopover.Root
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
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal container={portalContainer}>
        {isSheet ? (
          <div className={shell.overlay()}>
            <RadixPopover.Content
              data-surface="light"
              {...(hasTitle ? { "aria-labelledby": titleId } : {})}
              {...props}
              className="sheet-pin w-full border-0 bg-transparent p-0 shadow-none outline-none"
              style={{
                position: "fixed",
                inset: "auto 0 0 0",
                maxWidth: "100%",
                transform: "none",
              }}
              onOpenAutoFocus={(event) => {
                event.preventDefault();
              }}
            >
              <PopoverSheetChrome
                title={
                  hasTitle ? (
                    <span id={titleId} className="contents">
                      {title}
                    </span>
                  ) : undefined
                }
              >
                {children}
              </PopoverSheetChrome>
            </RadixPopover.Content>
          </div>
        ) : (
          <RadixPopover.Content
            data-surface="light"
            side={side}
            align={align}
            sideOffset={6}
            collisionPadding={16}
            {...(hasTitle ? { "aria-labelledby": titleId } : {})}
            {...props}
            className={slots.content({ className: withSx(sx, className) })}
          >
            <div className={slots.popIn()}>
              {hasTitleRow ? (
                <div className={slots.header()}>
                  {hasTitle
                    ? createElement(
                        headingTag(headingLevel),
                        { id: titleId, className: slots.title() },
                        title
                      )
                    : null}
                  {hasCloseButton ? (
                    <RadixPopover.Close asChild>
                      <button
                        type="button"
                        aria-label={closeLabel}
                        className={iconButtonVariants({ variant: "ghost", size: "sm" }).root({
                          className: "ms-auto",
                        })}
                      >
                        <Icon icon={X} size="sm" />
                      </button>
                    </RadixPopover.Close>
                  ) : null}
                </div>
              ) : null}
              <div className={slots.body()}>{children}</div>
            </div>
            {hasArrow ? <RadixPopover.Arrow className={slots.arrow()} /> : null}
          </RadixPopover.Content>
        )}
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
