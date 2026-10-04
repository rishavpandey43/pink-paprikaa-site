/**
 * Handoff parsers for `design-coverage.mjs`: each turns one kind of design file into the
 * `design item` strings of a coverage table. Read-only; no output model here.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const repo = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
export const handoff = join(repo, "zip-files/Pink Paprikaa Design System");
const ts = createRequire(join(repo, "package.json"))("typescript");

// ---------------------------------------------------------------------------------------------
// small helpers
// ---------------------------------------------------------------------------------------------
export const read = (file) => readFileSync(file, "utf8");
export const list = (dir) => (existsSync(dir) ? readdirSync(dir).sort() : []);
export const squash = (text, max = 150) => {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
};
/** Table-cell safe: no raw pipes, no newlines. */
export const cell = (text) => text.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
export const code = (text) => `\`${text.replace(/`/g, "'").replace(/\|/g, "\\|")}\``;
export const unquote = (text) => text.replace(/^["'`]|["'`]$/g, "");

/** Prettier re-escapes markdown (\\_ \\* \\|), swaps *em* for _em_ and re-pads cells; keys ignore all of it. */
export const norm = (text) =>
  text
    .replace(/[\\*_]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function splitRow(line) {
  const parts = [];
  let current = "";
  for (let i = 1; i < line.length; i++) {
    const ch = line[i];
    if (ch === "\\" && line[i + 1] === "|") {
      current += "\\|";
      i++;
    } else if (ch === "|") {
      parts.push(current.trim());
      current = "";
    } else current += ch;
  }
  return parts;
}

// ---------------------------------------------------------------------------------------------
// .d.ts → props, types, exports
// ---------------------------------------------------------------------------------------------
export function parseDts(file) {
  const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
  const items = [];
  const docOf = (node) => {
    const doc = ts.getJSDocCommentsAndTags(node).find(ts.isJSDoc);
    return doc?.comment
      ? squash(
          typeof doc.comment === "string" ? doc.comment : doc.comment.map((c) => c.text).join(""),
          90
        )
      : "";
  };
  for (const node of source.statements) {
    if (ts.isInterfaceDeclaration(node)) {
      for (const member of node.members) {
        if (!ts.isPropertySignature(member) && !ts.isMethodSignature(member)) continue;
        const name = member.name.getText(source).replace(/^["']|["']$/g, "");
        const type = member.type ? squash(member.type.getText(source), 110) : "unknown";
        const doc = docOf(member);
        items.push(
          `prop ${code(`${node.name.text}.${name}${member.questionToken ? "?" : ""}: ${type}`)}${doc ? ` — ${cell(doc)}` : ""}`
        );
      }
    } else if (ts.isTypeAliasDeclaration(node)) {
      items.push(`type ${code(`${node.name.text} = ${squash(node.type.getText(source), 110)}`)}`);
    } else if (ts.isFunctionDeclaration(node) && node.name) {
      items.push(`export ${code(`${node.name.text}()`)}`);
    } else if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations)
        items.push(`export ${code(decl.name.getText(source))}`);
    }
  }
  return items;
}

// ---------------------------------------------------------------------------------------------
// .card.html → @dsCard header + labelled rows
// ---------------------------------------------------------------------------------------------
export function parseCard(file) {
  const html = read(file);
  const header = /@dsCard\s+([^>]*?)-->/s.exec(html)?.[1] ?? "";
  const attr = (name) => new RegExp(`${name}="([^"]*)"`).exec(header)?.[1] ?? "";
  const card = { group: attr("group"), name: attr("name"), subtitle: attr("subtitle"), rows: [] };
  const labelled = /<(Row|Frame)\b[^>]*?\blabel=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})([^>]*)>/g;
  for (const match of html.matchAll(labelled)) {
    const label = match[2] ?? match[3] ?? match[4] ?? "";
    const note = /\bnote="([^"]*)"/.exec(match[5])?.[1] ?? "";
    card.rows.push(note ? `${label} — ${note}` : label);
  }
  for (const match of html.matchAll(/className="note"[^>]*>([^<]{3,})</g))
    card.rows.push(`note: ${squash(match[1], 100)}`);
  const unique = [...new Set(card.rows.map((r) => squash(r.replace(/&[a-z]+;/g, " "), 120)))];
  card.rows = unique;
  return card;
}

// ---------------------------------------------------------------------------------------------
// .jsx → detected behaviours
// ---------------------------------------------------------------------------------------------
const KEY_NAMES =
  /\b(ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Home|End|Escape|Enter|Tab|PageUp|PageDown|Backspace|Delete)\b/g;
export function parseJsx(file) {
  if (!existsSync(file)) return [];
  const js = read(file);
  const found = [];
  const keys = new Set([...js.matchAll(KEY_NAMES)].map((m) => m[1]));
  if (/key\s*===?\s*['"] ['"]|case ' '|code\s*===?\s*['"]Space/.test(js)) keys.add("Space");
  if (keys.size > 0) found.push(`keyboard: ${[...keys].join(", ")}`);
  const aria = new Set([...js.matchAll(/\b(aria-[a-z]+)\b/g)].map((m) => m[1]));
  for (const m of js.matchAll(/\brole[=:]\s*\{?['"]([a-z]+)['"]/g)) aria.add(`role=${m[1]}`);
  if (aria.size > 0) found.push(`aria: ${[...aria].sort().join(", ")}`);
  if (/usePress|onPointerEnter|onMouseEnter|\.bind\b|\.\.\.bind/.test(js))
    found.push("states: hover / press / focus-visible / disabled via usePress");
  const motion = new Set([...js.matchAll(/\b(pp-[a-z-]+)\b/g)].map((m) => m[1]));
  for (const m of js.matchAll(/var\(--((?:dur|ease)-[a-z-]+)\)/g)) motion.add(m[1]);
  if (motion.size > 0) found.push(`motion: ${[...motion].sort().join(", ")}`);
  if (/matchMedia|innerWidth|resize/.test(js))
    found.push("responsive: viewport switch (≤640px bottom sheet)");
  if (/addEventListener\(['"](?:mousedown|pointerdown|keydown|scroll)/.test(js))
    found.push("document listeners: outside press / Esc / scroll");
  if (/useState|useRef/.test(js) && /\bopen\b/.test(js))
    found.push("open / close state with focus return");
  return found;
}

// ---------------------------------------------------------------------------------------------
// INTERACTIONS.md → rows keyed by component name
// ---------------------------------------------------------------------------------------------
const IX_ALIASES = {
  Pagination: ["PageButton"],
  DatePicker: ["Calendar day"],
  Tag: ["Tag (filter chip)"],
  SiteHeader: ["SiteHeader logo"],
};
function parseInteractions() {
  const lines = read(join(handoff, "handoff/INTERACTIONS.md")).split("\n");
  const rows = [];
  let section = "";
  let headers = [];
  for (const line of lines) {
    const h = /^## (.+)$/.exec(line);
    if (h) {
      section = h[1];
      headers = [];
      continue;
    }
    if (line.startsWith("|")) {
      const cells = splitRow(line).map((c) => c.replace(/\*\*/g, ""));
      if (cells.every((c) => /^-+$/.test(c))) continue;
      if (headers.length === 0) {
        headers = cells;
        continue;
      }
      const detail = cells
        .slice(1)
        .map((c, i) => (c && c !== "—" ? `${headers[i + 1].toLowerCase()}: ${c}` : ""))
        .filter(Boolean);
      rows.push({
        section,
        lead: cells[0],
        text: squash(`${cells[0]} — ${detail.join("; ")}`, 260),
      });
    } else if (section && /^- \*\*/.test(line)) {
      const lead = /^- \*\*([^*]+)\*\*/.exec(line)[1];
      rows.push({ section, lead, text: squash(line.replace(/^- /, "").replace(/\*\*/g, ""), 260) });
    }
  }
  return rows;
}
/** Returns `ixFor(name)`: the INTERACTIONS.md rows that lead with a component (or its aliases). */
export function interactionsFor() {
  const rows = parseInteractions();
  return (name) => {
    const names = [name, ...(IX_ALIASES[name] ?? [])];
    return rows.filter((r) =>
      names.some((n) =>
        new RegExp(`(^|[^A-Za-z])${n.replace(/[()]/g, "\\$&")}([^A-Za-z]|$)`).test(r.lead)
      )
    );
  };
}

// ---------------------------------------------------------------------------------------------
// markdown "rule units": headings + list items + table rows under chosen sections
// ---------------------------------------------------------------------------------------------
export function mdUnits(file, { from = 0, include = () => true } = {}) {
  const units = [];
  let heading = "";
  let headers = [];
  read(file)
    .split("\n")
    .forEach((line, index) => {
      if (index + 1 < from) return;
      const h = /^(#{2,3}) (.+)$/.exec(line);
      if (h) {
        heading = h[2].replace(/`/g, "");
        headers = [];
        if (include(heading)) units.push({ heading, text: `§ ${heading}`, line: index + 1 });
        return;
      }
      if (!heading || !include(heading)) return;
      if (line.startsWith("|")) {
        const cells = splitRow(line);
        if (cells.every((c) => /^:?-+:?$/.test(c))) return;
        if (headers.length === 0) {
          headers = cells;
          return;
        }
        units.push({
          heading,
          text: squash(cells.filter(Boolean).join(" · ").replace(/\*\*/g, ""), 170),
          line: index + 1,
        });
      } else if (/^\s*(?:[-*]|\d+\.) /.test(line)) {
        units.push({
          heading,
          text: squash(line.replace(/^\s*(?:[-*]|\d+\.) /, "").replace(/\*\*/g, ""), 170),
          line: index + 1,
        });
      }
    });
  return units;
}
