import type { ComponentProps, ReactNode } from "react";

import { BatteryFull } from "lucide-react";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

const appShell = componentVariants({
  slots: {
    // contain-layout makes the frame the containing block for absolute *and* fixed children, so
    // sheets, docks and toasts sit inside the phone the way they sit inside a real screen.
    base: "relative flex shrink-0 flex-col overflow-hidden rounded-app-shell bg-surface-page shadow-4 contain-layout",
    status:
      "flex h-11 flex-none items-center justify-between px-app-shell-status-x font-display text-app-shell-status text-text-heading",
    body: "flex min-h-0 flex-1 flex-col overflow-y-auto",
    home: "grid h-app-shell-home flex-none place-items-center",
    homeBar: "h-app-shell-home-bar-h w-app-shell-home-bar-w rounded-pill bg-ink-300",
  },
  variants: {
    size: {
      phone: { base: "h-app-shell-h w-app-shell-w" },
      "phone-sm": { base: "h-app-shell-sm-h w-app-shell-sm-w" },
    },
    statusTone: {
      ink: {},
      // The screen opens on the flooded brand header, so the status row floods to meet it.
      light: { status: "bg-surface-brand" },
    },
  },
});

/** The status row's own surface: none for ink (it reads on the frame), brand for light. */
const STATUS_SURFACE = { ink: undefined, light: "brand" } as const;

export interface AppShellProps extends ComponentProps<"div"> {
  /** Status-bar colour: ink on light screens; `light` (white on brand) when the screen opens on a pink header. */
  statusTone?: "ink" | "light" | undefined;
  /** The status-bar clock. */
  time?: string | undefined;
  /** A TabBar, pinned above the home indicator. */
  tabBar?: ReactNode | undefined;
  /**
   * Sheets and toasts, rendered inside the frame. The frame (`position: relative`, reached through
   * `ref`) is the container they anchor to — pass it as Dialog's `portalContainer`, or place the
   * ToastProvider viewport here, and they stay inside the phone.
   */
  overlay?: ReactNode | undefined;
  /** phone 390×844 · phone-sm 360×780 (the system's 360px floor). */
  size?: "phone" | "phone-sm" | undefined;
}

/**
 * The phone frame every app screen is shown in: status bar, the scrolling screen body (`children`),
 * the tab bar, the home indicator, and an overlay slot the frame anchors.
 */
export function AppShell({
  statusTone = "ink",
  time = "9:41",
  tabBar,
  overlay,
  size = "phone",
  className,
  children,
  ...props
}: AppShellProps) {
  const slots = appShell({ size, statusTone });
  return (
    <div data-surface="light" className={slots.base({ className })} {...props}>
      {/* Device chrome, not content: hidden from assistive tech. */}
      <div aria-hidden data-surface={STATUS_SURFACE[statusTone]} className={slots.status()}>
        <span>{time}</span>
        <Icon icon={BatteryFull} size="sm" />
      </div>
      <div className={slots.body()}>{children}</div>
      {tabBar}
      <div aria-hidden className={slots.home()}>
        <span className={slots.homeBar()} />
      </div>
      {overlay}
    </div>
  );
}
