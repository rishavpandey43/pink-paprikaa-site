/**
 * Sections 2–5 of the coverage map (guidelines, templates, ui kits, handoff rules), appended to
 * `out` through the main script's `table(section, items)` so their cells are kept the same way.
 */
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  cell,
  code,
  handoff,
  list,
  mdUnits,
  parseCard,
  read,
  squash,
} from "./design-coverage-parse.mjs";

function guidelines(out, table) {
  out.push("", "## 2. Guidelines (foundation cards)");
  const guidelineDir = join(handoff, "guidelines");
  const cards = list(guidelineDir).filter((f) => f.endsWith(".card.html"));
  out.push(
    "",
    `> ${cards.length} cards in \`guidelines/\`. Each card is one Storybook foundations page (\`{/* source: … */}\` comment).`
  );
  const items = [];
  for (const file of cards) {
    const card = parseCard(join(guidelineDir, file));
    items.push(
      `${code(file.replace(".card.html", ""))} ${card.group}/${card.name} — ${cell(card.subtitle)}`
    );
    for (const r of card.rows)
      items.push(`${code(file.replace(".card.html", ""))} row — ${cell(r)}`);
  }
  table("2. Guidelines (foundation cards)", items);
}

function templates(out, table) {
  out.push("", "## 3. Templates");
  for (const dirName of list(join(handoff, "templates"))) {
    const dir = join(handoff, "templates", dirName);
    if (!statSync(dir).isDirectory()) continue;
    const file = list(dir).find((f) => f.endsWith(".dc.html"));
    if (!file) continue;
    const html = read(join(dir, file));
    const name = /@template name="([^"]*)"/.exec(html)?.[1] ?? dirName;
    const description = /@template name="[^"]*" description="([^"]*)"/.exec(html)?.[1] ?? "";
    out.push(
      "",
      `#### Template: ${name}`,
      "",
      `> design: \`templates/${dirName}/${file}\` — ${cell(description)}`
    );
    const items = [`template ${code(name)} — ${cell(description)}`];
    if (existsSync(join(dir, ".thumbnail")))
      items.push(`thumbnail ${code(`templates/${dirName}/.thumbnail`)}`);
    let n = 0;
    for (const m of html.matchAll(
      /<x-import component-from-global-scope="[^.]+\.(\w+)"([^>]*)>/g
    )) {
      const attrs = [...m[2].matchAll(/\s([a-z-]+)="([^"{]*)"/g)]
        .filter(([, k]) => !["base", "hint-size", "style"].includes(k))
        .map(([, k, v]) => `${k}="${squash(v, 40)}"`)
        .slice(0, 4);
      items.push(`section ${++n}: ${code(m[1])}${attrs.length ? ` ${cell(attrs.join(" "))}` : ""}`);
    }
    table(`Template: ${name}`, items);
  }
}

function uiKits(out, table) {
  out.push("", "## 4. UI kits");
  for (const kit of list(join(handoff, "ui_kits"))) {
    const dir = join(handoff, "ui_kits", kit);
    if (!statSync(dir).isDirectory()) continue;
    out.push("", `#### Kit: ${kit}`, "", `> design: \`ui_kits/${kit}/\``);
    const items = [];
    for (const file of list(dir)) {
      if (file.endsWith(".jsx")) {
        const fns = [...read(join(dir, file)).matchAll(/^function (\w+)/gm)].map((m) => m[1]);
        items.push(`file ${code(file)}${fns.length ? ` — ${fns.join(", ")}` : ""}`);
      } else if (file === "index.html")
        items.push(`file ${code("index.html")} — the click-through composition`);
    }
    const readme = join(dir, "README.md");
    if (existsSync(readme))
      for (const u of mdUnits(readme))
        if (!u.text.startsWith("§ ")) items.push(`${cell(u.heading)}: ${cell(u.text)}`);
    table(`Kit: ${kit}`, items);
  }
}

function handoffRules(out, table) {
  out.push("", "## 5. Handoff rules (`handoff/*.md`)");
  const ruleSets = [
    [
      "README.md",
      mdUnits(join(handoff, "handoff/README.md"), {
        include: (h) =>
          /^(6|7|8|9|12|13)\.|^[6-7]\.\d/.test(h) ||
          /^(Global|Interactions|Accessibility|QA|Design tokens)/.test(h),
      }),
    ],
    [
      "INTERACTIONS.md (shared mechanics, not tied to one component)",
      mdUnits(join(handoff, "handoff/INTERACTIONS.md"), {
        include: (h) => /Shared mechanics/.test(h),
      }),
    ],
    ["BRAND.md", mdUnits(join(handoff, "handoff/BRAND.md"), { include: () => true })],
    ["SCREENS.md", mdUnits(join(handoff, "handoff/SCREENS.md"), { include: () => true })],
    [
      "TOKENS.md",
      mdUnits(join(handoff, "handoff/TOKENS.md"), { include: () => true }).filter((u) =>
        u.text.startsWith("§ ")
      ),
    ],
  ];
  for (const [file, units] of ruleSets) {
    out.push("", `#### ${file}`);
    const seenText = new Set();
    const items = [];
    for (const u of units) {
      const text = u.text.startsWith("§ ") ? u.text : `${cell(u.heading)}: ${u.text}`;
      if (seenText.has(text)) continue;
      seenText.add(text);
      items.push(`${file.split(" ")[0]}:${u.line} ${cell(text)}`);
    }
    table(file, items);
  }
  out.push(
    "",
    "#### COMPONENTS.md",
    "",
    "COMPONENTS.md restates each component's `.d.ts`, usage and card; its rows are the component tables in section 1."
  );
  table("COMPONENTS.md", [
    "COMPONENTS.md — one reference page per component (covered by section 1)",
  ]);
}

/** Appends sections 2–5 in order. */
export function writeHandoffSections(out, table) {
  guidelines(out, table);
  templates(out, table);
  uiKits(out, table);
  handoffRules(out, table);
}
