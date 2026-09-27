import { readFileSync } from "node:fs";
import { join } from "node:path";

import * as brandArtwork from "./brand-artwork";

const { ARTWORK } = brandArtwork;

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
      expect(markup).not.toMatch(/#[\da-f]{3,8}\b/i);
      expect(markup).toContain("currentColor");
    }
  });

  it("makes every element id instance-safe", () => {
    for (const { markup } of Object.values(ARTWORK)) {
      for (const [, id] of markup.matchAll(/id="([^"]+)"/g)) expect(id).toMatch(/^__ID__/);
    }
  });

  it('holds inner markup only, with no href="#…" reference left instance-unsafe', () => {
    for (const { markup } of Object.values(ARTWORK)) {
      expect(markup.startsWith("<svg")).toBe(false);
      expect(markup).not.toMatch(/href="#/);
    }
  });

  it("reads a finite width and height from every viewBox", () => {
    for (const { width, height } of Object.values(ARTWORK)) {
      expect(Number.isFinite(width) && width > 0).toBe(true);
      expect(Number.isFinite(height) && height > 0).toBe(true);
    }
  });

  it.each([
    ["lockup", 40_000],
    ["wordmark", 34_000],
    ["symbol", 4_000],
  ] as const)(
    "keeps the inline %s under %i characters (two-decimal path data — every instance ships it)",
    (mark, budget) => {
      expect(ARTWORK[mark].markup.length).toBeLessThan(budget);
    }
  );

  it("exports the artwork only — the white symbol tile lives in brand-artwork.css", () => {
    expect(Object.keys(brandArtwork)).toEqual(["ARTWORK"]);
  });

  it("defines the symbol mask once, as a CSS custom property and a utility", () => {
    const css = readFileSync(join(import.meta.dirname, "brand-artwork.css"), "utf8");
    expect(css).toContain('--pp-symbol-mask: url("data:image/svg+xml,');
    expect(css).toContain("@utility mask-symbol");
  });
});
