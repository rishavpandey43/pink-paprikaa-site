import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { Icon } from "../icon/icon";

const tag = componentVariants({
  base: [
    // 38px is the tag height across the system (responsive contract) — `h-9.5` on the 4px scale.
    "inline-flex h-9.5 shrink-0 items-center gap-1.5 rounded-6 border px-4 whitespace-nowrap",
    "font-body font-medium text-body2",
    "transition-[background-color,border-color,color] duration-(--duration-fast) ease-out",
    "not-disabled:active:scale-(--motion-press-scale)",
    // Disabled is a real grey fill, never a reduced opacity (state contract).
    "disabled:cursor-not-allowed disabled:border-transparent",
    "disabled:bg-(--button-bg-disabled) disabled:text-(--button-fg-disabled)",
  ],
  variants: {
    /** Selected pills flood the brand pink; unselected stay white with a hairline border. */
    isSelected: {
      true: "border-brand-primary bg-brand-primary text-text-on-brand not-disabled:hover:border-brand-primary-hover not-disabled:hover:bg-brand-primary-hover",
      false:
        "border-border-default bg-surface-card text-text-body not-disabled:hover:border-border-brand-soft not-disabled:hover:bg-brand-tint",
    },
  },
  defaultVariants: { isSelected: false },
});

export interface TagProps
  extends Omit<ComponentPropsWithoutRef<"button">, "color">, VariantProps<typeof tag> {
  // `| undefined` is explicit on every optional below: the workspace sets
  // `exactOptionalPropertyTypes`, under which `prop?: T` REJECTS an explicitly-passed
  // `undefined`. Without it a consumer cannot forward its own optional straight through
  // (`<Thing src={item.photo} />` fails when `photo` is `string | undefined`).
  /** Lucide glyph before the label. */
  icon?: LucideIcon | undefined;
}

export function Tag({
  children,
  className,
  isSelected = false,
  icon,
  disabled = false,
  type = "button",
  ...props
}: TagProps) {
  return (
    <button
      aria-pressed={isSelected}
      className={tag({ isSelected, className })}
      disabled={disabled}
      type={type}
      {...props}
    >
      {icon ? <Icon icon={icon} size="sm" /> : null}
      {children}
    </button>
  );
}
