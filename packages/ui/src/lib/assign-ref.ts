import type { Ref } from "react";

/**
 * Hands `node` to a consumer's ref, callback or object. For a component that keeps a ref of its
 * own and must still forward the caller's (React 19: `ref` is a plain prop) — SearchField returns
 * focus to its input, and react-hook-form's Controller focuses the same input on error.
 */
export function assignRef<T>(ref: Ref<T> | undefined, node: T | null): void {
  if (typeof ref === "function") {
    ref(node);
  } else if (ref !== null && ref !== undefined) {
    ref.current = node;
  }
}
