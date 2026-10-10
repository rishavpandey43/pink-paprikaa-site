"use client";

import { Menu, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { type MouseEvent, type ReactNode, useState } from "react";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { componentVariants } from "../../lib/component-variants";

const drawer = componentVariants({
  slots: {
    overlay: "fixed inset-0 z-overlay bg-surface-overlay",
    content:
      "fixed inset-x-0 top-0 z-overlay flex max-h-dvh animate-sheet-in flex-col overflow-y-auto bg-surface-card shadow-4",
    bar: "container-page flex h-header-compact shrink-0 items-center justify-end",
    body: "container-page flex flex-col gap-4 pb-5",
  },
});

export interface SiteHeaderDrawerProps {
  /** Names the menu button and the drawer. */
  menuLabel: string;
  closeLabel: string;
  /** Visibility classes for the menu button (the organism decides the breakpoints). */
  triggerClassName: string;
  portalContainer: HTMLElement | null;
  /** The drawer's nav and actions, rendered by the server organism. */
  children: ReactNode;
}

/**
 * The header's menu: a Radix Dialog sheet from the top. Focus is trapped, Escape closes it, focus
 * returns to the menu button, the page behind cannot scroll, and following any link closes it.
 */
export function SiteHeaderDrawer({
  menuLabel,
  closeLabel,
  triggerClassName,
  portalContainer,
  children,
}: SiteHeaderDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const slots = drawer();

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("a[href]") !== null) {
      setIsOpen(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <IconButton
          icon={Menu}
          label={menuLabel}
          variant="secondary"
          className={triggerClassName}
        />
      </Dialog.Trigger>
      <Dialog.Portal container={portalContainer}>
        <Dialog.Overlay className={slots.overlay()} />
        <Dialog.Content data-surface="light" className={slots.content()} onClick={handleClick}>
          <Dialog.Title className="sr-only">{menuLabel}</Dialog.Title>
          <div className={slots.bar()}>
            <Dialog.Close asChild>
              <IconButton icon={X} label={closeLabel} variant="secondary" />
            </Dialog.Close>
          </div>
          <div className={slots.body()}>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
