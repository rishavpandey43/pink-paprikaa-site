"use client";

import { type ReactNode, useCallback, useSyncExternalStore } from "react";

/** setTimeout's ceiling (~24.8 days). A longer wait re-arms until the moment arrives. */
const MAX_TIMEOUT_MS = 2_147_483_647;

function hasPassed(endsAtMs: number): boolean {
  return Date.now() >= endsAtMs;
}

/** Calls `onPass` once `endsAtMs` has passed, however far away it is. */
function subscribeUntil(endsAtMs: number, onPass: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const wait = () => {
    const remaining = endsAtMs - Date.now();
    if (remaining <= 0) {
      onPass();
      return;
    }
    timer = setTimeout(wait, Math.min(remaining, MAX_TIMEOUT_MS));
  };
  wait();
  return () => {
    clearTimeout(timer);
  };
}

/** The server (and hydration) always renders the announcement; the client then decides. */
const getServerSnapshot = () => false;

export interface AnnouncementExpiryProps {
  /** Epoch milliseconds. */
  endsAt: number;
  children: ReactNode;
}

/**
 * Renders its children until `endsAt`, then nothing. Re-checked on the client, so a static page
 * served after the date still hides it (spec §16: time-bound content is never checked only at build).
 */
export function AnnouncementExpiry({ endsAt, children }: AnnouncementExpiryProps) {
  const subscribe = useCallback((onPass: () => void) => subscribeUntil(endsAt, onPass), [endsAt]);
  const getSnapshot = useCallback(() => hasPassed(endsAt), [endsAt]);
  const hasEnded = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return hasEnded ? null : children;
}
