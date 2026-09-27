import type { CSSProperties } from "react";

export interface ImageSlotProps {
  /** Real image URL. Omit to render the labelled placeholder. */
  src?: string;
  alt?: string;
  /** What photography belongs here, e.g. "Hero 4:5 — warm, close-cropped". */
  label?: string;
  ratio?: "square" | "4:3" | "3:4" | "4:5" | "16:9" | "16:10" | "wide" | string;
  radius?: string;
  tone?: "soft" | "strong" | "ink";
  /** Fill the parent's height instead of using an aspect ratio. */
  fill?: boolean;
  style?: CSSProperties;
}
export function ImageSlot(props: ImageSlotProps): JSX.Element;
