import type { CSSProperties, ReactNode } from "react";

/**
 * Full-bleed closing CTA band.
 */
export interface CtaBandProps {
  overline?: string;
  title?: string;
  body?: string;
  /** Usually one Button. */
  action?: ReactNode;
  tone?: "ink" | "brand" | "soft";
  /** "split" = copy left, action right · "center" = stacked and centred */
  align?: "split" | "center";
  base?: string;
  style?: CSSProperties;
}
export function CtaBand(props: CtaBandProps): JSX.Element;
