"use client";

import { type ReactNode, useSyncExternalStore } from "react";

/** The page has scrolled this far before the header turns to glass (design system: `y > 24`). */
const GLASS_SCROLL_THRESHOLD = 24;

function subscribeToScroll(onChange: () => void): () => void {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => {
    window.removeEventListener("scroll", onChange);
  };
}

const isPastThreshold = (): boolean => window.scrollY > GLASS_SCROLL_THRESHOLD;
const isPastThresholdOnServer = (): boolean => false;

export interface SiteHeaderBarProps {
  className: string;
  children: ReactNode;
}

/**
 * The header row's client corner: solid at rest, `data-scrolled` (glass + blur, CSS) once the
 * page scrolls under it (readme §3.3, §3.9). Its children are server-rendered.
 */
export function SiteHeaderBar({ className, children }: SiteHeaderBarProps) {
  const isScrolled = useSyncExternalStore(
    subscribeToScroll,
    isPastThreshold,
    isPastThresholdOnServer
  );
  return (
    <div data-scrolled={isScrolled ? "" : undefined} className={className}>
      {children}
    </div>
  );
}
