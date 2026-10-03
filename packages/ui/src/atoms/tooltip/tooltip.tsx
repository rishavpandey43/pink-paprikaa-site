"use client";

import type { ReactElement } from "react";

import { Tooltip as TooltipPrimitive } from "radix-ui";

import type { SxProp } from "../../lib/common-props";

import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";

/** Tooltip.jsx shows the hint the moment the pointer arrives — no hover-intent delay. */
const OPEN_DELAY_MS = 0;
/** 8px from the trigger (Tooltip.jsx `calc(100% + 8px)`). Radix takes the offset in px. */
const SIDE_OFFSET_PX = 8;

/**
 * Ink pill, 12.5px, 6px radius, no arrow; fades in over 140ms (instantly with reduced motion).
 * Radix sizes the content to its max-content width, so a ≤5-word hint stays on one line as
 * Tooltip.jsx's `nowrap` does; `max-w-56` only makes a longer one wrap instead of leaving a phone.
 */
const tooltip = componentVariants({
  base: "z-tooltip max-w-56 rounded-sm bg-surface-inverse px-2.5 py-1.5 font-body text-caption text-text-on-inverse shadow-2 transition-opacity duration-fast ease-out starting:opacity-0",
});

export interface TooltipProps extends SxProp {
  /** Short hint, no full stop — never essential copy. Blank renders the trigger alone. */
  label: string;
  /** = "top" */
  side?: "top" | "bottom" | "left" | "right" | undefined;
  /** One focusable element that forwards props and ref (Button, IconButton, a native button). */
  children: ReactElement;
}

/** Names an icon-only control or explains a mark. Opens on hover and focus, closes on Escape. */
export function Tooltip({ label, side = "top", sx, children }: TooltipProps) {
  // R48: a blank label is no label — an empty pill would describe the trigger as nothing.
  if (label.trim() === "") return children;
  return (
    <TooltipPrimitive.Provider delayDuration={OPEN_DELAY_MS}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={SIDE_OFFSET_PX}
            className={tooltip({ className: withSx(sx, undefined) })}
          >
            {label}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
