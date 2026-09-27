import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";
import { SymbolMark } from "../../lib/symbol-mark";

export interface DividerProps extends ComponentProps<"div"> {
  /** line = hairline · diamond = the brand's section break. */
  variant?: "line" | "diamond" | undefined;
  /** Centred uppercase label; also the separator's accessible name. */
  label?: string | undefined;
  /** vertical draws a plain rule (label and diamond are horizontal-only). */
  orientation?: "horizontal" | "vertical" | undefined;
}

type Layout = "rule" | "vertical" | "labelled" | "diamond";

const divider = componentVariants({
  slots: {
    root: "",
    line: "h-px flex-1 bg-border-subtle",
    label: "shrink-0 font-display text-overline text-text-subtle uppercase",
    mark: "size-divider-mark shrink-0 text-divider-mark opacity-90",
  },
  variants: {
    layout: {
      rule: { root: "h-px w-full bg-border-subtle" },
      vertical: { root: "w-px self-stretch bg-border-subtle" },
      labelled: { root: "flex items-center gap-3.5" },
      diamond: { root: "flex items-center gap-3" },
    },
  },
});

function layoutOf(
  variant: DividerProps["variant"],
  label: string | undefined,
  orientation: DividerProps["orientation"]
): Layout {
  if (orientation === "vertical") return "vertical";
  if (variant === "diamond") return "diamond";
  return label === undefined ? "rule" : "labelled";
}

/** Hairline rule. `diamond` inserts the brand mark as a section break. */
export function Divider({
  variant = "line",
  label,
  orientation = "horizontal",
  className,
  ...props
}: DividerProps) {
  const layout = layoutOf(variant, label, orientation);
  const slots = divider({ layout });
  const hasOrnament = layout === "labelled" || layout === "diamond";
  return (
    <div
      role="separator"
      aria-orientation={orientation === "vertical" ? "vertical" : undefined}
      aria-label={label}
      className={slots.root({ className })}
      {...props}
    >
      {hasOrnament ? (
        <>
          <span className={slots.line()} />
          {layout === "diamond" ? (
            <SymbolMark className={slots.mark()} />
          ) : (
            <span className={slots.label()}>{label}</span>
          )}
          <span className={slots.line()} />
        </>
      ) : null}
    </div>
  );
}
