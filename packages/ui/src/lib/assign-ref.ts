import type { Ref } from "react";

/**
 * Hands `node` to a consumer's ref, callback or object. For a component that keeps a ref of its
 * own and must still forward the caller's (React 19: `ref` is a plain prop) — SearchField returns
 * focus to its input, and react-hook-form's Controller focuses the same input on error.
 *
 * Limit: a React 19 callback ref's cleanup return is dropped, so a callback that returns a
 * cleanup is called again with `null` on unmount instead (React's pre-19 contract).
 */
export function assignRef<T>(ref: Ref<T> | undefined, node: T | null): void {
  if (typeof ref === "function") {
    ref(node);
  } else if (ref !== null && ref !== undefined) {
    ref.current = node;
  }
}
