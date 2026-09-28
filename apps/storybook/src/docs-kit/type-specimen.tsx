import type { ReactNode } from "react";

import { CATALOGUE, formatValue, token, typographyOf, utilitiesOf } from "./catalogue";
import { CopyChips } from "./copy";

export type TypeFamily = "display" | "body" | "devanagari" | "mono";
export type TypeTone = "heading" | "body" | "muted" | "subtle" | "brand";

export interface TypeSpecimenProps {
  /** A `text-*` step without the prefix: `h1`, `body-sm`, `display-2-fluid`. */
  step: string;
  family: TypeFamily;
  tone?: TypeTone | undefined;
  isUppercase?: boolean | undefined;
  children: ReactNode;
}

/** The `font-weight-*` token a type step's composite weight equals, if one does. */
function weightTokenOf(step: string): string | undefined {
  const { fontWeight } = typographyOf(`text-${step}`);
  return CATALOGUE.find(
    (entry) =>
      entry.surface === null &&
      entry.name.startsWith("font-weight-") &&
      String(entry.value) === String(fontWeight)
  )?.name;
}

/**
 * A sample set in one type step, read from its tokens, captioned with the step's values and the
 * classes that set it — size, family and weight — plus their CSS variables, all copyable (R56).
 */
export function TypeSpecimen({
  step,
  family,
  tone = "heading",
  isUppercase = false,
  children,
}: TypeSpecimenProps) {
  const size = token(`text-${step}`);
  const font = token(`font-${family}`);
  const color = token(`color-text-${tone}`);
  const weight = weightTokenOf(step);
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <div
        className={isUppercase ? "wrap-break-word uppercase" : "wrap-break-word"}
        style={{
          fontFamily: `var(${font.cssVar})`,
          fontSize: `var(${size.cssVar})`,
          lineHeight: `var(${size.cssVar}--line-height, normal)`,
          letterSpacing: `var(${size.cssVar}--letter-spacing, normal)`,
          fontWeight: `var(${size.cssVar}--font-weight, inherit)`,
          color: `var(${color.cssVar})`,
        }}
      >
        {children}
      </div>
      <figcaption className="flex min-w-0 flex-col gap-1 font-mono text-mono text-text-muted">
        <span>
          {size.cssVar} · {formatValue(size.value)} · {font.cssVar}
        </span>
        <CopyChips
          values={[
            ...utilitiesOf(size.name),
            ...utilitiesOf(font.name),
            ...(weight === undefined ? [] : utilitiesOf(weight)),
            size.cssVar,
            font.cssVar,
          ]}
        />
      </figcaption>
    </figure>
  );
}
