import { token, utilitiesOf } from "./catalogue";
import { CopyChips } from "./copy";

export interface ShadowLadderProps {
  /** Shadow tokens in ladder order. */
  names: readonly string[];
}

/** The depth ladder: each shadow on a card-sized block, with its use, class and CSS variable. */
export function ShadowLadder({ names }: ShadowLadderProps) {
  return (
    <ul aria-label="Depth ladder" className="flex flex-wrap gap-6 py-2">
      {names.map((name) => {
        const entry = token(name);
        return (
          <li key={name} className="flex w-44 flex-col gap-2">
            <span
              aria-hidden
              data-token={name}
              className={
                name === "shadow-brand"
                  ? "h-16 rounded-lg bg-pink-500"
                  : "h-16 rounded-lg border border-border-subtle bg-surface-card"
              }
              style={{ boxShadow: `var(${entry.cssVar})` }}
            />
            <CopyChips values={[...utilitiesOf(name), entry.cssVar]} />
            <span className="text-caption text-text-subtle">{entry.description}</span>
          </li>
        );
      })}
    </ul>
  );
}
