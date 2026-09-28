"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import { componentVariants } from "../../lib/component-variants";

const scaler = componentVariants({
  variants: { isMeasured: { false: "invisible" } },
});

export interface PostFrameScalerProps {
  /** The canvas's true width in px (POST_FORMATS). */
  width: number;
  className?: string | undefined;
  children: ReactNode;
}

/**
 * PostFrame's `isFit` leaf — the only client code in the layouts tier. Scales the canvas to the
 * frame's width, never above 1, and re-fits whenever the frame resizes. Invisible until the first
 * measurement, so server HTML never flashes an unscaled canvas; the frame's own box already has
 * the right size and aspect ratio, so nothing shifts when it appears.
 */
export function PostFrameScaler({ width, className, children }: PostFrameScalerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const box = ref.current;
    if (box === null) return undefined;
    // ResizeObserver reports the initial size too, so this is also the first measurement.
    const observer = new ResizeObserver(() => {
      setScale(Math.min(1, box.clientWidth / width));
    });
    observer.observe(box);
    return () => {
      observer.disconnect();
    };
  }, [width]);

  return (
    <div
      ref={ref}
      className={scaler({ isMeasured: scale !== null, className })}
      style={scale === null ? undefined : { transform: `scale(${String(scale)})` }}
    >
      {children}
    </div>
  );
}
