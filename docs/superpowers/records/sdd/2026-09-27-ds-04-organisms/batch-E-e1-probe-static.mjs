import { chromium } from "playwright";
const html = `<!doctype html><html lang="en"><body>
<details open><summary style="display:flex;list-style:none"><h3 style="margin:0">Is it really pure vegetarian?</h3><span aria-hidden="true">v</span></summary><div>Yes.</div></details>
<details><summary><h4>Can I pause?</h4></summary><div>Yes.</div></details>
</body></html>`;
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html);
const cdp = await page.context().newCDPSession(page);
const { nodes } = await cdp.send("Accessibility.getFullAXTree");
for (const n of nodes) {
  if (n.ignored) continue;
  const level = n.properties?.find((p) => p.name === "level")?.value?.value;
  console.log(n.role?.value, JSON.stringify(n.name?.value ?? ""), level ? `level=${level}` : "", "parent", n.parentId, "id", n.nodeId);
}
console.log("browser", browser.version());
await browser.close();
