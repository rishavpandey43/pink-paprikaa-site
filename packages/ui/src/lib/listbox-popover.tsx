"use client";

import type { ReactNode } from "react";

import { Popover as RadixPopover } from "radix-ui";

import {
  PopoverSheetChrome,
  popoverShellVariants,
  type SheetMode,
  useAsSheet,
} from "./popover-shell";

/**
 * Anchored listbox surface for Select / Combobox (Radix Popover + sheet shell).
 * Lives in lib so atoms never import the Popover atom. Focus stays on the trigger.
 */
export function ListboxPopover({
  open,
  onOpenChange,
  trigger,
  children,
  sheet = "auto",
  portalContainer = null,
  title,
  "aria-label": ariaLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  sheet?: SheetMode | undefined;
  portalContainer?: HTMLElement | null | undefined;
  title?: ReactNode | undefined;
  "aria-label"?: string | undefined;
}) {
  const isSheet = useAsSheet(open ? sheet : false);
  const shell = popoverShellVariants();
  const hasTitle = title !== undefined && title !== null && title !== false && title !== "";

  return (
    <RadixPopover.Root open={open} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal container={portalContainer}>
        {isSheet ? (
          <div className={shell.overlay()}>
            <RadixPopover.Content
              data-surface="light"
              aria-label={ariaLabel}
              className="w-full border-0 bg-transparent p-0 shadow-none outline-none"
              style={{
                position: "fixed",
                inset: "auto 0 0 0",
                transform: "none",
                maxWidth: "100%",
              }}
              onOpenAutoFocus={(event) => {
                event.preventDefault();
              }}
            >
              <PopoverSheetChrome title={hasTitle ? title : undefined}>
                {children}
              </PopoverSheetChrome>
            </RadixPopover.Content>
          </div>
        ) : (
          <RadixPopover.Content
            data-surface="light"
            side="bottom"
            align="start"
            sideOffset={6}
            collisionPadding={16}
            aria-label={ariaLabel}
            className="z-overlay max-w-none border-0 bg-transparent p-0 shadow-none outline-none"
            onOpenAutoFocus={(event) => {
              event.preventDefault();
            }}
          >
            <div className={shell.popIn()}>{children}</div>
          </RadixPopover.Content>
        )}
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
