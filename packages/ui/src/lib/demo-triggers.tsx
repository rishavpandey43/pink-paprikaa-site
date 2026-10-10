import type { ComponentProps, ReactNode } from "react";

import { Icon, type IconComponent } from "../atoms/icon/icon";

/**
 * Plain triggers for atom stories/tests. Atoms may not import Button/IconButton (atomic-layering);
 * demos still need a focusable control that forwards Radix Trigger props via `asChild`.
 */
export function DemoTrigger({
  children,
  type = "button",
  ...props
}: ComponentProps<"button"> & { children: ReactNode }) {
  return (
    <button type={type} {...props}>
      {children}
    </button>
  );
}

/** Icon-only trigger with an accessible name (stands in for IconButton in atom demos). */
export function DemoIconTrigger({
  icon,
  label,
  type = "button",
  ...props
}: Omit<ComponentProps<"button">, "children" | "aria-label"> & {
  icon: IconComponent;
  label: string;
}) {
  return (
    <button type={type} aria-label={label} {...props}>
      <Icon icon={icon} size="md" />
    </button>
  );
}
