import {
  type ContrastPolicy,
  type ContrastResult,
  type ContrastVerdict,
  evaluateContrastPolicy,
} from "@pink-paprikaa-web/design-tokens/contrast";
import pairs from "@pink-paprikaa-web/design-tokens/contrast-pairs.json";
import { Badge, type BadgeProps } from "@pink-paprikaa-web/ui";

import { CATALOGUE } from "./catalogue";
import { DocCell, DocTable } from "./doc-table";

const POLICY: ContrastPolicy = pairs;

export const VERDICT_LABEL: Readonly<Record<ContrastVerdict, string>> = {
  pass: "Pass — AA",
  exception: "Exception — brand fill, AA-large",
  fail: "Fail",
};

const VERDICT_TONE: Readonly<Record<ContrastVerdict, NonNullable<BadgeProps["tone"]>>> = {
  pass: "success",
  exception: "warning",
  fail: "danger",
};

/** The policy measured on this build — the same call the contrast gate makes. */
export function contrastResults(groups?: readonly string[]): ContrastResult[] {
  const all = evaluateContrastPolicy(CATALOGUE, POLICY);
  return groups === undefined ? all : all.filter((result) => groups.includes(result.group));
}

function Sample({ result }: { result: ContrastResult }) {
  const chip = (
    <span
      aria-hidden
      className="inline-flex size-10 items-center justify-center rounded-sm font-display font-bold"
      style={{ backgroundColor: result.backgroundValue, color: result.foregroundValue }}
    >
      Aa
    </span>
  );
  if (result.backdropValue === null) return chip;
  return (
    <span
      aria-hidden
      className="inline-flex rounded-md p-1"
      style={{ backgroundColor: result.backdropValue }}
    >
      {chip}
    </span>
  );
}

export interface ContrastMatrixProps {
  /** Policy group ids to show; every group when omitted. */
  groups?: readonly string[] | undefined;
}

/** Every declared text/background pair with its measured ratio, its minimum and its verdict. */
export function ContrastMatrix({ groups }: ContrastMatrixProps) {
  const results = contrastResults(groups);
  const count = (verdict: ContrastVerdict) =>
    results.filter((result) => result.verdict === verdict).length;
  return (
    <div className="flex flex-col gap-4">
      <div className="font-mono text-mono text-text-muted">
        {results.length} pairs · {count("pass")} pass AA · {count("exception")} declared exceptions
        · {count("fail")} fail
      </div>
      <DocTable
        caption="Every text and background pair the components paint, measured from this build's tokens"
        headers={["Sample", "Text", "Background", "Surface", "Ratio", "Needs", "Verdict"]}
        minWidth="narrow"
      >
        {results.map((result) => (
          <tr
            key={`${result.group}:${result.foreground}:${result.background}`}
            data-verdict={result.verdict}
          >
            <DocCell>
              <Sample result={result} />
            </DocCell>
            <DocCell className="font-mono text-mono">{result.foreground}</DocCell>
            <DocCell className="font-mono text-mono">
              {result.backdrop === null
                ? result.background
                : `${result.background} over ${result.backdrop}`}
            </DocCell>
            <DocCell>{result.surface ?? "light"}</DocCell>
            <DocCell className="font-mono text-mono tabular-nums">
              {result.ratio.toFixed(2)}:1
            </DocCell>
            <DocCell className="font-mono text-mono tabular-nums">{result.min}:1</DocCell>
            <DocCell>
              <Badge tone={VERDICT_TONE[result.verdict]}>{VERDICT_LABEL[result.verdict]}</Badge>
            </DocCell>
          </tr>
        ))}
      </DocTable>
    </div>
  );
}
