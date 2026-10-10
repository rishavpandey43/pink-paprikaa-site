import type { ReactElement } from "react";

import { Tooltip } from "./tooltip";

/** Wrap a single focusable element in our Tooltip (used by Avatar; keeps the atom LAW). */
export function withTooltip(label: string, trigger: ReactElement) {
  return <Tooltip label={label}>{trigger}</Tooltip>;
}
