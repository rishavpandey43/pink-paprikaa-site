import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { processImages } from "./pipeline.js";

let src: string;
let out: string;

beforeAll(async () => {
  src = await mkdtemp(join(tmpdir(), "pp-img-src-"));
  out = await mkdtemp(join(tmpdir(), "pp-img-out-"));
  await sharp({
    create: { width: 1600, height: 900, channels: 3, background: { r: 238, g: 44, b: 104 } },
  })
    .jpeg()
    .toFile(join(src, "hero.jpg"));
});

afterAll(async () => {
  await rm(src, { recursive: true, force: true });
  await rm(out, { recursive: true, force: true });
});

describe("processImages", () => {
  it("emits an AVIF+WebP+fallback ladder with LQIP and content-hashed names", async () => {
    const manifest = await processImages(src, out);
    expect(manifest).toHaveLength(1);
    const [entry] = manifest;
    if (!entry) {
      throw new Error("expected processImages to return exactly one manifest entry");
    }
    expect(entry.width).toBe(1600);
    expect(entry.lqip).toMatch(/^data:image\/webp;base64,/);
    const formats = new Set(entry.variants.map((v) => v.format));
    expect(formats).toEqual(new Set(["avif", "webp", "jpeg"]));
    // ladder never upscales: widths ≤ 1600
    expect(Math.max(...entry.variants.map((v) => v.width))).toBeLessThanOrEqual(1600);
    // content-hashed filenames
    for (const v of entry.variants) {
      expect(v.file).toMatch(/-[0-9a-f]{8}\.(avif|webp|jpe?g)$/);
    }
    const written = await readdir(out);
    expect(written).toContain("manifest.json");
  }, 60000);
});
