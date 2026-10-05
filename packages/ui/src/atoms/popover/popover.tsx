"use client";

import type { ReactNode } from "react";

import { X } from "lucide-react";
import { Popover as RadixPopover } from "radix-ui";
import { createElement, useId } from "react";

import type { BaseProps } from "../../lib/common-props";
import type { HeadingLevel } from "../../lib/heading";

import { componentVariants } from "../../lib/component-variants";
import { headingTag } from "../../lib/heading";
import { iconButtonVariants } from "../../lib/icon-button-variants";
import { isShown } from "../../lib/is-shown";
import { withSx } from "../../lib/sx";
import { Icon } from "../icon/icon";

const popover = componentVariants({
  slots: {
    content:
      "z-overlay max-w-popover-max-w rounded-lg border-default border-border-subtle bg-surface-card p-popover-pad text-body-sm text-text-body shadow-3 outline-none",
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
  /** Names the popover (`aria-labelledby`). Without one, pass `aria-label`. */
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
  /** Portal target; default `document.body`. */
  portalContainer?: HTMLElement | null | undefined;
}

/**
 * A small panel anchored to a trigger: what is in the thali, why a charge applies. Not modal — the
 * page behind stays usable — but focus moves in, Escape closes it and returns focus to the
 * trigger, and an outside click dismisses it. Radix Popover. For a decision that must be made, use
 * Dialog; for a list of actions, use Menu.
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
  portalContainer = null,
  sx,
  className,
  ...props
}: PopoverProps) {
  const titleId = useId();
  const hasTitle = isShown(title);
  const hasTitleRow = hasTitle || hasCloseButton;
  const slots = popover({ hasTitleRow });
  return (
    <RadixPopover.Root
      {...(open === undefined ? {} : { open })}
      {...(defaultOpen === undefined ? {} : { defaultOpen })}
      {...(onOpenChange === undefined ? {} : { onOpenChange })}
    >
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal container={portalContainer}>
        <RadixPopover.Content
          data-surface="light"
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={16}
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
          {hasArrow ? <RadixPopover.Arrow className={slots.arrow()} /> : null}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
