// Throwaway: every docs page's scrolling-table regions at 360, with their accessible names.
import { createRequire } from "node:module";
const require = createRequire("/Users/rishavpa/Professional/pink-paprikaa-site/package.json");
const { chromium } = require("/Users/rishavpa/Professional/pink-paprikaa-site/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright");
const index = await (await fetch("http://localhost:6006/index.json")).json();
const ids = Object.values(index.entries).filter((e) => e.type === "docs" && e.importPath.endsWith(".mdx")).map((e) => e.id);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 360, height: 780 } });
let duplicates = 0;
for (const id of ids) {
  await page.goto(`http://localhost:6006/iframe.html?id=${id}&viewMode=docs`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const names = await page.locator(".sbdocs-content [role=region]").evaluateAll((regions) =>
    regions.map((r) => {
      const ids = (r.getAttribute("aria-labelledby") ?? "").split(" ").filter(Boolean);
      return ids.length ? ids.map((i) => document.getElementById(i)?.textContent?.trim()).join(" ") : r.getAttribute("aria-label");
    })
  );
  if (names.length) console.log(id, JSON.stringify(names));
  if (new Set(names).size !== names.length) duplicates += 1;
}
console.log(`${ids.length} pages; pages with duplicate region names: ${duplicates}`);
await browser.close();
