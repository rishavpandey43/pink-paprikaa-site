import type { CSSProperties, ReactNode } from "react";

export interface StatProps {
  value?: ReactNode;
  /** One short line, sentence case, no full stop. */
  label?: string;
  sub?: string;
  icon?: string;
  tone?: "ink" | "brand" | "inverse";
  align?: "start" | "center";
  style?: CSSProperties;
}
export function Stat(props: StatProps): JSX.Element;
