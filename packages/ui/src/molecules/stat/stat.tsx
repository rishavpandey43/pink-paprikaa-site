import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Icon } from "../../atoms/icon/icon";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const stat = componentVariants({
  slots: {
    root: "grid gap-1",
    glyph: "mb-1",
    // Extrabold is the brand's "black" weight — the ramp's `h1` step is bold, and a headline
    // number is the one place the heavier cut is used.
    value: "font-extrabold",
    label: "font-medium",
    sub: "",
  },
  variants: {
    /** `brand` for a pink number on white; `inverse` on a flooded pink or ink panel. */
    tone: {
      ink: {
        glyph: "text-text-brand",
        value: "text-text-heading",
        label: "text-text-body",
        sub: "text-text-subtle",
      },
      brand: {
        glyph: "text-text-brand",
        value: "text-text-brand",
        label: "text-text-body",
        sub: "text-text-subtle",
      },
      inverse: {
        glyph: "text-text-on-inverse/70",
        value: "text-text-on-inverse",
        label: "text-text-on-inverse/85",
        sub: "text-text-on-inverse/65",
      },
    },
    align: {
      start: { root: "justify-items-start text-left" },
      center: { root: "justify-items-center text-center" },
    },
  },
  defaultVariants: { tone: "ink", align: "start" },
});

export interface StatProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children">, VariantProps<typeof stat> {
  /** The number itself. Never invent one — a stat with no source is a content bug. */
  value: ReactNode;
  /** One short line under the number, sentence case and no full stop. */
  label: string;
  /** Optional second line for the detail behind the number. */
  sub?: string | undefined;
  /** Lucide glyph above the number. */
  icon?: LucideIcon | undefined;
}

export function Stat({ align, className, icon, label, sub, tone, value, ...props }: StatProps) {
  const parts = stat({ align, tone });
  return (
    <div className={parts.root({ className })} {...props}>
      {icon === undefined ? null : <Icon className={parts.glyph()} icon={icon} size="lg" />}
      {/* Fluid, so a four-digit number cannot overflow a narrow column at 360px. */}
      <Text as="span" className={parts.value()} isFluid variant="h1">
        {value}
      </Text>
      <Text as="span" className={parts.label()} variant="body1">
        {label}
      </Text>
      {sub === undefined ? null : (
        <Text as="span" className={parts.sub()} variant="caption">
          {sub}
        </Text>
      )}
    </div>
  );
}
