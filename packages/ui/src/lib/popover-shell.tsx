"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { componentVariants } from "./component-variants";

/** Design sheet breakpoint (INTERACTIONS / Popover.jsx). Not in the 480/768 ladder. */
export const SHEET_MEDIA_QUERY = "(max-width: 640px)";

export type SheetMode = "auto" | boolean;

/**
 * `true` / `false` force the mode; `"auto"` follows `matchMedia` at 640px (SSR → false until
 * mount).
 */
function readSheetMedia(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(SHEET_MEDIA_QUERY).matches
  );
}

export function useAsSheet(sheet: SheetMode = "auto"): boolean {
  // Sync initial read so the first open at ≤640 is already a sheet (avoids a floating flash
  // that can land off-screen before the effect runs).
  const [isMobile, setIsMobile] = useState(readSheetMedia);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(SHEET_MEDIA_QUERY);
    const sync = () => {
      setIsMobile(mq.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
    };
  }, []);
  if (sheet === true) return true;
  if (sheet === false) return false;
  return isMobile;
}

export const popoverShellVariants = componentVariants({
  slots: {
    overlay: "fixed inset-0 z-overlay flex items-end bg-surface-overlay",
    sheet:
      "flex max-h-menu-sheet w-full flex-col overflow-hidden rounded-t-xl bg-surface-card shadow-4",
    handle: "flex shrink-0 justify-center pt-2.5",
    handleBar: "h-1 w-10 rounded-pill bg-ink-300",
    title: "shrink-0 px-6 pt-3.5 pb-1.5 font-display text-body-lg font-bold text-text-heading",
    body: "min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-1 pb-4 outline-none",
    floating:
      "z-overlay overflow-hidden rounded-md border-default border-border-subtle bg-surface-card text-body-sm text-text-body shadow-3 outline-none",
    popIn: "motion-safe:animate-pop-in",
  },
  variants: {
    isAnimated: {
      true: { sheet: "motion-safe:animate-sheet-in" },
      false: {},
    },
  },
  defaultVariants: { isAnimated: true },
});

/** Grab handle + optional title for a ≤640 bottom sheet (Dialog sheet chrome, without the organism). */
export function PopoverSheetChrome({
  title,
  children,
  className,
  isAnimated = true,
}: {
  title?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
  /** Specimens / inline demos skip the enter keyframe (design Popover.jsx). */
  isAnimated?: boolean | undefined;
}) {
  const slots = popoverShellVariants({ isAnimated });
  return (
    <div data-surface="light" className={slots.sheet({ className })}>
      <div aria-hidden className={slots.handle()}>
        <span className={slots.handleBar()} />
      </div>
      {title === undefined || title === null || title === false || title === "" ? null : (
        <div className={slots.title()}>{title}</div>
      )}
      <div tabIndex={-1} className={slots.body()}>
        {children}
      </div>
    </div>
  );
}

/** Design `minWidth` default: match the trigger (`--radix-popover-trigger-width`). */
export const matchTriggerWidth = "min-w-popover-trigger";

export type Placement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

export function placementSideAlign(placement: Placement | undefined): {
  side?: "top" | "bottom" | undefined;
  align?: "start" | "end" | undefined;
} {
  if (placement === undefined) return {};
  const [side, align] = placement.split("-") as ["top" | "bottom", "start" | "end"];
  return { side, align };
}

export function reportOpenChange(
  next: boolean,
  onOpenChange: ((open: boolean) => void) | undefined,
  onClose: ((reason: string) => void) | undefined
): void {
  onOpenChange?.(next);
  if (!next) onClose?.("dismiss");
}
