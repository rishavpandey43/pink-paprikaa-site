// Throwaway: the ChoiceCardGroup badge stories at 360 (PlanLengths) and in the 150px tile.
import { createRequire } from "node:module";
const require = createRequire("/Users/rishavpa/Professional/pink-paprikaa-site/package.json");
const { chromium } = require("/Users/rishavpa/Professional/pink-paprikaa-site/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright");
const out = "/Users/rishavpa/Professional/pink-paprikaa-site/.superpowers/sdd/2026-09-27-ds-03b-molecules-domain/final-fix-wave";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 360, height: 780 } });
for (const [id, file] of [
  ["molecules-choicecardgroup--plan-lengths", "badge-plan-lengths-360.png"],
  ["molecules-choicecardgroup--long-badge-in-narrow-tile", "badge-narrow-tile.png"],
]) {
  await page.goto(`http://localhost:6006/iframe.html?id=${id}&viewMode=story&globals=viewport.value:floor360`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const labels = await page.locator("label [id$='-badge'] > * > :last-child").evaluateAll((els) => els.map((e) => `${e.textContent} ${e.scrollWidth}/${e.clientWidth}`));
  console.log(id, labels);
  await page.screenshot({ path: `${out}/${file}`, fullPage: true });
}
await browser.close();
