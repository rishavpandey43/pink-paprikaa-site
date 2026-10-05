import type { ElementType, ReactElement } from "react";

import { Slot } from "radix-ui";

import type { BaseProps } from "../../lib/common-props";

import { componentVariants } from "../../lib/component-variants";
import { controlStates } from "../../lib/control-states";
import { withSx } from "../../lib/sx";
import { Icon, type IconComponent } from "../icon/icon";

export interface FabProps extends Omit<BaseProps<"button">, "children" | "aria-label"> {
  icon: IconComponent;
  /** The accessible name — required: a round icon has no other. Shown as text only when `isExtended`. */
  label: string;
  /** A pill that shows the label beside the icon. */
  isExtended?: boolean | undefined;
  /** The circle's diameter (or the pill's height): 48 / 56px. Default "md". */
  size?: "md" | "lg" | undefined;
  /** primary = brand fill · secondary = white with a brand glyph. Default "primary". */
  variant?: "primary" | "secondary" | undefined;
  /**
   * Pins it to a viewport corner (`fixed`, above the mobile action dock). Default "none": it
   * flows where it is placed, which is what a story or a container-relative layout wants.
   */
  position?: "none" | "bottom-end" | "bottom-start" | undefined;
  /** Render as the single child element (`<a href="tel:…">`); the icon and label are placed inside it. */
  asChild?: boolean | undefined;
  /** Only with `asChild`: the element to render as. Its own children are kept after the label. */
  children?: ReactElement | undefined;
}

const fab = componentVariants({
  slots: {
    root: [
      controlStates(),
      "disabled:bg-ink-200 aria-disabled:bg-ink-200",
      "inline-flex shrink-0 items-center justify-center rounded-pill shadow-4 active:press-scale",
    ],
    label: "font-display text-button-md whitespace-nowrap",
  },
  variants: {
    variant: {
      primary: {
        root: "bg-button-primary-bg text-button-primary-fg hover:bg-button-primary-bg-hover active:bg-button-primary-bg-active",
      },
      secondary: {
        root: "bg-surface-card text-text-brand hover:bg-surface-brand-soft",
      },
    },
    size: { md: {}, lg: {} },
    isExtended: {
      true: { root: "gap-2 px-5" },
      false: { label: "sr-only" },
    },
    position: {
      none: {},
      // Above the mobile ActionDock (`dock-clearance`); from md up there is no dock.
      "bottom-end": { root: "fixed end-4 bottom-dock-clearance z-dock md:bottom-6" },
      "bottom-start": { root: "fixed start-4 bottom-dock-clearance z-dock md:bottom-6" },
    },
  },
  compoundVariants: [
    { size: "md", isExtended: false, class: { root: "size-fab-md" } },
    { size: "lg", isExtended: false, class: { root: "size-fab-lg" } },
    { size: "md", isExtended: true, class: { root: "h-fab-md min-w-fab-md" } },
    { size: "lg", isExtended: true, class: { root: "h-fab-lg min-w-fab-lg" } },
  ],
  defaultVariants: { variant: "primary", size: "md", isExtended: false, position: "none" },
});

/**
 * The floating action button: one primary action that stays in reach (call, order, directions).
 * Round with a 48 or 56px circle; `isExtended` widens it to a pill with the label. Pin it with
 * `position`; several related actions belong in a SpeedDial.
 */
export function Fab({
  icon,
  label,
  isExtended = false,
  size = "md",
  variant,
  position,
  asChild = false,
  disabled = false,
  type = "button",
  sx,
  className,
  children,
  ...props
}: FabProps) {
  const slots = fab({ variant, size, isExtended, position });
  const Component: ElementType = asChild ? Slot.Root : "button";
  const state = asChild ? { "aria-disabled": disabled || undefined } : { type, disabled };
  return (
    <Component className={slots.root({ className: withSx(sx, className) })} {...state} {...props}>
      <Slot.Slottable child={children}>
        {(inner) => (
          <>
            <Icon icon={icon} size={size === "lg" ? "lg" : "md"} />
            <span className={slots.label()}>{label}</span>
            {inner}
          </>
        )}
      </Slot.Slottable>
    </Component>
  );
}
