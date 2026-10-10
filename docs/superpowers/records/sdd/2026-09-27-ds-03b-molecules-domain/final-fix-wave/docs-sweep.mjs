// Throwaway: scrollWidth of every MDX docs page at 360.
import { createRequire } from "node:module";
const require = createRequire("/Users/rishavpa/Professional/pink-paprikaa-site/package.json");
const { chromium } = require("/Users/rishavpa/Professional/pink-paprikaa-site/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright");
const index = await (await fetch("http://localhost:6006/index.json")).json();
const ids = Object.values(index.entries).filter((e) => e.type === "docs" && e.importPath.endsWith(".mdx")).map((e) => e.id);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 360, height: 780 } });
const wide = [];
for (const id of ids) {
  await page.goto(`http://localhost:6006/iframe.html?id=${id}&viewMode=docs`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const w = await page.evaluate(() => document.documentElement.scrollWidth);
  if (w > 360) wide.push(`${id} ${w}`);
}
console.log(`${ids.length} MDX docs pages; wider than 360: ${wide.length ? wide.join(", ") : "none"}`);
await browser.close();
