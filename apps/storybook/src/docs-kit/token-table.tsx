import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@pink-paprikaa-web/ui";

import { formatValue, selectTokens, type TokenSelection, utilitiesOf } from "./catalogue";
import { CopyButton, CopyScope } from "./copy";

const HEADERS = ["Token", "Value", "References", "Use"] as const;

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
    <Table caption={caption} isCaptionVisible minWidth="md">
      <TableHead>
        <TableRow>
          {HEADERS.map((header) => (
            <TableHeaderCell key={header}>{header}</TableHeaderCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {selectTokens(selection).map((entry) => (
          <TableRow key={`${entry.surface ?? "base"}:${entry.name}`}>
            <TableCell>
              <CopyScope className="flex min-w-0 flex-col items-start">
                <CopyButton text={entry.cssVar} className="text-text-heading" />
                {utilitiesOf(entry.name).map((utility) => (
                  <CopyButton key={utility} text={utility} />
                ))}
              </CopyScope>
            </TableCell>
            <TableCell className="font-mono text-mono">{formatValue(entry.value)}</TableCell>
            <TableCell className="font-mono text-mono text-text-muted">
              {entry.reference ?? "—"}
            </TableCell>
            <TableCell className="text-body-sm text-text-muted">{entry.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
