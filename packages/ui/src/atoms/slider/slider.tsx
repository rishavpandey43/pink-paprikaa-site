import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";

/** The handoff's range: full width, 32px tall, brand accent (DawatCalculator, OfficeLunch). */
const slider = componentVariants({
  base: "h-8 w-full cursor-pointer accent-pink-500 disabled:cursor-not-allowed",
});

export interface SliderProps extends Omit<ComponentProps<"input">, "type"> {
  /** Accessible name. Show the value beside it (a number or a QuantityStepper). */
  label: string;
}

/** A native `<input type="range">` (spec D7): keyboard, touch and `register()` come with it. */
export function Slider({ label, className, ...props }: SliderProps) {
  return <input type="range" aria-label={label} className={slider({ className })} {...props} />;
}
