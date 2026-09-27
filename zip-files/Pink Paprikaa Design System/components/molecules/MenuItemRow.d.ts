import type { CSSProperties, ReactNode } from "react";

/**
 * A single dish in a menu list — the atom both the website menu and the app browse use.
 */
export interface MenuItemRowProps {
  name: string;
  /** Optional Devanagari dish name shown beside the Latin one. */
  nameDevanagari?: string;
  /** Ingredient-led, max 14 words. */
  description?: string;
  price: number;
  was?: number;
  diet?: "veg" | "egg";
  spice?: 1 | 2 | 3 | 4;
  /** Short ALL-CAPS marker, e.g. "BESTSELLER". */
  badge?: string;
  /** Image URL; omit to show the labelled pink placeholder. */
  image?: string;
  imageLabel?: string;
  /** Assets folder holding the brand symbol files. Default "/assets". */
  base?: string;
  onAdd?: () => void;
  /** Replace the default Add button. */
  action?: ReactNode;
  divider?: boolean;
  style?: CSSProperties;
}
export function MenuItemRow(props: MenuItemRowProps): JSX.Element;
