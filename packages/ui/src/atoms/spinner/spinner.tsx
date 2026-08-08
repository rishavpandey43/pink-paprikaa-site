import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { SYMBOL_PATHS, SYMBOL_VIEW_BOX } from "../logo/logo-paths";

const spinner = componentVariants({
  // The brand's loading state is the diamond symbol pulsing at 1.2s — never a gradient spinner,
  // never a borrowed ring (guide §3.4). Colour comes from `currentColor`, so it works on any ground.
  base: "inline-block shrink-0 animate-pp-pulse",
  variants: {
    /**
     * A spinner is a standalone loading indicator, not an inline glyph, so it does NOT share
     * `Icon`'s 14–32px scale — at those sizes a section loader reads as a speck. `md` (32px) is the
     * default and the one to reach for; `xs`/`sm` exist for the two places a spinner sits inside
     * another control (a `Button` in its loading state), and `lg`/`xl` for full-page waits.
     */
    size: {
      xs: "size-4",
      sm: "size-5",
      md: "size-8",
      lg: "size-12",
      xl: "size-16",
    },
    /**
     * The mark paints with `fill="currentColor"`, so a tone is just the text colour it inherits.
     * `brand` is the default because a standalone loader is a brand moment; `current` opts out and
     * takes whatever colour the surrounding control already set, which is what `Button` needs so
     * the spinner matches its label on both white and flooded-pink grounds.
     */
    tone: {
      brand: "text-text-brand",
      muted: "text-text-muted",
      subtle: "text-text-subtle",
      onBrand: "text-text-on-brand",
      inverse: "text-text-on-inverse",
      current: "",
    },
  },
  defaultVariants: { size: "md", tone: "brand" },
});

export interface SpinnerProps extends VariantProps<typeof spinner> {
  /**
   * What is loading, announced politely. Omit it only when the spinner sits inside a control that
   * already says so — a `Button` in its loading state, for instance.
   */
  label?: string | undefined;
  className?: string | undefined;
}

export function Spinner({ size, tone, label, className }: SpinnerProps) {
  return (
    <svg
      aria-hidden={label === undefined}
      aria-label={label}
      className={spinner({ size, tone, className })}
      fill="currentColor"
      role={label === undefined ? undefined : "status"}
      viewBox={SYMBOL_VIEW_BOX}
      xmlns="http://www.w3.org/2000/svg"
    >
      {SYMBOL_PATHS.map((d) => (
        <path d={d} key={d} />
      ))}
    </svg>
  );
}
