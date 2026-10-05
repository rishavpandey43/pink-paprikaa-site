#!/usr/bin/env node
/**
 * Every coverage.md `have` prop row that cites `file.ext \`symbol\`` must contain that symbol
 * in the cited file (follow a one-line re-export). Dotted cites check the last identifier
 * (`NotificationAction.label` → `label`). Inherited DOM/`sx` props count when the file
 * extends `BaseProps` / `SxProp`.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const repo = join(import.meta.dirname, "../../..");
const coverage = readFileSync(
  join(repo, "docs/superpowers/specs/2026-10-04-design-parity/coverage.md"),
  "utf8"
);

function load(rel) {
  const abs = join(repo, rel);
  if (!existsSync(abs)) return "";
  return readFileSync(abs, "utf8");
}

function asWord(source, token) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^\\w])${escaped}(?:$|[^\\w])`).test(source);
}

function hasSymbol(rel, symbol) {
  const source = load(rel);
  const leaf = symbol.includes(".") ? symbol.slice(symbol.lastIndexOf(".") + 1) : symbol;
  if (asWord(source, symbol) || asWord(source, leaf)) return true;
  if (
    (leaf === "children" || leaf === "onClick" || leaf === "style") &&
    /(?:BaseProps(?:WithColor)?|ComponentProps)/.test(source)
  ) {
    return true;
  }
  if (
    (leaf === "sx" || leaf === "style" || leaf === "radius") &&
    /(?:SxProp|\bsx\b|withSx)/.test(source)
  ) {
    return true;
  }
  const reexport = /^export \{[\s\S]*?\} from ["'](\.[^"']+)["']\s*;?\s*$/m.exec(source.trim());
  if (reexport === null) return false;
  const next = join(dirname(rel), `${reexport[1]}.tsx`);
  const fallback = join(dirname(rel), `${reexport[1]}.ts`);
  if (existsSync(join(repo, next))) return hasSymbol(next, symbol);
  if (existsSync(join(repo, fallback))) return hasSymbol(fallback, symbol);
  return false;
}

const misses = [];
for (const line of coverage.split("\n")) {
  if (!line.startsWith("| prop `")) continue;
  const cells = line.split("|").map((cell) => cell.trim());
  const item = cells[1] ?? "";
  const equivalent = cells[2] ?? "";
  const status = cells[3] ?? "";
  if (status !== "have") continue;
  const fileMatch =
    /((?:packages|apps|tools)\/[\w./-]+\.(?:tsx?|jsx?|mjs|css))\s+`([A-Za-z_][\w.-]*)`/.exec(
      equivalent
    );
  if (fileMatch === null) continue;
  const [, rel, symbol] = fileMatch;
  if (!hasSymbol(rel, symbol)) misses.push(`${item} — ${rel} has no \`${symbol}\``);
}

if (misses.length > 0) {
  console.error(`coverage-have-props: ${String(misses.length)} miss(es)`);
  for (const miss of misses) console.error(`  ${miss}`);
  process.exit(1);
}
console.log("coverage-have-props: every cited have-prop symbol is in its file");
