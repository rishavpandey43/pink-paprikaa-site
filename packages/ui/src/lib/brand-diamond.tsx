import { componentVariants } from "./component-variants";
import { SymbolMark } from "./symbol-mark";

/**
 * The brand's small diamond (readme §3.4): a square turned 45° carrying the mark — white on a
 * coloured fill, pink on the empty ink-200 fill so it never blends away. Drawn inside its bounding
 * box, so units spaced 4px apart put the tips 4px apart, and a clip across the (unrotated) box
 * fills an exact fraction of the diamond's width. Small diamonds get a bigger, stronger mark
 * (Rating.jsx / SpiceLevel.jsx `markScale`, `markAlpha`).
 */
export const brandDiamondVariants = componentVariants({
  slots: {
    unit: "relative grid shrink-0 place-items-center",
    diamond: "grid rotate-45 place-items-center overflow-hidden rounded-diamond",
    mark: "-rotate-45",
  },
  variants: {
    size: {
      "12px": {
        unit: "size-brand-diamond-box-12",
        diamond: "size-brand-diamond-12",
        mark: "size-6/7",
      },
      "14px": {
        unit: "size-brand-diamond-box-14",
        diamond: "size-brand-diamond-14",
        mark: "size-4/5",
      },
      "16px": {
        unit: "size-brand-diamond-box-16",
        diamond: "size-brand-diamond-16",
        mark: "size-4/5",
      },
      "20px": {
        unit: "size-brand-diamond-box-20",
        diamond: "size-brand-diamond-20",
        mark: "size-3/4",
      },
      "24px": {
        unit: "size-brand-diamond-box-24",
        diamond: "size-brand-diamond-24",
        mark: "size-3/4",
      },
    },
    fill: {
      empty: { diamond: "bg-ink-200", mark: "text-pink-500" },
      brand: { diamond: "bg-pink-500", mark: "text-ink-000" },
      "heat-1": { diamond: "bg-heat-1", mark: "text-ink-000" },
      "heat-2": { diamond: "bg-heat-2", mark: "text-ink-000" },
      "heat-3": { diamond: "bg-heat-3", mark: "text-ink-000" },
      "heat-4": { diamond: "bg-heat-4", mark: "text-ink-000" },
    },
  },
  compoundVariants: [
    { size: "12px", fill: "empty", class: { mark: "opacity-80" } },
    {
      size: "12px",
      fill: ["brand", "heat-1", "heat-2", "heat-3", "heat-4"],
      class: { mark: "opacity-85" },
    },
    { size: ["14px", "16px"], fill: "empty", class: { mark: "opacity-62" } },
    {
      size: ["14px", "16px"],
      fill: ["brand", "heat-1", "heat-2", "heat-3", "heat-4"],
      class: { mark: "opacity-66" },
    },
    { size: ["20px", "24px"], class: { mark: "opacity-50" } },
  ],
  defaultVariants: { size: "16px", fill: "empty" },
});

export type BrandDiamondSize = "12px" | "14px" | "16px" | "20px" | "24px";

export interface BrandDiamondProps {
  size?: BrandDiamondSize | undefined;
  fill?: "empty" | "brand" | "heat-1" | "heat-2" | "heat-3" | "heat-4" | undefined;
  className?: string | undefined;
}

/** Decorative: the component that owns a row of diamonds names the whole row. */
export function BrandDiamond({ size, fill, className }: BrandDiamondProps) {
  const styles = brandDiamondVariants({ size, fill });
  return (
    <span aria-hidden="true" className={styles.unit({ className })}>
      <span className={styles.diamond()}>
        <SymbolMark className={styles.mark()} />
      </span>
    </span>
  );
}
