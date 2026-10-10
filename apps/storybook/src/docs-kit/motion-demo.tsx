import { useState } from "react";

import { Button } from "@pink-paprikaa-web/ui";

import { formatValue, token, utilitiesOf } from "./catalogue";
import { CopyChips } from "./copy";

export interface MotionDemoProps {
  /** Easing step: `out`, `in-out`, `entrance`, `pop`. */
  ease: string;
  /** Duration step: `instant`, `fast`, `base`, `slow`, `page`. */
  duration: string;
  /** Where the design system uses this pairing. */
  use: string;
}

/**
 * A dot that travels its track on one easing and one duration, toggled by a button; the pairing's
 * utilities and CSS variables are copy buttons (R56).
 */
export function MotionDemo({ ease, duration, use }: MotionDemoProps) {
  const easing = token(`ease-${ease}`);
  const time = token(`duration-${duration}`);
  const unit = token("spacing");
  const [isAtEnd, setIsAtEnd] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-4">
        <Button
          variant="secondary"
          size="sm"
          aria-pressed={isAtEnd}
          onClick={() => {
            setIsAtEnd((current) => !current);
          }}
        >
          Play {easing.cssVar} over {time.cssVar}
        </Button>
        <div className="relative h-2.5 w-full max-w-75 rounded-pill bg-ink-200">
          <span
            aria-hidden
            data-token={easing.name}
            className="absolute inset-y-0 w-8 rounded-pill bg-pink-500"
            style={{
              left: isAtEnd ? `calc(100% - var(${unit.cssVar}) * 8)` : "0px",
              transitionProperty: "left",
              transitionDuration: `var(${time.cssVar})`,
              transitionTimingFunction: `var(${easing.cssVar})`,
            }}
          />
        </div>
        <span className="font-mono text-mono text-text-muted">
          {time.cssVar} {formatValue(time.value)} · {use}
        </span>
      </div>
      <CopyChips
        values={[
          ...utilitiesOf(time.name),
          ...utilitiesOf(easing.name),
          time.cssVar,
          easing.cssVar,
        ]}
      />
    </div>
  );
}
