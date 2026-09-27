import type { CSSProperties, ReactNode } from "react";

/** Fixed-pixel marketing artboard (Instagram, story, banner) that scales to fit. */
export interface PostFrameProps {
  /** post 1080² · portrait 1080×1350 · story 1080×1920 · landscape 1200×628 · wide 1920×1080 · mpu 300×250 · leaderboard 728×90 */
  format?: "post" | "portrait" | "story" | "landscape" | "wide" | "mpu" | "leaderboard";
  /** Explicit display scale, e.g. 0.32. Omit and pass fit to auto-scale to the parent width. */
  scale?: number;
  /** Auto-scale to the parent's width (never above 1). */
  fit?: boolean;
  background?: string;
  /** Canvas padding; defaults to --canvas-pad on 1080-wide formats. */
  padding?: number | string;
  /** Show the story chrome safe-area guides (story format only). */
  safeArea?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}
export function PostFrame(props: PostFrameProps): JSX.Element;
export const POST_FORMATS: Record<string, { w: number; h: number; label: string }>;
