import { readFileSync } from "node:fs";

import { composite, contrastRatio, parseColor, type Rgba } from "./contrast.js";

interface Fixtures {
  ratios: { fg: string; bg: string; backdrop?: string; ratio: number }[];
  parsed: { input: string; rgba: Rgba }[];
}

const fixtures = JSON.parse(
  readFileSync(new URL("./contrast.fixtures.json", import.meta.url), "utf8")
) as Fixtures;

describe("parseColor", () => {
  it.each(fixtures.parsed)("reads $input", ({ input, rgba }) => {
    expect(parseColor(input)).toEqual(rgba);
  });

  it("rejects a colour it cannot measure instead of guessing", () => {
    expect(() => parseColor("pink")).toThrow(/unsupported colour "pink"/);
    expect(() => parseColor("var(--color-pink-500)")).toThrow(/unsupported colour/);
  });
});

describe("composite", () => {
  it("returns the bottom colour when the top is fully transparent", () => {
    const bottom: Rgba = { r: 10, g: 20, b: 30, a: 1 };
    expect(composite({ r: 255, g: 255, b: 255, a: 0 }, bottom)).toEqual(bottom);
  });
});

describe("contrastRatio", () => {
  it.each(fixtures.ratios)("$fg on $bg ≈ $ratio", ({ fg, bg, backdrop, ratio }) => {
    expect(contrastRatio(fg, bg, backdrop)).toBeCloseTo(ratio, 1);
  });

  it("is symmetric in foreground and background for opaque colours", () => {
    expect(contrastRatio("rgb(0, 0, 0)", "rgb(255, 255, 255)")).toBeCloseTo(
      contrastRatio("rgb(255, 255, 255)", "rgb(0, 0, 0)"),
      6
    );
  });
});
