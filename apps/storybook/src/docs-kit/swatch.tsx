import { formatValue, selectTokens, token, type TokenSelection, utilitiesOf } from "./catalogue";
import { CopyButton, CopyScope } from "./copy";

export interface SwatchProps {
  /** Token name, e.g. `color-pink-500`. */
  name: string;
}

/**
 * One colour token: a chip painted with its CSS variable, then its name, value, the utility classes
 * it produces (R56) and its reference. Every name, value and class is a button that copies itself
 * (the August port's Colour page did the same); a status line confirms the copy.
 */
export function Swatch({ name }: SwatchProps) {
  const entry = token(name);
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <div
        role="img"
        aria-label={entry.cssVar}
        className="h-16 rounded-sm border border-border-subtle"
        style={{ backgroundColor: `var(${entry.cssVar})` }}
      />
      <figcaption className="flex min-w-0 flex-col items-start font-mono text-mono">
        <CopyScope className="flex min-w-0 flex-col items-start">
          <CopyButton text={entry.cssVar} className="text-text-heading" />
          <CopyButton text={formatValue(entry.value)} />
          <span className="flex min-w-0 flex-wrap gap-x-2">
            {utilitiesOf(name).map((utility) => (
              <CopyButton key={utility} text={utility} />
            ))}
          </span>
        </CopyScope>
        {entry.reference === null ? null : (
          <span className="text-text-subtle">→ {entry.reference}</span>
        )}
        {entry.description === "" ? null : (
          <span className="font-body text-caption text-text-subtle">{entry.description}</span>
        )}
      </figcaption>
    </figure>
  );
}

export interface SwatchesProps {
  selection: TokenSelection;
}

export function Swatches({ selection }: SwatchesProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {selectTokens(selection).map((entry) => (
        <Swatch key={entry.name} name={entry.name} />
      ))}
    </div>
  );
}
