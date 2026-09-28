import { formatValue, selectTokens, type TokenSelection, utilitiesOf } from "./catalogue";
import { CopyButton, CopyScope } from "./copy";
import { DocCell, DocTable } from "./doc-table";

export interface TokenTableProps {
  /** Visible caption and the table's accessible name. */
  caption: string;
  selection: TokenSelection;
}

/**
 * Tokens as a table: the CSS variable and the utility classes it produces (each a copy button,
 * R56), the resolved value, the alias it points at, and its use.
 */
export function TokenTable({ caption, selection }: TokenTableProps) {
  return (
    <DocTable
      caption={caption}
      headers={["Token", "Value", "References", "Use"]}
      minWidth="article"
    >
      {selectTokens(selection).map((entry) => (
        <tr key={`${entry.surface ?? "base"}:${entry.name}`}>
          <DocCell>
            <CopyScope className="flex min-w-0 flex-col items-start">
              <CopyButton text={entry.cssVar} className="text-text-heading" />
              {utilitiesOf(entry.name).map((utility) => (
                <CopyButton key={utility} text={utility} />
              ))}
            </CopyScope>
          </DocCell>
          <DocCell className="font-mono text-mono">{formatValue(entry.value)}</DocCell>
          <DocCell className="font-mono text-mono text-text-muted">
            {entry.reference ?? "—"}
          </DocCell>
          <DocCell className="text-body-sm text-text-muted">{entry.description}</DocCell>
        </tr>
      ))}
    </DocTable>
  );
}
