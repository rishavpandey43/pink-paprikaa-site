// Throwaway: evaluate an expression in a story iframe and print the JSON result.
// Usage: node probe.mjs <story-id> <width> "<js expression>"
import { createRequire } from "node:module";

const require = createRequire("/Users/rishavpa/Professional/pink-paprikaa-site/package.json");
const { chromium } = require("/Users/rishavpa/Professional/pink-paprikaa-site/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright");

const [target, width, expr] = process.argv.slice(2);
const url = target.startsWith("http") ? target : `http://localhost:6006/iframe.html?id=${target}&viewMode=story`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1500);
console.log(JSON.stringify(await page.evaluate(expr), null, 1));
await browser.close();
