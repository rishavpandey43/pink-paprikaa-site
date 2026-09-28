"use client";

import { X } from "lucide-react";

import { Icon } from "../../atoms/icon/icon";

export interface AlertDismissProps {
  onDismiss: () => void;
}

/** Alert's dismiss button — the one interactive corner of an otherwise static molecule. */
export function AlertDismiss({ onDismiss }: AlertDismissProps) {
  return (
    <button
      type="button"
      aria-label="Dismiss"
      onClick={onDismiss}
      // 24px to see, 40px to hit (`before:-inset-2`, dev parity): the pseudo-element takes the tap.
      className="relative grid size-6 shrink-0 place-items-center rounded-pill text-current transition-opacity duration-fast ease-out before:absolute before:-inset-2 hover:opacity-70"
    >
      <Icon icon={X} size="sm" />
    </button>
  );
}
