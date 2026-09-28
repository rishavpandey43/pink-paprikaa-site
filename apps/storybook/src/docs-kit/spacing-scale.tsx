import { cssValue, stepUtilities, token } from "./catalogue";
import { CopyChips } from "./copy";

export interface SpacingScaleProps {
  steps: readonly number[];
}

/**
 * Each step drawn at N × the spacing unit, labelled with its step and pixel length, with the
 * utilities it produces and the CSS it compiles to as copy buttons (R56).
 */
export function SpacingScale({ steps }: SpacingScaleProps) {
  const unit = token("spacing");
  const unitPx = Number.parseFloat(cssValue("spacing"));
  return (
    <ol aria-label="Spacing scale" className="flex flex-col gap-3">
      {steps.map((step) => (
        <li key={step} className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex w-32 shrink-0">
            <span
              aria-hidden
              data-step={step}
              className="h-6 shrink-0 rounded-xs bg-pink-500"
              style={{ width: `calc(var(${unit.cssVar}) * ${String(step)})` }}
            />
          </span>
          <span className="w-20 shrink-0 font-mono text-mono text-text-heading">
            {step} · {step * unitPx}px
          </span>
          <CopyChips
            values={[...stepUtilities(step), `calc(var(${unit.cssVar}) * ${String(step)})`]}
          />
        </li>
      ))}
    </ol>
  );
}
