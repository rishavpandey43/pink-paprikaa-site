import { processImages } from "./pipeline.js";

const [srcDir, outDir] = process.argv.slice(2);
if (!srcDir || !outDir) {
  console.error("Usage: image-pipeline <srcDir> <outDir>");
  process.exit(1);
}
const manifest = await processImages(srcDir, outDir);
console.log(`image-pipeline: ${String(manifest.length)} source image(s) processed → ${outDir}`);
