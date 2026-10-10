import { formatValue, tokensWithPrefix, utilitiesOf } from "./catalogue";
import { CopyChips } from "./copy";

/** Every primitive radius on a sample tile; the pill on a button-shaped bar. */
export function RadiusScale() {
  return (
    <ul aria-label="Corner radii" className="flex flex-wrap items-end gap-6">
      {tokensWithPrefix("radius-", "primitive").map((entry) => {
        const isPill = entry.name === "radius-pill";
        return (
          <li key={entry.name} className="flex flex-col gap-2">
            <span
              aria-hidden
              data-token={entry.name}
              className={
                isPill ? "h-10 w-28 bg-pink-500" : "h-15 w-18 border border-pink-200 bg-pink-100"
              }
              style={{ borderRadius: `var(${entry.cssVar})` }}
            />
            <span className="font-mono text-mono text-text-muted">
              {entry.name.replace("radius-", "")} · {formatValue(entry.value)}
            </span>
            <CopyChips values={[...utilitiesOf(entry.name), entry.cssVar]} />
          </li>
        );
      })}
    </ul>
  );
}
