import type { CSSProperties, ReactNode } from "react";

export interface OutletCardProps {
  name: string;
  city?: string;
  address?: string;
  hours?: string;
  status?: "open" | "busy" | "closed";
  /** Overrides the status text derived from status. */
  statusLabel?: string;
  /** Image URL, or false to drop the image entirely. */
  image?: string | false;
  imageLabel?: string;
  /** Assets folder holding the brand symbol files. Default "/assets". */
  base?: string;
  action?: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}
export function OutletCard(props: OutletCardProps): JSX.Element;
