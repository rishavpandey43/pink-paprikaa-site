import type { ReactNode } from "react";

export type StoryForceState = "rest" | "hover" | "press" | "focus" | "disabled";

/**
 * One labelled cell per forced state for a component's `States` story.
 *
 * Pair with Storybook parameters from {@link storyStatesPseudo}:
 * `parameters: { pseudo: storyStatesPseudo(states) }`. Press is forced via `data-pressed` on the
 * control (R139) — `:active` alone cannot show Enter. Disabled is a real `disabled` prop.
 */
export function StatesRow({
  states,
  render,
}: {
  states: readonly StoryForceState[];
  render: (state: StoryForceState) => ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end gap-6">
      {states.map((state) => (
        <div key={state} id={`cell-${state}`} className="grid justify-items-center gap-2">
          <span className="font-mono text-caption text-text-subtle">{state}</span>
          <div className="grid place-items-center">{render(state)}</div>
        </div>
      ))}
    </div>
  );
}

/** Pseudo-state selectors for {@link StatesRow} cells — hover and focus-visible only. */
export function storyStatesPseudo(states: readonly StoryForceState[]) {
  const hover = states.includes("hover") ? [`#cell-hover`, `#cell-hover *`] : undefined;
  const focusVisible = states.includes("focus") ? [`#cell-focus`, `#cell-focus *`] : undefined;
  return {
    ...(hover === undefined ? {} : { hover }),
    ...(focusVisible === undefined ? {} : { focusVisible }),
  };
}

/** Props to force press / disabled on the control inside a {@link StatesRow} cell. */
export function storyStateControlProps(state: StoryForceState): {
  "data-pressed"?: "";
  disabled?: true;
} {
  if (state === "press") return { "data-pressed": "" };
  if (state === "disabled") return { disabled: true };
  return {};
}
