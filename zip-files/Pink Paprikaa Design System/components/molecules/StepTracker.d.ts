import type { CSSProperties } from "react";

export interface TrackerStep { label: string; note?: string }

export interface StepTrackerProps {
  steps?: (string | TrackerStep)[];
  /** Index of the current step; earlier steps render as complete. */
  current?: number;
  /** vertical = order tracking · horizontal = checkout progress */
  orientation?: "vertical" | "horizontal";
  tone?: "light" | "inverse";
  /** Assets folder holding the symbol files. */
  base?: string;
  style?: CSSProperties;
}
export function StepTracker(props: StepTrackerProps): JSX.Element;
