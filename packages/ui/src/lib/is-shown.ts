import type { ReactNode } from "react";

/**
 * Whether an optional `ReactNode` slot renders. `false`, `""`, `null` and `undefined` render
 * nothing, so the slot's wrapper is skipped too — no empty padded element (`sub={false}`, a
 * `{cond && …}` prop, an empty string from content).
 */
export function isShown(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false && node !== "";
}
