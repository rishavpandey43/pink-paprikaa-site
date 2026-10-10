"use client";

import { X } from "lucide-react";

import { IconButton } from "../../atoms/icon-button/icon-button";

export interface AlertDismissProps {
  onDismiss: () => void;
}

/** Alert's dismiss button — IconButton xs on the tint surface (design Alert.jsx). */
export function AlertDismiss({ onDismiss }: AlertDismissProps) {
  return (
    <IconButton
      icon={X}
      label="Dismiss"
      size="xs"
      variant="tint"
      className="-my-1 -me-1.5 shrink-0"
      onClick={onDismiss}
    />
  );
}
