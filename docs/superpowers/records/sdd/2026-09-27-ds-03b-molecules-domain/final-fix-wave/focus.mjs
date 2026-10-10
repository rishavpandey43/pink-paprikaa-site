// Throwaway: focus-visible screenshots for the fix wave. node focus.mjs <storyId> <width> <name> [selector] [keys...]
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire("/Users/rishavpa/Professional/pink-paprikaa-site/package.json");
const { chromium } = require("/Users/rishavpa/Professional/pink-paprikaa-site/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright");

const [id, width, name, selector, ...keys] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:6006/iframe.html?id=${id}&viewMode=story`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.bringToFront();
await page.mouse.click(1, 899);
if (selector === "blur") await page.evaluate(() => { document.activeElement?.blur(); window.getSelection()?.removeAllRanges(); });
else if (selector && selector !== "-") await page.focus(selector);
for (const key of keys) await page.keyboard.press(key);
await page.waitForTimeout(300);
console.log(await page.evaluate(() => { const a = document.activeElement; return [a?.tagName, a?.textContent?.slice(0, 30), a?.matches(":focus-visible"), getComputedStyle(a).outline, document.hasFocus()].join(" | "); }));
const box = await page.evaluate(() => {
  const r = document.querySelector("#storybook-root").getBoundingClientRect();
  return { x: 0, y: Math.max(0, r.y - 16), width: window.innerWidth, height: Math.min(r.height + 32, 2000) };
});
const file = join(import.meta.dirname, `${name}.png`);
await page.screenshot({ path: file, clip: box });
console.log(file);
await browser.close();
