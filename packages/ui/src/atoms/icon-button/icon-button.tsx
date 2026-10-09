import { Slot } from "radix-ui";
import type { ElementType, ReactElement } from "react";

import type { BaseProps } from "../../lib/common-props";
import { iconButtonVariants } from "../../lib/icon-button-variants";
import { withSx } from "../../lib/sx";
import { usePress } from "../../lib/use-press";
import { Icon, type IconComponent } from "../icon/icon";

export interface IconButtonProps extends Omit<BaseProps<"button">, "children" | "aria-label"> {
  icon: IconComponent;
  /** The accessible name — required: an icon-only control has no other (spec §5.5). */
  label: string;
  /** ghost (default) · primary · secondary · glass (over photography) · tint (inherit parent colour). */
  variant?: "primary" | "secondary" | "ghost" | "glass" | "tint" | undefined;
  /** Drawn at 28 / 32 / 40 / 48px; xs–md keep a 44px touch target. */
  size?: "xs" | "sm" | "md" | "lg" | undefined;
  /** Cart-style count bubble, read out with the label ("Your order (3)"). Hidden at 0. */
  count?: number | undefined;
  /** Render as the single child element (e.g. `<Link href="/cart" />`); the glyph replaces its content. */
  asChild?: boolean | undefined;
  /** Only with `asChild`: the element to render as. */
  children?: ReactElement | undefined;
}

/** Re-export the shared recipe (R132) for callers that styled a Radix trigger. */
export { iconButtonVariants };

const GLYPH_SIZE = { xs: "sm", sm: "sm", md: "md", lg: "lg" } as const;

/** Circular, icon-only button for toolbars, card overlays and app headers. */
export function IconButton({
  icon,
  label,
  variant,
  size = "md",
  count,
  asChild = false,
  disabled = false,
  type = "button",
  sx,
  className,
  children,
  ...props
}: IconButtonProps) {
  const slots = iconButtonVariants({ variant, size });
  const Component: ElementType = asChild ? Slot.Root : "button";
  const hasCount = count !== undefined && count > 0;
  const state = asChild ? { "aria-disabled": disabled || undefined } : { type, disabled };
  const { pressProps } = usePress({
    disabled,
    onPointerDown: props.onPointerDown,
    onPointerUp: props.onPointerUp,
    onPointerLeave: props.onPointerLeave,
    onKeyDown: props.onKeyDown,
    onKeyUp: props.onKeyUp,
    onBlur: props.onBlur,
  });
  return (
    <Component
      className={slots.root({ className: withSx(sx, className) })}
      aria-label={hasCount ? `${label} (${String(count)})` : label}
      {...state}
      {...props}
      {...pressProps}
    >
      <Slot.Slottable child={children}>
        {() => <Icon icon={icon} size={GLYPH_SIZE[size]} />}
      </Slot.Slottable>
      {hasCount ? (
        <span aria-hidden className={slots.count()}>
          {String(count)}
        </span>
      ) : null}
    </Component>
  );
}
