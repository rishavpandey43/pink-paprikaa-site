import { readFileSync } from "node:fs";

interface CatalogueEntry {
  name: string;
  path: string[];
  value: unknown;
  tier: string;
  surface: string | null;
}

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8");
const theme = read("../dist/theme.css");
const surfaces = read("../dist/surfaces.css");
const catalogue = JSON.parse(read("../dist/tokens.json")) as CatalogueEntry[];
const primitiveColors = JSON.parse(read("../tokens/primitive/color.json")) as {
  color: { pink: Record<string, { $value: string }> };
};
const brandPink = primitiveColors.color.pink["500"]?.$value ?? "";

describe("theme.css", () => {
  it.each([
    "color",
    "font",
    "font-weight",
    "text",
    "leading",
    "tracking",
    "radius",
    "shadow",
    "inset-shadow",
    "drop-shadow",
    "text-shadow",
    "blur",
    "ease",
    "animate",
    "breakpoint",
    "container",
    "aspect",
    "perspective",
  ])("clears Tailwind's stock %s namespace", (namespace) => {
    expect(theme).toContain(`--${namespace}-*: initial;`);
  });

  it("emits the brand pink exactly as authored", () => {
    expect(theme).toContain(`--color-pink-500: ${brandPink};`);
  });

  it("keeps semantic tokens as references so surfaces can retarget them", () => {
    expect(theme).toContain("--color-text-body: var(--color-ink-800);");
    expect(theme).toContain("--color-surface-brand: var(--color-pink-500);");
  });

  it("expands a typography token into Tailwind's font-size sub-properties", () => {
    expect(theme).toContain("--text-h1: 40px;");
    expect(theme).toContain("--text-h1--line-height: 1.1;");
    expect(theme).toContain("--text-h1--letter-spacing: -0.02em;");
    expect(theme).toContain("--text-h1--font-weight: 700;");
  });

  it("sets Tailwind's spacing multiplier to the 4px unit", () => {
    expect(theme).toContain("--spacing: 4px;");
    expect(theme).not.toContain("--spacing-unit");
  });

  it("never leaks surface overrides into the theme", () => {
    expect(theme).not.toMatch(/--surface-(brand|ink|soft|light)-/);
  });
});

describe("surfaces.css", () => {
  it.each(["brand", "ink", "soft", "light"])(
    "scopes the %s surface to the attribute and the class",
    (surface) => {
      expect(surfaces).toContain(`[data-surface="${surface}"], .pp-on-${surface} {`);
    }
  );

  it("paints inherited text in each surface's body colour", () => {
    expect(surfaces.match(/color: var\(--color-text-body\);/g)).toHaveLength(4);
  });
});

describe("tokens.json", () => {
  it("catalogues every token with a name, a CSS variable and a tier", () => {
    expect(catalogue.length).toBeGreaterThan(200);
    for (const entry of catalogue) {
      expect(entry.name).toMatch(/^[a-z0-9-]+$/);
      expect(["primitive", "semantic", "component", "surface"]).toContain(entry.tier);
    }
  });

  it("restores, on a light island, every token another surface overrides — to its exact base value", () => {
    const base = new Map(catalogue.filter((e) => e.surface === null).map((e) => [e.name, e.value]));
    const light = new Map(
      catalogue.filter((e) => e.surface === "light").map((e) => [e.name, e.value])
    );
    const overridden = new Set(
      catalogue.filter((e) => e.surface !== null && e.surface !== "light").map((e) => e.name)
    );
    for (const name of overridden) {
      expect(light.has(name), `light surface restores ${name}`).toBe(true);
      expect(light.get(name), `light ${name} equals base`).toEqual(base.get(name));
    }
  });

  it("holds the brand hex in exactly one token", () => {
    const hex = brandPink.toLowerCase();
    const holders = catalogue.filter(
      (e) => e.tier === "primitive" && typeof e.value === "string" && e.value.toLowerCase() === hex
    );
    expect(holders.map((e) => e.name)).toEqual(["color-pink-500"]);
  });
});
