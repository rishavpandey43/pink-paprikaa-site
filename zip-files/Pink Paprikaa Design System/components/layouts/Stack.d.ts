import type { CSSProperties, ReactNode } from "react";

export interface StackProps {
  children?: ReactNode;
  /** Spacing step - N means N x 4px (6 = 24px). Half steps 0.5 and 1.5 exist. Any CSS length also works. */
  space?: number | string;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "space-between";
  /** Insert hairline rules between children. */
  divide?: boolean;
  as?: string;
  style?: CSSProperties;
}
export function Stack(props: StackProps): JSX.Element;
