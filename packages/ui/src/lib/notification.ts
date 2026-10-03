import type { ReactNode } from "react";

import { Check, Info, TriangleAlert } from "lucide-react";

import type { IconComponent } from "../atoms/icon/icon";
import type { BasePropsWithColor } from "./common-props";

export type NotificationColor = "brand" | "neutral" | "success" | "danger";

export interface NotificationAction {
  label: string;
  /** How a screen-reader user can do the same thing, e.g. "View your cart" (Radix `altText`). */
  altText: string;
  onClick: () => void;
}

/** What Toast and Snackbar share (contract §5: `SnackbarProps extends Omit<ToastProps, "isPop">`). */
/** `onPause` / `onResume` are Radix's timer callbacks here, not the media events an `<li>` types. */
export interface NotificationProps extends Omit<BasePropsWithColor<"li">, "onPause" | "onResume"> {
  open?: boolean | undefined;
  /** Shown on mount unless `false` (Radix default). */
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  color?: NotificationColor | undefined;
  /** Replaces the colour's glyph. */
  icon?: IconComponent | undefined;
  action?: NotificationAction | undefined;
  /** Time on screen, ms. `Infinity` keeps it until dismissed. */
  duration?: number | undefined;
  /** One short sentence, no exclamation mark. */
  children: ReactNode;
}

export const NOTIFICATION_ICON: Readonly<Record<NotificationColor, IconComponent>> = {
  brand: Check,
  neutral: Info,
  success: Check,
  danger: TriangleAlert,
};

/** A brand notification is a brand field; the rest are dark fields. On both, text and focus turn white. */
export const NOTIFICATION_SURFACE: Readonly<Record<NotificationColor, "brand" | "ink">> = {
  brand: "brand",
  neutral: "ink",
  success: "ink",
  danger: "ink",
};
