import { createHash } from "node:crypto";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import sharp from "sharp";

export interface ImageManifestEntry {
  source: string;
  width: number;
  height: number;
  lqip: string;
  variants: { format: "avif" | "webp" | "jpeg"; width: number; file: string }[];
}

const LADDER = [640, 960, 1280, 1920];
const INPUT_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export async function processImages(srcDir: string, outDir: string): Promise<ImageManifestEntry[]> {
  await mkdir(outDir, { recursive: true });
  const files = (await readdir(srcDir)).filter((f) => INPUT_EXT.has(extname(f).toLowerCase()));
  const manifest: ImageManifestEntry[] = [];

  for (const file of files) {
    const image = sharp(join(srcDir, file));
    // sharp 0.35's Metadata types `width`/`height` as required `number` (not optional) —
    // metadata() always resolves real dimensions from the decoded header, so no `?? 0`
    // fallback is reachable; keeping one would trip `@typescript-eslint/no-unnecessary-condition`.
    const meta = await image.metadata();
    const width = meta.width;
    const height = meta.height;
    const base = file.replace(extname(file), "");

    const lqipBuffer = await image.clone().resize(16).webp({ quality: 40 }).toBuffer();
    const lqip = `data:image/webp;base64,${lqipBuffer.toString("base64")}`;

    const widths = LADDER.filter((w) => w <= width);
    const variants: ImageManifestEntry["variants"] = [];
    for (const w of widths.length > 0 ? widths : [width]) {
      for (const format of ["avif", "webp", "jpeg"] as const) {
        const buffer = await image.clone().resize(w).toFormat(format).toBuffer();
        const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 8);
        const ext = format === "jpeg" ? "jpg" : format;
        const out = `${base}-${w.toString()}w-${hash}.${ext}`;
        await writeFile(join(outDir, out), buffer);
        variants.push({ format, width: w, file: out });
      }
    }
    manifest.push({ source: file, width, height, lqip, variants });
  }

  await writeFile(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  return manifest;
}
