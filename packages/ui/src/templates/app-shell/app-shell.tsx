import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

const appShell = componentVariants({
  slots: {
    /**
     * `relative` is the whole point of the shell: sheets and toasts anchor to this box, not to the
     * viewport, so an app screen previews with its overlays in the right place.
     */
    root: "relative flex flex-col overflow-hidden rounded-[44px] bg-surface-card shadow-elevation4",
    /** Simulated device chrome — hidden from assistive tech, it is scenery, not content. */
    statusBar:
      "flex h-11 shrink-0 items-center justify-between px-5 font-display text-caption font-semibold",
    battery: "relative h-[11px] w-[17px] rounded-1 border",
    batteryFill: "absolute inset-[1.5px] rounded-1 bg-current",
    /** `min-h-0` lets the scroller actually scroll instead of stretching the frame. */
    body: "min-h-0 flex-1 overflow-y-auto",
    homeIndicator: "grid h-6 shrink-0 place-items-center",
    homeIndicatorBar: "h-1 w-32 rounded-6 bg-current opacity-25",
  },
  variants: {
    /**
     * The device chrome's ink. Flip to `light` whenever the screen opens on a flooded pink or ink
     * header, or the clock disappears into it.
     */
    tone: {
      ink: { statusBar: "text-text-heading", homeIndicator: "text-text-heading" },
      light: { statusBar: "text-text-on-inverse", homeIndicator: "text-text-on-inverse" },
    },
    /** Artboard size. `fluid` fills its parent, for embedding a screen in a real viewport. */
    size: {
      sm: { root: "h-[812px] w-[375px]" },
      md: { root: "h-[844px] w-[390px]" },
      lg: { root: "h-[932px] w-[430px]" },
      fluid: { root: "h-full w-full max-w-[430px]" },
    },
  },
  defaultVariants: { tone: "ink", size: "md" },
});

export interface AppShellProps
  extends ComponentPropsWithoutRef<"div">, VariantProps<typeof appShell> {
  /** The scrolling screen body. */
  children?: ReactNode | undefined;
  /** Sheets and toasts. Rendered last so they stack above the tab bar. */
  overlay?: ReactNode | undefined;
  /** A tab bar, pinned between the scroller and the home indicator. */
  tabBar?: ReactNode | undefined;
  /** The clock on the simulated status bar. */
  time?: string | undefined;
}

export function AppShell({
  children,
  className,
  overlay,
  size,
  tabBar,
  time = "9:41",
  tone,
  ...props
}: AppShellProps) {
  const { battery, batteryFill, body, homeIndicator, homeIndicatorBar, root, statusBar } = appShell(
    {
      tone,
      size,
    }
  );

  return (
    <div className={root({ className })} {...props}>
      <div aria-hidden="true" className={statusBar()}>
        <span>{time}</span>
        <span className={battery()}>
          <span className={batteryFill()} />
        </span>
      </div>
      <div className={body()}>{children}</div>
      {tabBar}
      <div aria-hidden="true" className={homeIndicator()}>
        <span className={homeIndicatorBar()} />
      </div>
      {overlay}
    </div>
  );
}
