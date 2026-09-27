import type { CSSProperties } from "react";

export interface OfferSealProps {
  /** The number — "50%", "₹99", "1+1". */
  value?: string;
  /** Short uppercase word under it, e.g. "Off". */
  label?: string;
  note?: string;
  /** Diagonal size in canvas px. */
  size?: number;
  tone?: "light" | "brand" | "turmeric";
  /** Corner bleed in px. Clamped to 0.18 x size so the value is never clipped. */
  bleed?: number;
  corner?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  style?: CSSProperties;
}
export function OfferSeal(props: OfferSealProps): JSX.Element;
