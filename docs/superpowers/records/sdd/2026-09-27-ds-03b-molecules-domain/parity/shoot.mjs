// Throwaway parity screenshot tool (Task 21). Not committed (W is git-ignored).
// Usage: node shoot.mjs <component> [width...]
//   jobs come from jobs.mjs; a source entry may carry `text` (scroll the nearest block holding
//   that text into view and clip to it) and `up` (ancestor levels to climb from the text node).
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { JOBS } from "./jobs.mjs";

const require = createRequire("/Users/rishavpa/Professional/pink-paprikaa-site/package.json");
const { chromium } = require("/Users/rishavpa/Professional/pink-paprikaa-site/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright");

const OUT = import.meta.dirname;
const [component, ...widthArgs] = process.argv.slice(2);
const widths = widthArgs.length > 0 ? widthArgs.map(Number) : [360, 1280];
const job = JOBS[component];
if (!job) throw new Error(`unknown component ${component}`);

const browser = await chromium.launch();

async function shot(url, width, file, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(opts.wait ?? 1200);
  if (url.includes(":5051")) {
    // The handoff reveals sections on intersection: walk the page so every section is shown.
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(900);
  }
  if (opts.eval) await page.evaluate(opts.eval);
  if (opts.root) {
    const box = await page.evaluate(() => {
      const r = document.querySelector("#storybook-root").getBoundingClientRect();
      return { x: r.x, y: r.y + window.scrollY, w: r.width, h: Math.max(r.height, document.querySelector("#storybook-root").scrollHeight) };
    });
    await page.screenshot({
      path: file,
      fullPage: true,
      clip: { x: 0, y: Math.max(0, box.y - 16), width, height: Math.min(box.h + 32, 5000) },
    });
  } else if (opts.from) {
    const ys = await page.evaluate(
      ({ from, to, fromNth, toNth }) => {
        const find = (text, nth) => {
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          let node;
          let seen = 0;
          while ((node = walker.nextNode())) {
            if (node.textContent.includes(text) && node.parentElement.getBoundingClientRect().height > 0) {
              if (seen++ < nth) continue;
              return node.parentElement.getBoundingClientRect().top + window.scrollY;
            }
          }
          return null;
        };
        return { y0: find(from, fromNth), y1: to ? find(to, toNth) : null };
      },
      { from: opts.from, to: opts.to, fromNth: opts.fromNth ?? 0, toNth: opts.toNth ?? 0 }
    );
    if (ys.y0 === null) console.log(`  ! from not found: ${opts.from}`);
    if (opts.to && ys.y1 === null) console.log(`  ! to not found: ${opts.to}`);
    const y = Math.max(0, (ys.y0 ?? 0) - 24);
    const end = ys.y1 === null ? y + 900 : ys.y1 - 8 + (opts.extra ?? 0);
    await page.screenshot({
      path: file,
      fullPage: true,
      clip: { x: 0, y, width, height: Math.min(Math.max(end - y, 100), 5000) },
    });
  } else if (opts.text) {
    const box = await page.evaluate(
      ({ text, up, nth }) => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        let seen = 0;
        while ((node = walker.nextNode())) {
          if (node.textContent.includes(text)) {
            if (seen++ < nth) continue;
            let el = node.parentElement;
            for (let i = 0; i < up && el.parentElement; i++) el = el.parentElement;
            el.scrollIntoView({ block: "start" });
            const r = el.getBoundingClientRect();
            return { x: r.x + window.scrollX, y: r.y + window.scrollY, width: r.width, height: r.height };
          }
        }
        return null;
      },
      { text: opts.text, up: opts.up ?? 3, nth: opts.nth ?? 0 }
    );
    if (!box) {
      console.log(`  ! text not found: ${opts.text}`);
      await page.screenshot({ path: file, fullPage: true });
    } else {
      const pad = 8;
      await page.screenshot({
        path: file,
        fullPage: true,
        clip: {
          x: Math.max(0, box.x - pad),
          y: Math.max(0, box.y - pad),
          width: Math.min(width, box.width + pad * 2),
          height: Math.min(box.height + pad * 2, 4000),
        },
      });
    }
  } else {
    await page.screenshot({ path: file, fullPage: true });
  }
  await page.close();
  return file;
}

mkdirSync(OUT, { recursive: true });
for (const width of widths) {
  const sources = [];
  for (const [i, src] of job.sources.entries()) {
    if (src.widths && !src.widths.includes(width)) continue;
    const file = join(OUT, `${component}-${width}-source${job.sources.length > 1 ? `-${i}` : ""}.png`);
    await shot(src.url, width, file, src);
    sources.push({ file, label: src.label ?? src.url });
  }
  const stories = [];
  for (const id of job.stories) {
    const file = join(OUT, `${component}-${width}-story-${id.split("--")[1]}.png`);
    await shot(`http://localhost:6006/iframe.html?id=${id}&viewMode=story`, width, file, { wait: 1500, root: true });
    stories.push({ file, label: id });
  }
  const img = ({ file, label }) =>
    `<figure><figcaption>${label}</figcaption><img src="data:image/png;base64,${readFileSync(file).toString("base64")}"></figure>`;
  const html = `<!doctype html><style>body{margin:0;display:flex;gap:16px;background:#888;font:12px monospace}
    .col{display:flex;flex-direction:column;gap:8px;padding:8px}figure{margin:0}figcaption{color:#fff}img{display:block;outline:1px solid #000}</style>
    <div class="col">${sources.map(img).join("")}</div><div class="col">${stories.map(img).join("")}</div>`;
  const page = await browser.newPage({ viewport: { width: width * 2 + 60, height: 900 } });
  await page.setContent(html);
  await page.waitForTimeout(300);
  const pair = join(OUT, `${component}-${width}-pair.png`);
  await page.screenshot({ path: pair, fullPage: true });
  await page.close();
  console.log(pair);
}
await browser.close();
writeFileSync(join(OUT, ".last"), component);
