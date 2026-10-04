import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * One full-page screenshot per story, per viewport (`mobile` 360×800, `desktop` 1280×800 — see
 * `playwright.config.mts`). The story list is read from the built `storybook-static/index.json`,
 * so a story added anywhere in the workspace gets a snapshot without touching this file.
 *
 * Opt a story out with the `no-visual` tag (and a one-line `Ruling:` in the ledger saying why):
 *
 *   export const Clock: Story = { tags: ["no-visual"], … };
 *
 * Stories that fail the `test` tag (`!test`) are skipped too: that tag is how a story says "not
 * a stable, assertable render".
 */
interface IndexEntry {
  id: string;
  tags?: string[];
  type: string;
}

// Playwright loads this file as CommonJS TS (the package is not `type: module`), so
// `__dirname` is defined and `import.meta` is not.
const indexPath = join(__dirname, "..", "storybook-static", "index.json");
const { entries } = JSON.parse(readFileSync(indexPath, "utf8")) as {
  entries: Record<string, IndexEntry>;
};

const stories = Object.values(entries).filter(
  (entry) =>
    entry.type === "story" &&
    (entry.tags ?? []).includes("test") &&
    !(entry.tags ?? []).includes("no-visual")
);

/** The preview's render phases that mean "mounted, and the play function (if any) has finished". */
const SETTLED_PHASES = ["played", "completed", "finished"];

for (const story of stories) {
  test(story.id, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);

    // 1. The preview finished rendering and ran the story's play function.
    await page.waitForFunction(
      (settled) => {
        const preview = Reflect.get(window, "__STORYBOOK_PREVIEW__") as
          { currentRender?: { phase?: string } } | undefined;
        const phase = preview?.currentRender?.phase;
        return phase !== undefined && settled.includes(phase);
      },
      SETTLED_PHASES,
      { timeout: 20_000 }
    );

    // 2. Fonts and images are in. A story that never settles here is a broken story, not a flake.
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map((image) =>
          image.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                image.addEventListener("load", resolve, { once: true });
                image.addEventListener("error", resolve, { once: true });
              })
        )
      );
      // Two frames: layout and any transition snapped to its end state by reduced motion.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });

    // 2b. Scroll-snap tracks go back to their start. A play function that tabs through or pages a
    //     carousel leaves it wherever focus-scrolling and snapping last settled, and that varies
    //     with machine load (reviewcarousel--mobile/desktop/paging flaked 1 run in 4). The
    //     track's content is covered at its start by the component's other stories.
    await page.evaluate(() => {
      for (const element of document.querySelectorAll<HTMLElement>("*")) {
        if (getComputedStyle(element).scrollSnapType !== "none") element.scrollTo(0, 0);
      }
    });

    // 3. Scroll positions have stopped moving. A scroll-snap track that a play function paged
    //    keeps settling for a few frames after the play resolves; capture only once it is still.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          const scrollers = () =>
            [...document.querySelectorAll<HTMLElement>("*")].filter(
              (element) =>
                element.scrollWidth > element.clientWidth ||
                element.scrollHeight > element.clientHeight
            );
          const read = () =>
            scrollers()
              .map((el) => `${String(el.scrollLeft)},${String(el.scrollTop)}`)
              .join("|");
          let previous = read();
          let stable = 0;
          const tick = () => {
            const current = read();
            stable = current === previous ? stable + 1 : 0;
            previous = current;
            if (stable >= 10) resolve();
            else requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        })
    );

    await expect(page.locator("body")).not.toHaveClass(/sb-show-errordisplay/);

    await expect(page).toHaveScreenshot(`${story.id}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.001,
    });
  });
}
