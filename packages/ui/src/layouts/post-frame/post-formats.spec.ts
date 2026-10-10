import { readFileSync } from "node:fs";
import { join } from "node:path";

import { POST_FORMATS, scaledSize } from "./post-formats";

interface CatalogueEntry {
  name: string;
  value: unknown;
  surface: string | null;
}

const catalogue = JSON.parse(
  readFileSync(join(import.meta.dirname, "../../../../design-tokens/dist/tokens.json"), "utf8")
) as CatalogueEntry[];
const tokenValue = (name: string) =>
  catalogue.find((entry) => entry.surface === null && entry.name === name)?.value;

describe("POST_FORMATS", () => {
  it("lists exactly the canvases the tokens define — the only seven", () => {
    const tokenFormats = catalogue
      .filter((entry) => entry.surface === null && /^canvas-[a-z]+-w$/.test(entry.name))
      .map((entry) => entry.name.slice("canvas-".length, -"-w".length));
    expect(Object.keys(POST_FORMATS).sort()).toEqual(tokenFormats.sort());
    expect(tokenFormats).toHaveLength(7);
  });

  it.each(Object.entries(POST_FORMATS))(
    "%s matches its --canvas-* tokens, so the two cannot drift",
    (format, { width, height }) => {
      expect(tokenValue(`canvas-${format}-w`)).toBe(`${String(width)}px`);
      expect(tokenValue(`canvas-${format}-h`)).toBe(`${String(height)}px`);
    }
  );
});

describe("scaledSize", () => {
  it("is the canvas at the display scale", () => {
    expect(scaledSize("story", 0.25)).toEqual({ width: 270, height: 480 });
    expect(scaledSize("leaderboard", 1)).toEqual({ width: 728, height: 90 });
  });

  it.each([0, -0.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects scale=%s instead of drawing an empty or mirrored board",
    (scale) => {
      expect(() => scaledSize("post", scale)).toThrow(RangeError);
    }
  );
});
