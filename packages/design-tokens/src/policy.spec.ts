import { readFileSync } from "node:fs";

import { contrastRatio } from "./contrast.js";

interface CatalogueEntry {
  name: string;
  value: unknown;
  surface: string | null;
}

interface PolicyGroup {
  id: string;
  surface: string | null;
  foregrounds?: string[];
  backgrounds?: string[];
  pairs?: [string, string][];
  backdrop?: string;
  min: number;
  exception?: "brand-fill";
}

const readJson = (relative: string): unknown =>
  JSON.parse(readFileSync(new URL(relative, import.meta.url), "utf8"));

const catalogue = readJson("../dist/tokens.json") as CatalogueEntry[];
const { groups } = readJson("../contrast-pairs.json") as { groups: PolicyGroup[] };

/** A token's value on a surface: the surface override if one exists, else the base token. */
function resolve(name: string, surface: string | null): string {
  const override =
    surface === null ? undefined : catalogue.find((e) => e.surface === surface && e.name === name);
  const entry = override ?? catalogue.find((e) => e.surface === null && e.name === name);
  if (entry === undefined || typeof entry.value !== "string") {
    throw new Error(`contrast policy: no colour token "${name}"${surface ? ` on ${surface}` : ""}`);
  }
  return entry.value;
}

function pairsOf(group: PolicyGroup): [string, string][] {
  if (group.pairs) return group.pairs;
  const backgrounds = group.backgrounds ?? [];
  return (group.foregrounds ?? []).flatMap((fg) =>
    backgrounds.map((bg): [string, string] => [fg, bg])
  );
}

describe.each(groups)("contrast group $id", (group) => {
  it.each(pairsOf(group))("%s on %s meets the group minimum", (fg, bg) => {
    const backdrop =
      group.backdrop === undefined ? undefined : resolve(group.backdrop, group.surface);
    const ratio = contrastRatio(resolve(fg, group.surface), resolve(bg, group.surface), backdrop);
    expect(
      ratio,
      `${fg} on ${bg} (${group.surface ?? "light"}) = ${ratio.toFixed(2)}:1`
    ).toBeGreaterThanOrEqual(group.min);
  });
});

describe("contrast policy", () => {
  it("allows a ratio below AA only for the brand-fill exception, and never below the AA-large floor", () => {
    const loose = groups.filter((g) => g.min < 4.5);
    expect(loose.every((g) => g.exception === "brand-fill" && g.min === 3)).toBe(true);
  });

  it("uses the brand-fill exception only over the brand pink", () => {
    const brandPink = resolve("color-surface-brand", null);
    for (const group of groups.filter((g) => g.exception === "brand-fill")) {
      for (const [, bg] of pairsOf(group)) {
        const ground =
          group.backdrop === undefined
            ? resolve(bg, group.surface)
            : resolve(group.backdrop, group.surface);
        expect(ground, `${group.id}: exception ground`).toBe(brandPink);
      }
    }
  });
});
