import type { CSSProperties, ReactNode } from "react";

export interface ClusterProps {
  children?: ReactNode;
  /** Spacing step - N means N x 4px (3 = 12px). Any CSS length also works. */
  space?: number | string;
  align?: "start" | "center" | "end" | "baseline";
  justify?: "start" | "center" | "end" | "space-between";
  /** Never wrap (use with care - can overflow). */
  nowrap?: boolean;
  /** Scroll horizontally instead of wrapping - the mobile filter-rail pattern. */
  scroll?: boolean;
  as?: string;
  style?: CSSProperties;
}
export function Cluster(props: ClusterProps): JSX.Element;
