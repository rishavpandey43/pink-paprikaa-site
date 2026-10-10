import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/rishavpa/Professional/pink-paprikaa-site/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright",
);

const OUT = new URL(".", import.meta.url).pathname;
const index = await (await fetch("http://localhost:6006/index.json")).json();
const docs = Object.values(index.entries)
  .filter((e) => e.type === "docs" && /foundations|docs\//.test(e.importPath))
  .map((e) => e.id);

const browser = await chromium.launch();
for (const width of [360, 1280]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const id of docs) {
    await page.goto(`http://localhost:6006/iframe.html?id=${id}&viewMode=docs`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const report = await page.evaluate(() => {
      const pageOverflow = document.documentElement.scrollWidth - innerWidth;
      return {
        pageOverflow,
        tables: [...document.querySelectorAll("table")].filter((t) => t.caption !== null && t.getBoundingClientRect().width > 0).map((table) => {
          const frame = table.closest("[role=region]") ?? table.parentElement;
          const ths = [...table.querySelectorAll("thead th")];
          const cols = ths.map((th) => Math.round(th.getBoundingClientRect().width));
          const spill = [...table.querySelectorAll("th, td")].filter(
            (c) => c.scrollWidth > c.clientWidth + 1,
          ).length;
          const scrolls = frame.scrollWidth > frame.clientWidth + 1;
          let lastReach = null;
          if (scrolls) {
            frame.scrollLeft = frame.scrollWidth;
            const last = ths.at(-1).getBoundingClientRect();
            lastReach = last.right <= frame.getBoundingClientRect().right + 1;
            frame.scrollLeft = 0;
          }
          return {
            caption: table.caption?.textContent.slice(0, 50) ?? null,
            rows: table.tBodies[0]?.rows.length ?? 0,
            cols,
            hidden: ths.filter((th) => th.getBoundingClientRect().width < 1).length,
            spill,
            scrolls,
            focusable: scrolls ? frame.tabIndex === 0 && frame.getAttribute("role") === "region" : null,
            named: scrolls ? frame.getAttribute("aria-labelledby") !== null || frame.getAttribute("aria-label") !== null : null,
            lastReach,
          };
        }),
      };
    });
    if (report.tables.length === 0) continue;
    console.log(JSON.stringify({ width, id, ...report }));
    const handles = (await page.$$("table")).filter(Boolean);
    const shown = [];
    for (const h of handles) if (await h.evaluate((t) => t.caption !== null && t.getBoundingClientRect().width > 0)) shown.push(h);
    for (const [i, handle] of shown.entries()) {
      const frame = await handle.evaluateHandle((t) => t.closest("[role=region]") ?? t.parentElement);
      await frame.asElement().scrollIntoViewIfNeeded();
      await frame.asElement().screenshot({ path: `${OUT}docs-${id}-${i}-${width}.png` });
    }
  }
  await page.close();
}
await browser.close();
