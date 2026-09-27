import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ARTWORK, SYMBOL_DATA_URI_WHITE } from "./brand-artwork";

/* `join(import.meta.dirname, …)`, not `new URL(…, import.meta.url)`: Vite rewrites that literal
   pattern into an asset URL when it transforms a jsdom test. */
const source = (file: string) =>
  readFileSync(join(import.meta.dirname, "../assets/brand", file), "utf8");
const viewBoxOf = (svg: string) => /viewBox="([^"]+)"/.exec(svg)?.[1];

describe("brand artwork", () => {
  it.each([
    ["lockup", "logo-lockup-pink.svg"],
    ["wordmark", "logo-wordmark-pink.svg"],
    ["symbol", "symbol-pink.svg"],
  ] as const)(
    "keeps the %s viewBox of its source file (regenerate if this fails)",
    (mark, file) => {
      expect(ARTWORK[mark].viewBox).toBe(viewBoxOf(source(file)));
    }
  );

  it("paints every mark with currentColor — no literal colour survives", () => {
    for (const { markup } of Object.values(ARTWORK)) {
      expect(markup).not.toMatch(/#[\da-f]{3,6}\b/i);
      expect(markup).toContain("currentColor");
    }
  });

  it("makes every element id instance-safe", () => {
    for (const { markup } of Object.values(ARTWORK)) {
      for (const [, id] of markup.matchAll(/id="([^"]+)"/g)) expect(id).toMatch(/^__ID__/);
    }
  });

  it("offers the white symbol as a CSS data URI", () => {
    expect(SYMBOL_DATA_URI_WHITE).toMatch(/^url\("data:image\/svg\+xml,/);
  });

  it("defines the symbol mask once, as a CSS custom property and a utility", () => {
    const css = readFileSync(join(import.meta.dirname, "brand-artwork.css"), "utf8");
    expect(css).toContain('--pp-symbol-mask: url("data:image/svg+xml,');
    expect(css).toContain("@utility mask-symbol");
  });
});
