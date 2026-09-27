import { componentVariants } from "./component-variants";

/**
 * Shared by every pill control (Button, IconButton, interactive Tag): the control transition
 * (colours over --duration-fast, the press scale over --duration-instant) and the disabled look —
 * a real grey fill, never an opacity fade (design system readme §3.8). The `aria-disabled` twins
 * cover `asChild` links, which cannot be `:disabled`; they also stop the pointer, so a busy link
 * cannot be followed.
 */
export const controlStates = componentVariants({
  base: [
    "transition-control",
    "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-ink-200 disabled:text-ink-400 disabled:shadow-none",
    "aria-disabled:pointer-events-none aria-disabled:border-transparent aria-disabled:bg-ink-200 aria-disabled:text-ink-400 aria-disabled:shadow-none",
  ],
});
