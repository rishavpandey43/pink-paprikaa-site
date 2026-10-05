import { componentVariants } from "./component-variants";

/**
 * Shared by every pill control (Button, IconButton, interactive Tag): the control transition
 * (colours over --duration-fast, the press scale over --duration-instant) and the disabled
 * cursor/aria half. Each recipe owns its disabled paint (audit-atoms; Tasks 4–5) — this helper
 * never paints a fill. The `aria-disabled` twins cover `asChild` links, which cannot be `:disabled`;
 * they also stop the pointer, so a busy link cannot be followed.
 */
export const controlStates = componentVariants({
  base: [
    "transition-control",
    "disabled:cursor-not-allowed disabled:border-transparent disabled:text-ink-400 disabled:shadow-none",
    "aria-disabled:pointer-events-none aria-disabled:border-transparent aria-disabled:text-ink-400 aria-disabled:shadow-none",
  ],
});
