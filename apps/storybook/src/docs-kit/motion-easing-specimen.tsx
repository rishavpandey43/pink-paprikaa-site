import { token } from "./catalogue";

export const MOTION_EASING_ROWS = [
  { ease: "out", note: "140–220ms" },
  { ease: "in-out", note: "220ms" },
  { ease: "entrance", note: "340ms" },
  { ease: "pop", note: "220ms · add-to-cart only" },
] as const;

/**
 * The Duration & easing card: four looping knobs, one timing function each
 * (`guidelines/motion.card.html`). Track and knob sizes are theme widths, not arbitrary values.
 */
export function MotionEasingSpecimen() {
  return (
    <div className="grid w-fit gap-3">
      {MOTION_EASING_ROWS.map((row) => {
        const easing = token(`ease-${row.ease}`);
        return (
          <div key={row.ease} className="flex items-center gap-3.5">
            <div className="relative h-2.5 w-ease-demo-track overflow-hidden rounded-pill bg-ink-200">
              <i
                aria-hidden
                data-ease-demo={row.ease}
                className="absolute inset-y-0 w-ease-demo-knob rounded-pill bg-pink-500 motion-safe:animate-ease-demo"
                style={{ animationTimingFunction: `var(${easing.cssVar})` }}
              />
            </div>
            <p className="whitespace-nowrap">
              <span className="font-mono text-mono text-text-heading">{easing.cssVar}</span>{" "}
              <span className="text-caption text-text-subtle">{row.note}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
