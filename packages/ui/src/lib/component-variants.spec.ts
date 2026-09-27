import { readFileSync } from "node:fs";
import { join } from "node:path";

import { componentVariants, twMergeConfig } from "./component-variants";

interface CatalogueEntry {
  name: string;
  path: string[];
  tier: string;
  surface: string | null;
}

/**
 * Read from disk so the package ships no token payload at runtime. Paths are joined onto
 * `import.meta.dirname` because Vite rewrites `new URL("…", import.meta.url)` into an asset URL.
 */
const catalogue = JSON.parse(
  readFileSync(join(import.meta.dirname, "../../../design-tokens/dist/tokens.json"), "utf8")
) as CatalogueEntry[];
const stylesheet = readFileSync(join(import.meta.dirname, "../styles.css"), "utf8");

function namesIn(namespace: string): string[] {
  return catalogue
    .filter((e) => e.surface === null && e.path[0] === namespace)
    .map((e) => e.path.slice(1).join("-"));
}

describe("twMergeConfig", () => {
  const theme = twMergeConfig.extend?.theme ?? {};

  it.each([
    "text",
    "font",
    "font-weight",
    "radius",
    "shadow",
    "blur",
    "ease",
    "container",
    "aspect",
    "breakpoint",
  ] as const)("declares every %s token the design-tokens build emits", (namespace) => {
    expect(new Set(theme[namespace] as string[])).toEqual(new Set(namesIn(namespace)));
  });

  it("declares every named spacing token (the 4px unit is Tailwind's multiplier, not a name)", () => {
    const named = namesIn("spacing").filter((name) => name !== "unit");
    expect(new Set(theme.spacing as string[])).toEqual(new Set(named));
  });

  it("declares every animation the stylesheet defines", () => {
    const animations = [...stylesheet.matchAll(/--animate-([a-z-]+):/g)].map((m) => m[1]);
    expect(new Set(theme.animate as string[])).toEqual(new Set(animations));
  });
});

describe("componentVariants", () => {
  it("keeps a font size and a text colour as separate decisions", () => {
    const heading = componentVariants({ base: "text-h1 text-text-muted" });
    expect(heading()).toBe("text-h1 text-text-muted");
  });

  it("lets a later font size replace an earlier one", () => {
    const size = componentVariants({
      base: "text-body",
      variants: { isLarge: { true: "text-h2" } },
    });
    expect(size({ isLarge: true })).toBe("text-h2");
  });

  it("lets a consumer className override a radius and a shadow", () => {
    const card = componentVariants({ base: "rounded-lg shadow-1" });
    expect(card({ className: "rounded-xl shadow-3" })).toBe("rounded-xl shadow-3");
  });

  it("treats a named spacing token like any other spacing value", () => {
    const row = componentVariants({ base: "px-4" });
    expect(row({ className: "px-gutter" })).toBe("px-gutter");
  });
});
