import type { LucideIcon } from "lucide-react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

const icon = componentVariants({
  // `shrink-0` matters: an icon inside a flex row must never be squeezed by a long label.
  base: "inline-block shrink-0",
  variants: {
    size: {
      xs: "size-3.5",
      sm: "size-4",
      md: "size-5",
      lg: "size-6",
      xl: "size-8",
    },
  },
  defaultVariants: { size: "md" },
});

/** Stroke thins as the glyph grows, so weight reads consistently across sizes (handoff §7). */
const STROKE_WIDTH = { xs: 2, sm: 2, md: 1.75, lg: 1.75, xl: 1.75 } as const;

export interface IconProps extends VariantProps<typeof icon> {
  /**
   * The Lucide glyph itself, imported by name: `import { ShoppingBag } from "lucide-react"`.
   *
   * Deliberately the component and not a string name (which is what the design reference used):
   * resolving a name at runtime requires the whole icon set in the bundle, and this site has a
   * Lighthouse byte-weight budget. Passing the component keeps imports tree-shakeable and typos
   * become type errors.
   */
  icon: LucideIcon;
  /**
   * Accessible name. Omit for decorative icons sitting beside a text label — the icon is then
   * hidden from assistive tech so the label is not announced twice.
   */
  label?: string | undefined;
  className?: string | undefined;
}

export function Icon({ icon: Glyph, size, label, className }: IconProps) {
  return (
    <Glyph
      aria-hidden={label === undefined}
      aria-label={label}
      className={icon({ size, className })}
      role={label === undefined ? undefined : "img"}
      strokeWidth={STROKE_WIDTH[size ?? "md"]}
    />
  );
}
