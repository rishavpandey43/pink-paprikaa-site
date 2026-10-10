// E1 evidence: Chromium's own accessibility tree (CDP Accessibility.getFullAXTree) for the built
// Accordion AsHeadings and FaqSection stories. Prints every heading node and its AX ancestors.
import { chromium } from "playwright";
const base = process.argv[2];
const stories = ["molecules-accordion--as-headings", "organisms-faqsection--default", "organisms-faqsection--heading-level-3"];
const browser = await chromium.launch();
console.log("Chromium", browser.version());
for (const id of stories) {
  const page = await browser.newPage();
  await page.goto(`${base}/iframe.html?id=${id}&viewMode=story`);
  await page.waitForSelector("summary");
  const cdp = await page.context().newCDPSession(page);
  const { nodes } = await cdp.send("Accessibility.getFullAXTree");
  const byId = new Map(nodes.map((n) => [n.nodeId, n]));
  console.log(`\n== ${id}`);
  for (const n of nodes) {
    if (n.ignored || n.role?.value !== "heading") continue;
    const level = n.properties?.find((p) => p.name === "level")?.value?.value;
    const chain = [];
    for (let p = byId.get(n.parentId); p && chain.length < 3; p = byId.get(p.parentId)) {
      if (!p.ignored) chain.push(p.role?.value);
    }
    console.log(`heading level=${level} ${JSON.stringify(n.name?.value)}  ancestors: ${chain.join(" < ")}`);
  }
  // Chromium 151 reports a summary inside a named <details> group as "DisclosureTriangleGrouped".
  const triangles = nodes.filter((n) => !n.ignored && /^DisclosureTriangle/.test(n.role?.value ?? ""));
  console.log(`DisclosureTriangle (summary) nodes: ${triangles.length}; with a heading child: ${triangles.filter((t) => (t.childIds ?? []).some((c) => byId.get(c)?.role?.value === "heading")).length}`);
  await page.close();
}
await browser.close();
