import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { Icon } from "../icon/icon";

const badge = componentVariants({
  base: [
    "inline-flex items-center gap-1.5 rounded-6 px-2.5 py-1 whitespace-nowrap",
    "font-display font-bold text-overline uppercase leading-overline tracking-overline",
  ],
  variants: {
    tone: {
      // Each status tone pairs its soft ground with its own status ink; `brand` is the signature
      // white-on-#EE2C68 pairing.
      brand: "bg-brand-primary text-text-on-brand",
      soft: "bg-brand-soft text-text-brand",
      ink: "bg-surface-inverse text-text-on-inverse",
      success: "bg-status-success-soft text-status-success",
      warning: "bg-status-warning-soft text-status-warning",
      danger: "bg-status-danger-soft text-status-danger",
      neutral: "bg-surface-sunken text-text-body",
    },
  },
  defaultVariants: { tone: "soft" },
});

export interface BadgeProps
  extends Omit<ComponentPropsWithoutRef<"span">, "color">, VariantProps<typeof badge> {
  /** Lucide glyph before the label, drawn at the caps height. */
  icon?: LucideIcon | undefined;
}

export function Badge({ children, className, tone, icon, ...props }: BadgeProps) {
  return (
    <span className={badge({ tone, className })} {...props}>
      {icon ? <Icon icon={icon} size="xs" /> : null}
      {children}
    </span>
  );
}
