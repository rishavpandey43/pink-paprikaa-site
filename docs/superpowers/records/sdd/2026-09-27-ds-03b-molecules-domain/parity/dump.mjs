// Throwaway: print the visible short text blocks of a page with their y offset, to pick anchors.
import { createRequire } from "node:module";

const require = createRequire("/Users/rishavpa/Professional/pink-paprikaa-site/package.json");
const { chromium } = require("/Users/rishavpa/Professional/pink-paprikaa-site/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright");

const [url, width = "1280"] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1500);
const rows = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll("h1,h2,h3,h4,span,div,p,button,a,th,td,dt,li")) {
    if ([...el.children].length > 0) continue;
    const t = el.textContent.trim();
    if (t.length < 4 || t.length > 60) continue;
    const r = el.getBoundingClientRect();
    if (r.height === 0) continue;
    const fs = getComputedStyle(el).fontSize;
    if (parseFloat(fs) < 15) continue;
    out.push(`${Math.round(r.y + scrollY)}\t${fs}\t${t}`);
  }
  return out;
});
console.log(`height ${await page.evaluate(() => document.documentElement.scrollHeight)}`);
console.log(rows.join("\n"));
await browser.close();
