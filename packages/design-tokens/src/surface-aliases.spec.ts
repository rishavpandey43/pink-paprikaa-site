import { readFileSync } from "node:fs";
import { join } from "node:path";

interface CatalogueEntry {
  name: string;
  reference: string | null;
  surface: string | null;
}

const catalogue = JSON.parse(
  readFileSync(join(import.meta.dirname, "../dist/tokens.json"), "utf8")
) as CatalogueEntry[];

/**
 * A custom property that aliases another is resolved where it is declared. A base token declared on
 * `:root` as `var(--color-text-link)` keeps the root value inside `[data-surface="brand"]` even
 * though that surface redefines `--color-text-link` — unless the alias is redefined there too.
 * This finds every alias that would silently go stale on a surface (plan 2a, Review Focus 5).
 */
describe.each(["brand", "ink", "soft", "light"])("on the %s surface", (surface) => {
  it("re-declares every alias of a token the surface overrides", () => {
    const overridden = new Set(catalogue.filter((e) => e.surface === surface).map((e) => e.name));
    const stale = catalogue
      .filter((e) => e.surface === null && e.reference !== null)
      .filter((e) => {
        const target = (e.reference ?? "").split(".").join("-");
        return overridden.has(target) && !overridden.has(e.name);
      })
      .map((e) => `${e.name} → ${e.reference ?? ""}`);
    expect(stale).toEqual([]);
  });
});
