import type { CSSProperties } from "react";

/**
 * Image-first dish card for grids, rails and highlight sections.
 */
export interface MenuItemCardProps {
  name: string;
  description?: string;
  price: number;
  was?: number;
  diet?: "veg" | "egg";
  spice?: 1 | 2 | 3 | 4;
  badge?: string;
  image?: string;
  imageLabel?: string;
  width?: number | string;
  /** Assets folder holding the brand symbol files. Default "/assets". */
  base?: string;
  /** Shows the floating pink + button on the image. */
  onAdd?: () => void;
  onClick?: () => void;
  style?: CSSProperties;
}
export function MenuItemCard(props: MenuItemCardProps): JSX.Element;
