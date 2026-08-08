"use client";

import type { ComponentPropsWithoutRef } from "react";

import { Progress } from "radix-ui";
import { useId } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

const progressBar = componentVariants({
  slots: {
    root: "grid w-full gap-2",
    label: "font-body text-caption",
    track: "flex w-full items-stretch rounded-6",
    /** One loyalty stamp. Equal flex share, so six stamps fit 360px without wrapping. */
    segment: "flex-1 rounded-6 transition-colors duration-(--duration-base) ease-out",
    indicator: "h-full rounded-6 transition-[width] duration-(--duration-slow) ease-out",
  },
  variants: {
    /**
     * `brand` is the default pink-on-soft-pink pair. `mint` marks a finished or healthy state.
     * `inverse` is the only one that works on a flooded pink or ink panel.
     */
    tone: {
      brand: { label: "text-text-muted", track: "bg-brand-soft", indicator: "bg-brand-primary" },
      mint: { label: "text-text-muted", track: "bg-mint-soft", indicator: "bg-mint" },
      inverse: {
        label: "text-text-on-brand",
        track: "bg-glass-white",
        indicator: "bg-surface-card",
      },
    },
    size: { sm: { track: "h-1-5" }, md: { track: "h-2" }, lg: { track: "h-3" } },
    /** Derived from `segments`, not passed: a segmented track gaps, a continuous one clips. */
    variant: {
      continuous: { track: "overflow-hidden" },
      segmented: { track: "gap-1 bg-transparent" },
    },
    isOn: { true: {}, false: {} },
  },
  compoundVariants: [
    { tone: "brand", isOn: true, class: { segment: "bg-brand-primary" } },
    { tone: "brand", isOn: false, class: { segment: "bg-brand-soft" } },
    { tone: "mint", isOn: true, class: { segment: "bg-mint" } },
    { tone: "mint", isOn: false, class: { segment: "bg-mint-soft" } },
    { tone: "inverse", isOn: true, class: { segment: "bg-surface-card" } },
    { tone: "inverse", isOn: false, class: { segment: "bg-glass-white" } },
  ],
  defaultVariants: { tone: "brand", size: "md", variant: "continuous", isOn: false },
});

export interface ProgressBarProps
  extends
    Omit<ComponentPropsWithoutRef<"div">, "children">,
    Omit<VariantProps<typeof progressBar>, "variant" | "isOn"> {
  /** How far along. Against `max` for a continuous bar; a stamp count when `segments` is set. */
  value?: number | undefined;
  /** The top of the continuous scale. Ignored when `segments` is set — the count becomes the max. */
  max?: number | undefined;
  /**
   * Draw the track as N discrete stamps instead of one continuous bar. Segmented is the loyalty
   * pattern; continuous is for checkout steps and uploads.
   */
  segments?: number | undefined;
  /**
   * Visible caption above the track. It also names the bar for assistive tech — without it, pass
   * an `aria-label` instead, or the bar reaches a screen reader unnamed.
   */
  label?: string | undefined;
}

export function ProgressBar({
  className,
  tone,
  size,
  value = 0,
  max = 100,
  segments,
  label,
  ...props
}: ProgressBarProps) {
  const labelId = useId();
  const isSegmented = segments !== undefined;
  const scale = isSegmented ? Math.max(1, Math.round(segments)) : Math.max(1, max);
  const safeValue = Math.min(scale, Math.max(0, value));
  const {
    root,
    label: labelText,
    track,
    segment,
    indicator,
  } = progressBar({
    tone,
    size,
    variant: isSegmented ? "segmented" : "continuous",
  });

  return (
    <div className={root({ className })}>
      {label === undefined ? null : (
        <span className={labelText()} id={labelId}>
          {label}
        </span>
      )}
      <Progress.Root
        aria-labelledby={label === undefined ? undefined : labelId}
        className={track()}
        max={scale}
        value={safeValue}
        {...props}
      >
        {isSegmented ? (
          Array.from({ length: scale }, (_, index) => (
            <span className={segment({ isOn: index < safeValue })} key={index} />
          ))
        ) : (
          <Progress.Indicator
            className={indicator()}
            style={{ width: `${((safeValue / scale) * 100).toFixed(3)}%` }}
          />
        )}
      </Progress.Root>
    </div>
  );
}
