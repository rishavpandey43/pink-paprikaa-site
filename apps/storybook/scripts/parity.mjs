#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
// Visual parity tool (Task 12) — not shipped.
// For each handoff components/.../Name.card.html, screenshots the card and the matching
// Storybook story at 360px and 1280px into
// .superpowers/sdd/2026-10-04-ds-07-design-parity/parity/, plus a side-by-side montage.
//
//   node apps/storybook/scripts/parity.mjs              # all components
//   node apps/storybook/scripts/parity.mjs Button Toast # subset by Name
//
// Requires a built Storybook (`pnpm nx run storybook:build`). Starts two local static servers
// (handoff on 5050, storybook-static on 6108).
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const handoff = join(root, "zip-files/Pink Paprikaa Design System");
const sbStatic = join(root, "apps/storybook/storybook-static");
const outDir = join(root, ".superpowers/sdd/2026-10-04-ds-07-design-parity/parity");
const WIDTHS = [360, 1280];
const DESIGN_PORT = 5050;
const STORY_PORT = 6108;

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (name.endsWith(".card.html")) acc.push(p);
  }
  return acc;
}

/** Serve a directory over HTTP (path-safe). */
function serveDir(dir, port) {
  return new Promise((resolveListen, reject) => {
    const server = createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
      const file = join(dir, urlPath === "/" ? "index.html" : urlPath.replace(/^\//, ""));
      if (!file.startsWith(dir) || !existsSync(file) || statSync(file).isDirectory()) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      const ext = extname(file);
      const type =
        ext === ".html"
          ? "text/html; charset=utf-8"
          : ext === ".css"
            ? "text/css"
            : ext === ".js"
              ? "text/javascript"
              : ext === ".svg"
                ? "image/svg+xml"
                : ext === ".png"
                  ? "image/png"
                  : "application/octet-stream";
      res.writeHead(200, { "Content-Type": type });
      res.end(readFileSync(file));
    });
    server.on("error", reject);
    server.listen(port, "127.0.0.1", () => resolveListen(server));
  });
}

function loadStoryIndex() {
  const indexPath = join(sbStatic, "index.json");
  if (!existsSync(indexPath)) {
    throw new Error("storybook-static/index.json missing — run pnpm nx run storybook:build");
  }
  return JSON.parse(readFileSync(indexPath, "utf8")).entries ?? {};
}

/** Map Button → atoms-button--playground (or first story). */
function storyIdFor(name, entries) {
  // R143: design Text → our Typography. Logo lives under Brand.
  const compact =
    name.toLowerCase() === "text"
      ? "typography"
      : name.toLowerCase() === "logo"
        ? "logo"
        : name.toLowerCase();
  const candidates = Object.keys(entries).filter((id) => {
    if (entries[id]?.type !== "story") return false;
    const base = id.split("--")[0] ?? "";
    return (
      base.endsWith(`-${compact}`) ||
      base === `atoms-${compact}` ||
      base === `molecules-${compact}` ||
      base === `organisms-${compact}` ||
      base === `layouts-${compact}` ||
      base === `brand-${compact}` ||
      (compact === "logo" && base === "brand-logo") ||
      (compact === "typography" && base === "atoms-typography")
    );
  });
  if (candidates.length === 0) return null;
  const playground = candidates.find((id) => id.endsWith("--playground"));
  if (playground) return playground;
  const variants = candidates.find((id) => id.endsWith("--variants") || id.endsWith("--default"));
  return variants ?? candidates[0];
}

async function shot(page, url, width, file, { rootSel } = {}) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(800);
  try {
    await page.evaluate(() => document.fonts?.ready);
  } catch {
    /* fonts API optional on file-like pages */
  }
  if (rootSel) {
    const handle = await page.$(rootSel);
    if (handle) {
      await handle.screenshot({ path: file });
      return;
    }
  }
  await page.screenshot({ path: file, fullPage: true });
}

async function montage(page, left, right, out, width) {
  const half = Math.floor(width / 2);
  await page.setViewportSize({ width, height: 900 });
  await page.setContent(`<!doctype html><html><body style="margin:0;display:flex;background:#111">
    <img id="a" src="data:image/png;base64,${readFileSync(left).toString("base64")}" style="width:${half}px;object-fit:contain;object-position:top;background:#fff"/>
    <img id="b" src="data:image/png;base64,${readFileSync(right).toString("base64")}" style="width:${half}px;object-fit:contain;object-position:top;background:#fff"/>
  </body></html>`);
  await page.waitForTimeout(100);
  const h = await page.evaluate(() =>
    Math.max(
      document.getElementById("a").naturalHeight,
      document.getElementById("b").naturalHeight,
      200
    )
  );
  await page.setViewportSize({ width, height: Math.min(h + 8, 5000) });
  await page.screenshot({ path: out, fullPage: true });
}

const filter = new Set(process.argv.slice(2).map((s) => s.toLowerCase()));
mkdirSync(outDir, { recursive: true });

const cards = walk(join(handoff, "components")).filter((p) => {
  if (filter.size === 0) return true;
  const name = p
    .split("/")
    .pop()
    .replace(/\.card\.html$/, "");
  return filter.has(name.toLowerCase());
});

const entries = loadStoryIndex();
const designServer = await serveDir(handoff, DESIGN_PORT);
const storyServer = await serveDir(sbStatic, STORY_PORT);
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });

const report = [];
try {
  for (const cardPath of cards.sort()) {
    const name = cardPath
      .split("/")
      .pop()
      .replace(/\.card\.html$/, "");
    const rel = relative(handoff, cardPath).replace(/\\/g, "/");
    const designUrl = `http://127.0.0.1:${DESIGN_PORT}/${rel}`;
    const storyId = storyIdFor(name, entries);
    if (!storyId) {
      report.push({ name, storyId: null, note: "no matching story" });
      console.log(`! ${name}: no matching story`);
      continue;
    }
    console.log(`· ${name} ↔ ${storyId}`);
    for (const width of WIDTHS) {
      const dFile = join(outDir, `${name}-design-${width}.png`);
      const sFile = join(outDir, `${name}-story-${width}.png`);
      const mFile = join(outDir, `${name}-montage-${width}.png`);
      await shot(page, designUrl, width, dFile);
      await shot(
        page,
        `http://127.0.0.1:${STORY_PORT}/iframe.html?id=${storyId}&viewMode=story`,
        width,
        sFile,
        { rootSel: "#storybook-root" }
      );
      await montage(page, dFile, sFile, mFile, width === 360 ? 720 : 1280);
    }
    report.push({ name, storyId, note: "ok" });
  }
} finally {
  await browser.close();
  designServer.close();
  storyServer.close();
}

writeFileSync(join(outDir, "report.json"), JSON.stringify(report, null, 2));
const missing = report.filter((r) => r.note !== "ok");
console.log(`\nDone: ${report.length - missing.length}/${report.length} shot. Output: ${outDir}`);
if (missing.length) {
  console.log("Missing stories:");
  for (const m of missing) console.log(`  - ${m.name}`);
  process.exitCode = 1;
}
