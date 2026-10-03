import type { ComponentProps, ReactNode } from "react";

import type { SxProp } from "../../lib/common-props";

import { ChoiceControl } from "../../lib/choice-control";
import { componentVariants } from "../../lib/component-variants";

/** 46×28 track, 22px knob, 220ms slide; pink when on. */
const toggle = componentVariants({
  slots: {
    track: [
      "relative flex h-switch-height w-switch-width rounded-pill bg-ink-300 transition-colors duration-base ease-out",
      "group-has-checked/choice:bg-pink-500",
      "group-has-focus-visible/choice:outline-2 group-has-focus-visible/choice:outline-offset-2 group-has-focus-visible/choice:outline-focus",
      "group-has-disabled/choice:bg-ink-200",
    ],
    knob: "absolute top-0.75 left-0.75 size-switch-knob rounded-pill bg-ink-000 shadow-1 transition-transform duration-base ease-out group-has-checked/choice:translate-x-4.5",
  },
});

export interface SwitchProps extends Omit<ComponentProps<"input">, "type" | "size">, SxProp {
  label: ReactNode;
  description?: ReactNode;
  /** Hides the label visually — it stays the accessible name — for a row that already labels it. */
  isLabelHidden?: boolean | undefined;
}

/** Instant-effect toggle for settings; never inside a save-on-submit form. */
export function Switch(props: SwitchProps) {
  const styles = toggle();
  return (
    <ChoiceControl
      type="checkbox"
      role="switch"
      placement="end"
      control={
        <span className={styles.track()}>
          <span className={styles.knob()} />
        </span>
      }
      {...props}
    />
  );
}
