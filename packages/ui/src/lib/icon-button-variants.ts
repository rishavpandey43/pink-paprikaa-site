import { componentVariants } from "./component-variants";
import { controlStates } from "./control-states";

/**
 * IconButton recipe (R132). Lives in lib so Popover's close control and other atoms can share it
 * without importing the IconButton atom.
 */
export const iconButtonVariants = componentVariants({
  slots: {
    root: [
      controlStates(),
      "relative inline-flex shrink-0 items-center justify-center rounded-pill active:press-scale-icon data-[pressed]:press-scale-icon",
    ],
    count:
      "pointer-events-none absolute -top-0.5 -right-0.5 grid h-icon-button-count min-w-icon-button-count place-items-center rounded-pill bg-pink-500 px-1.25 font-display text-icon-button-count text-ink-000",
  },
  variants: {
    variant: {
      primary: {
        root: [
          "bg-button-primary-bg text-button-primary-fg",
          "hover:bg-button-primary-bg-hover active:bg-button-primary-bg-active data-[pressed]:bg-button-primary-bg-active",
          "disabled:bg-ink-200 aria-disabled:bg-ink-200",
        ].join(" "),
      },
      secondary: {
        root: [
          "border border-ink-300 bg-ink-000 text-pink-600",
          "hover:border-pink-300 hover:bg-state-hover",
          "active:bg-state-press data-[pressed]:bg-state-press",
          "disabled:border-ink-200 disabled:bg-transparent aria-disabled:border-ink-200 aria-disabled:bg-transparent",
        ].join(" "),
      },
      ghost: {
        root: [
          "bg-transparent text-icon-button-ghost-fg",
          "hover:bg-state-hover hover:text-pink-600",
          "active:bg-state-press data-[pressed]:bg-state-press",
        ].join(" "),
      },
      glass: {
        root: [
          "bg-surface-glass text-ink-900 backdrop-blur-glass",
          "hover:bg-ink-000 active:bg-pink-50 data-[pressed]:bg-pink-50",
        ].join(" "),
      },
      tint: {
        root: [
          "bg-transparent text-current",
          "hover:bg-state-hover-tint active:bg-state-press-tint data-[pressed]:bg-state-press-tint",
        ].join(" "),
      },
    },
    size: {
      xs: { root: "size-icon-button-xs before:absolute before:-inset-2" },
      sm: { root: "size-icon-button-sm before:absolute before:-inset-1.5" },
      md: { root: "size-icon-button-md before:absolute before:-inset-0.5" },
      lg: { root: "size-icon-button-lg" },
    },
  },
  defaultVariants: { variant: "ghost", size: "md" },
});
