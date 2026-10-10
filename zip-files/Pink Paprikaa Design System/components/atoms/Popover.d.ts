import type { CSSProperties, ReactNode, HTMLAttributes, Ref } from "react";

export interface PopoverProps {
  open?: boolean;
  /** Called with "outside" or "escape". */
  onClose?: (reason: "outside" | "escape") => void;
  children?: ReactNode;
  /** Heading shown when rendered as a bottom sheet. */
  title?: string;
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  /** "auto" = bottom sheet at 640px and below. */
  sheet?: "auto" | boolean;
  /** Render in flow (specimens, docs) instead of floating. */
  inline?: boolean;
  width?: number | string;
  /** Defaults to the anchor's width. */
  minWidth?: number;
  maxHeight?: number;
  offset?: number;
  padding?: number | string;
  bodyRef?: Ref<HTMLDivElement>;
  bodyProps?: HTMLAttributes<HTMLDivElement>;
  style?: CSSProperties;
}
export function Popover(props: PopoverProps): JSX.Element | null;
