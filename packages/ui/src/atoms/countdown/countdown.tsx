"use client";

import { type ComponentProps, type ReactNode, useSyncExternalStore } from "react";

import type { SxProp } from "../../lib/common-props";

import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";

const SECOND_MS = 1000;
/** What the server and the hydration pass render: a reading's shape without time-dependent digits. */
const PLACEHOLDER = "--d --h --m --s";
/** An ISO date-time must carry its offset, or server and browser would read it in different zones. */
const ISO_WITH_OFFSET = /(?:Z|[+-]\d{2}:\d{2})$/;

/** The handoff launch bar's pill (PPHeader.dc.html). */
const countdown = componentVariants({
  base: "inline-flex rounded-pill bg-surface-inverse px-2 py-px font-mono text-mono font-bold whitespace-nowrap text-text-on-inverse",
});

/** The clock is an external store: one 1s interval per mounted countdown, cleared on unmount. */
function subscribeToClock(onTick: () => void): () => void {
  const timer = setInterval(onTick, SECOND_MS);
  return () => {
    clearInterval(timer);
  };
}

/** Whole seconds, so the snapshot only changes once a second. */
function readClock(): number {
  return Math.floor(Date.now() / SECOND_MS);
}

/** The server has no "now" worth rendering: null means "not mounted yet". */
function readServerClock(): null {
  return null;
}

function parseEndsAt(endsAt: string): number {
  const endsMs = Date.parse(endsAt);
  if (!ISO_WITH_OFFSET.test(endsAt) || Number.isNaN(endsMs)) {
    throw new RangeError(
      `Countdown: endsAt must be an ISO date-time with an offset, got "${endsAt}"`
    );
  }
  return endsMs;
}

const pad = (value: number) => String(value).padStart(2, "0");

/** `12d 04h 05m 09s` — the handoff's launch-offer format. */
function formatRemaining(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${String(days)}d ${pad(hours)}h ${pad(minutes)}m ${pad(totalSeconds % 60)}s`;
}

export interface CountdownProps
  extends Omit<ComponentProps<"time">, "children" | "dateTime">, SxProp {
  /** ISO 8601 with an offset, e.g. "2026-10-31T23:59:59+05:30". */
  endsAt: string;
  /** Rendered once `endsAt` has passed. = null (nothing). */
  fallback?: ReactNode;
  /** Read before the time by assistive tech only, e.g. "Offer closes in". Blank reads none. */
  label?: string | undefined;
}

/**
 * Time left on an offer, ticking every second. Server-rendered HTML carries a placeholder, so there
 * is no hydration mismatch and no stale time in a static page; the live reading starts on mount.
 */
export function Countdown({
  endsAt,
  fallback = null,
  label,
  sx,
  className,
  ...props
}: CountdownProps) {
  const endsMs = parseEndsAt(endsAt);
  const hasLabel = label !== undefined && label.trim() !== "";
  const nowSecond = useSyncExternalStore<number | null>(
    subscribeToClock,
    readClock,
    readServerClock
  );
  const remaining =
    nowSecond === null ? null : Math.max(0, Math.ceil(endsMs / SECOND_MS - nowSecond));

  if (remaining === 0) return fallback;

  return (
    <time dateTime={endsAt} className={countdown({ className: withSx(sx, className) })} {...props}>
      {hasLabel ? <span className="sr-only">{`${label} `}</span> : null}
      {remaining === null ? (
        <span aria-hidden="true">{PLACEHOLDER}</span>
      ) : (
        formatRemaining(remaining)
      )}
    </time>
  );
}
