// Throwaway: measure docs pages at 360. node docs-probe.mjs <docsId>...
import { createRequire } from "node:module";
const require = createRequire("/Users/rishavpa/Professional/pink-paprikaa-site/package.json");
const { chromium } = require("/Users/rishavpa/Professional/pink-paprikaa-site/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright");
const browser = await chromium.launch();
for (const id of process.argv.slice(2)) {
  const page = await browser.newPage({ viewport: { width: 360, height: 780 } });
  await page.goto(`http://localhost:6006/iframe.html?id=${id}&viewMode=docs`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const out = await page.evaluate(() => {
    const doc = document.documentElement;
    const wide = [...document.querySelectorAll("#storybook-docs *")]
      .filter((el) => el.getBoundingClientRect().right > doc.clientWidth + 1)
      .filter((el) => !el.parentElement || el.parentElement.getBoundingClientRect().right <= doc.clientWidth + 1)
      .slice(0, 8)
      .map((el) => `${el.tagName}.${[...el.classList].join(".")} right=${Math.round(el.getBoundingClientRect().right)} ws=${getComputedStyle(el).whiteSpace} ow=${getComputedStyle(el).overflowWrap} "${el.textContent.slice(0, 40)}"`);
    const code = document.querySelector("#storybook-docs p code");
    return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, wide, codeClass: code?.className, codeParent: code?.closest("[class]")?.className };
  });
  console.log(id, JSON.stringify(out, null, 1));
  await page.close();
}
await browser.close();
