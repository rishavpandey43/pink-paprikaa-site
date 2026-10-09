"use client";

import { Plus } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useEffect, useId, useRef } from "react";

import { Fab } from "../../atoms/fab/fab";
import { type IconComponent } from "../../atoms/icon/icon";
import type { SxProp } from "../../lib/common-props";
import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";
import { useControllableState } from "../../lib/use-controllable-state";

export interface SpeedDialAction {
  icon: IconComponent;
  /** The accessible name and the visible chip. */
  label: string;
  /** A link action. With `target="_blank"` it gets `rel` and the screen-reader "(Opens in a new tab)". */
  href?: string | undefined;
  target?: string | undefined;
  /** Runs when the action is chosen (a link action too); the dial closes after it. */
  onSelect?: (() => void) | undefined;
}

export interface SpeedDialProps extends SxProp {
  /** Names the trigger ("Contact us"). */
  label: string;
  /** The trigger's glyph; default a plus, which turns 45° into a cross when open. */
  icon?: IconComponent | undefined;
  actions: readonly SpeedDialAction[];
  /** Which way the actions fan out from the trigger. Default "up". */
  direction?: "up" | "down" | "left" | "right" | undefined;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Pins the dial to a viewport corner, above the mobile action dock. Default "none". */
  position?: "none" | "bottom-end" | "bottom-start" | undefined;
}

const speedDial = componentVariants({
  slots: {
    root: "flex items-center gap-3",
    list: "flex items-center gap-3",
    item: "flex items-center gap-2",
    chip: "rounded-pill bg-surface-card px-3 py-1 text-body-sm font-medium whitespace-nowrap text-text-body shadow-2",
    // The glyph turns into a cross as the dial opens (and holds still for reduced motion).
    trigger: "aria-expanded:*:rotate-45 *:motion-safe:transition-transform",
  },
  variants: {
    direction: {
      up: { root: "flex-col-reverse", list: "flex-col-reverse" },
      down: { root: "flex-col", list: "flex-col" },
      left: { root: "flex-row-reverse", list: "flex-row-reverse" },
      right: { root: "flex-row", list: "flex-row" },
    },
    // Vertical dials put the chip beside the action; horizontal ones under it.
    isVertical: {
      true: { item: "justify-end" },
      false: { item: "flex-col" },
    },
    position: {
      none: {},
      "bottom-end": { root: "fixed end-4 bottom-dock-clearance z-dock md:bottom-6" },
      "bottom-start": { root: "fixed start-4 bottom-dock-clearance z-dock md:bottom-6" },
    },
    // The chip sits on the side facing the page, away from the screen edge the dial hugs.
    chipSide: { start: {}, end: {} },
  },
  compoundVariants: [{ isVertical: true, chipSide: "start", class: { item: "flex-row-reverse" } }],
  defaultVariants: { direction: "up", position: "none", isVertical: true, chipSide: "start" },
});

/** The key that moves outward from the trigger, along the dial's axis. */
const OUTWARD_KEY = {
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
} as const;
const INWARD_KEY = {
  up: "ArrowDown",
  down: "ArrowUp",
  left: "ArrowRight",
  right: "ArrowLeft",
} as const;

/**
 * A floating trigger that fans out a few related actions — call, WhatsApp, directions. The
 * trigger is a Fab (`aria-expanded`, `aria-controls`); each action is a link or a button with a
 * visible label chip and a screen-reader name. Arrow keys move along the dial's axis, Escape closes
 * it and returns focus to the trigger, and a press outside closes it. One action → use a Fab.
 */
export function SpeedDial({
  label,
  icon = Plus,
  actions,
  direction = "up",
  open,
  defaultOpen = false,
  onOpenChange,
  position = "none",
  sx,
}: SpeedDialProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const isVertical = direction === "up" || direction === "down";
  const slots = speedDial({
    direction,
    position,
    isVertical,
    chipSide: position === "bottom-start" ? "end" : "start",
  });

  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(event: PointerEvent): void {
      if (event.target instanceof Node && rootRef.current?.contains(event.target) === false) {
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  });

  function close(): void {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      close();
      return;
    }
    const isOutward = event.key === OUTWARD_KEY[direction];
    if (!isOutward && event.key !== INWARD_KEY[direction]) return;
    event.preventDefault();
    if (!isOpen) {
      if (isOutward) setIsOpen(true);
      return;
    }
    // The trigger first, then the actions from the nearest outward.
    const stops = [
      triggerRef.current,
      ...(rootRef.current?.querySelectorAll<HTMLElement>("[data-speed-dial-action]") ?? []),
    ];
    const here = stops.findIndex((stop) => stop === document.activeElement);
    const next = stops[here + (isOutward ? 1 : -1)];
    next?.focus();
  }

  return (
    // Keys are handled here, once, for the trigger and every action inside; the div has no role.
    <div
      ref={rootRef}
      role="presentation"
      className={slots.root({ className: withSx(sx, undefined) })}
      onKeyDown={onKeyDown}
    >
      <Fab
        ref={triggerRef}
        icon={icon}
        label={label}
        aria-expanded={isOpen}
        aria-controls={listId}
        className={slots.trigger()}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      />
      {isOpen ? (
        <ul id={listId} role="list" className={slots.list()}>
          {actions.map((action) => {
            const isNewTab = action.target === "_blank";
            const fab =
              action.href === undefined ? (
                <Fab
                  icon={action.icon}
                  label={action.label}
                  variant="secondary"
                  data-speed-dial-action=""
                  onClick={() => {
                    action.onSelect?.();
                    close();
                  }}
                />
              ) : (
                <Fab icon={action.icon} label={action.label} variant="secondary" asChild>
                  <a
                    href={action.href}
                    target={action.target}
                    rel={isNewTab ? "noreferrer noopener" : undefined}
                    data-speed-dial-action=""
                    onClick={() => {
                      action.onSelect?.();
                      close();
                    }}
                  >
                    {isNewTab ? <span className="sr-only"> (Opens in a new tab)</span> : null}
                  </a>
                </Fab>
              );
            return (
              <li key={action.label} className={slots.item()}>
                {fab}
                <span aria-hidden className={slots.chip()}>
                  {action.label}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
