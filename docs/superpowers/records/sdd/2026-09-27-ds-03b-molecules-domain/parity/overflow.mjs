import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/rishavpa/Professional/pink-paprikaa-site/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright",
);

const names = process.argv.slice(2);
const index = await (await fetch("http://localhost:6006/index.json")).json();
const ids = Object.values(index.entries)
  .filter((e) => e.type === "story" && names.some((n) => e.id.startsWith(`molecules-${n}--`)))
  .map((e) => e.id);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
for (const id of ids) {
  await page.goto(`http://localhost:6006/iframe.html?id=${id}&viewMode=story`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  console.log(`${sw > 360 ? "OVER" : "ok  "} ${sw} ${id}`);
}
await browser.close();
