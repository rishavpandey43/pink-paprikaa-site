"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { type ReactNode, useCallback, useState, useSyncExternalStore } from "react";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { componentVariants } from "../../lib/component-variants";

/** One press moves 90% of the visible width, so a sliver of the last card stays for context (handoff). */
const PAGE_FRACTION = 0.9;
/** Sub-pixel scroll positions still count as "at the edge". */
const EDGE_TOLERANCE = 1;

type TrackPosition = "none" | "start" | "middle" | "end";

function positionOf(track: HTMLElement): TrackPosition {
  const maxScroll = track.scrollWidth - track.clientWidth;
  if (maxScroll <= EDGE_TOLERANCE) return "none";
  if (track.scrollLeft <= EDGE_TOLERANCE) return "start";
  if (track.scrollLeft >= maxScroll - EDGE_TOLERANCE) return "end";
  return "middle";
}

const serverPosition = (): TrackPosition => "start";

const carouselTrack = componentVariants({
  slots: {
    header: "flex flex-wrap items-end justify-between gap-5",
    controls: "flex shrink-0 items-center gap-2",
    track:
      "grid snap-x snap-mandatory auto-cols-review-carousel grid-flow-col gap-5 overflow-x-auto overscroll-x-contain px-1 pt-1 pb-4 *:min-w-0 *:snap-start motion-safe:scroll-smooth",
  },
});

export interface ReviewCarouselTrackProps {
  /** Eyebrow and heading, rendered by the server organism. */
  header: ReactNode;
  /** Id of the heading that names the track region. */
  labelledBy: string;
  previousLabel: string;
  nextLabel: string;
  hasControls: boolean;
  /** The ReviewCards, rendered by the server organism. */
  children: ReactNode;
}

/**
 * The carousel's client corner: a scroll-snap track that is a focusable region (arrow keys scroll
 * it natively) and previous/next buttons that page it. The buttons are `aria-disabled` at the
 * ends, so a keyboard user's focus stays put. Nothing auto-advances; smoothness is `motion-safe:`
 * CSS, so reduced motion jumps instead of gliding.
 */
export function ReviewCarouselTrack({
  header,
  labelledBy,
  previousLabel,
  nextLabel,
  hasControls,
  children,
}: ReviewCarouselTrackProps) {
  const [track, setTrack] = useState<HTMLDivElement | null>(null);

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (track === null) return () => undefined;
      track.addEventListener("scroll", onChange, { passive: true });
      const resize = new ResizeObserver(onChange);
      resize.observe(track);
      return () => {
        track.removeEventListener("scroll", onChange);
        resize.disconnect();
      };
    },
    [track]
  );
  const position = useSyncExternalStore(
    subscribe,
    () => (track === null ? "start" : positionOf(track)),
    serverPosition
  );

  const canGoPrevious = position === "middle" || position === "end";
  const canGoNext = position === "start" || position === "middle";
  const slots = carouselTrack();

  const page = (direction: -1 | 1, isEnabled: boolean) => {
    if (!isEnabled || track === null) return;
    track.scrollBy({ left: direction * track.clientWidth * PAGE_FRACTION });
  };

  return (
    <>
      <div className={slots.header()}>
        {header}
        {hasControls ? (
          <div className={slots.controls()}>
            <IconButton
              icon={ArrowLeft}
              label={previousLabel}
              variant="secondary"
              size="lg"
              aria-disabled={!canGoPrevious}
              onClick={() => {
                page(-1, canGoPrevious);
              }}
            />
            <IconButton
              icon={ArrowRight}
              label={nextLabel}
              variant="primary"
              size="lg"
              aria-disabled={!canGoNext}
              onClick={() => {
                page(1, canGoNext);
              }}
            />
          </div>
        ) : null}
      </div>
      <div
        ref={setTrack}
        role="region"
        aria-labelledby={labelledBy}
        tabIndex={0}
        className={slots.track()}
      >
        {children}
      </div>
    </>
  );
}
