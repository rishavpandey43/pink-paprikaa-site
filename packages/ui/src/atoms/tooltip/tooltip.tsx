"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Tooltip as TooltipPrimitive } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";

const tooltip = componentVariants({
  base: [
    "z-50 max-w-56 rounded-2 bg-surface-inverse px-3 py-1-5 shadow-elevation2",
    "font-body text-caption leading-caption text-text-on-inverse",
    // No arrow, and a fade rather than a slide: the hint appears, it does not travel.
    "animate-pp-fade",
  ],
});

export interface TooltipProviderProps {
  children: ReactNode;
  /** How long the pointer must rest on a trigger before the hint opens. Keyboard focus is instant. */
  delayDuration?: number | undefined;
  /** How long a guest may move between triggers before the delay applies again. */
  skipDelayDuration?: number | undefined;
}

/**
 * Mount once, high in the tree — `Tooltip` throws without it, and sharing one provider is what
 * lets a guest sweep across a row of icon buttons without waiting out the delay at every stop.
 */
export function TooltipProvider({
  children,
  delayDuration = 200,
  skipDelayDuration = 300,
}: TooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

export interface TooltipProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "aria-label" | "children"
> {
  /**
   * The hint itself. Five words at most, sentence case, no full stop. It is also the pill's
   * accessible name, which is why there is no separate `aria-label`.
   */
  label: string;
  /** The control being named. It becomes the trigger, so pass exactly one element. */
  children: ReactNode;
  /** Which side of the trigger the pill sits on. It flips itself if there is no room. */
  side?: "top" | "bottom" | "left" | "right" | undefined;
  /** Open it on mount — for specimens and stories, not for real pages. */
  isDefaultOpen?: boolean | undefined;
  /** Drive it from outside. Leave unset and the trigger's own hover and focus run it. */
  isOpen?: boolean | undefined;
  /** Fires whenever the hint opens or closes, controlled or not. */
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
}

export function Tooltip({
  className,
  label,
  children,
  side = "top",
  isDefaultOpen,
  isOpen,
  onOpenChange,
  ...props
}: TooltipProps) {
  // Radix declares these three without `| undefined`, and the workspace runs
  // `exactOptionalPropertyTypes`, so an unset prop has to be left off rather than passed through
  // as `undefined` — which is also exactly what "uncontrolled" means to Radix.
  const rootProps: TooltipPrimitive.TooltipProps = {};
  if (isDefaultOpen !== undefined) rootProps.defaultOpen = isDefaultOpen;
  if (isOpen !== undefined) rootProps.open = isOpen;
  if (onOpenChange !== undefined) rootProps.onOpenChange = onOpenChange;

  return (
    <TooltipPrimitive.Root {...rootProps}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          className={tooltip({ className })}
          side={side}
          sideOffset={8}
          {...props}
        >
          {label}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
