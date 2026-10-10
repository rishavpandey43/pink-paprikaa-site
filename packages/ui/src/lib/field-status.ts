import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";

import type { IconComponent } from "../atoms/icon/icon";

/**
 * The one form status system (design system readme §3.8). Every field, choice group and Field
 * speaks it. A status is never shown by colour alone: it always comes with its glyph and a
 * message (spec §5.5).
 */
export type FieldStatus = "default" | "error" | "success" | "warning";

/** The glyph each status draws — the design system's Field.jsx: circle-alert, circle-check, triangle-alert. */
export const FIELD_STATUS_ICON: Readonly<Record<Exclude<FieldStatus, "default">, IconComponent>> = {
  error: CircleAlert,
  success: CircleCheck,
  warning: TriangleAlert,
};
