import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/* `import.meta.dirname`, not `new URL(".", import.meta.url)`: Vite rewrites that literal pattern
   into an asset URL (http://localhost/...) when it transforms a jsdom test. */
const SRC = import.meta.dirname;

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return cssFiles(path);
    return entry.name.endsWith(".css") ? [path] : [];
  });
}

describe("library stylesheets", () => {
  it.each(cssFiles(SRC))("%s holds no literal colour — tokens only", (file) => {
    const css = readFileSync(file, "utf8");
    expect(css).not.toMatch(/#[\da-f]{3,8}\b/i);
    expect(css).not.toMatch(/\brgba?\(/i);
    expect(css).not.toMatch(/\bhsla?\(|\boklch\(/i);
  });
});
