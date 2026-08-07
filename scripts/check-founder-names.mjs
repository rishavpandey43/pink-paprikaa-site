import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const BANNED = /rishav|pandey|anand/i;
const TEXT_EXT = /\.(html|js|css|json|txt|xml|webmanifest|mjs|map)$|^[^.]+$/;
const targets = process.argv.slice(2);

if (targets.length === 0) {
  console.error("Usage: check-founder-names.mjs <dir> [<dir>…]");
  process.exit(1);
}

let failures = 0;

async function scan(dir) {
  for (const name of await readdir(dir)) {
    const path = join(dir, name);
    if ((await stat(path)).isDirectory()) {
      await scan(path);
    } else if (TEXT_EXT.test(name)) {
      const content = await readFile(path, "utf8");
      const match = content.match(BANNED);
      if (match) {
        console.error(`FOUNDER-NAME GUARD: "${match[0]}" found in ${path}`);
        failures += 1;
      }
    }
  }
}

for (const dir of targets) {
  await scan(dir);
}

if (failures > 0) {
  console.error(`Founder-name guard failed: ${String(failures)} file(s). See product spec §3.3.`);
  process.exit(1);
}
console.log("Founder-name guard: clean.");
