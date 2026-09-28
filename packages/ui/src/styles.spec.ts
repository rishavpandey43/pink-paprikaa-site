import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/* `import.meta.dirname`, not `new URL(".", import.meta.url)`: Vite rewrites that literal pattern
   into an asset URL (http://localhost/...) when it transforms a jsdom test. */
const SRC = import.meta.dirname;

interface CatalogueEntry {
  path: string[];
  surface: string | null;
}

const catalogue = JSON.parse(
  readFileSync(join(SRC, "../../design-tokens/dist/tokens.json"), "utf8")
) as CatalogueEntry[];
const stylesheet = readFileSync(join(SRC, "styles.css"), "utf8");

/** Every shadow token some `data-surface` overrides, e.g. `focus-ring`. */
const surfaceShadows = [
  ...new Set(
    catalogue
      .filter((entry) => entry.surface !== null && entry.path[0] === "shadow")
      .map((entry) => entry.path.slice(1).join("-"))
  ),
];

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

/*
 * Tailwind 4 inlines a theme shadow into `shadow-<name>` at build time, so a surface override of
 * `--shadow-<name>` never reaches the class. Each overridden shadow needs an `@utility` that reads
 * the variable at the element instead (the fix `shadow-button-primary` shipped with).
 */
describe("surface-overridden shadows", () => {
  it.each(surfaceShadows)("shadow-%s reads its variable at the element", (name) => {
    expect(stylesheet).toContain(
      `@utility shadow-${name} {\n  --tw-shadow: var(--shadow-${name});\n}`
    );
  });
});
