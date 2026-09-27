import type { CSSProperties, ReactNode } from "react";

/**
 * Phone frame for app screens.
 */
export interface AppShellProps {
  /** The scrolling screen body. */
  children?: ReactNode;
  /** A TabBar, pinned above the home indicator. */
  tabBar?: ReactNode;
  /** Sheets and toasts - absolutely positioned inside the frame. */
  overlay?: ReactNode;
  /** Status bar colour: ink on light screens, light on flooded pink. */
  statusTone?: "ink" | "light";
  time?: string;
  width?: number;
  height?: number;
  style?: CSSProperties;
}
export function AppShell(props: AppShellProps): JSX.Element;
