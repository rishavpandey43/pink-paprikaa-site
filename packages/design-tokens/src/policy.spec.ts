import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { TokenEntry } from "./catalogue.js";

import {
  AA_NORMAL,
  type ContrastPolicy,
  evaluateContrastPolicy,
  pairsOf,
  resolveColor,
  verdictOf,
} from "./contrast.js";

const readJson = (relative: string): unknown =>
  JSON.parse(readFileSync(join(import.meta.dirname, relative), "utf8"));

const catalogue = readJson("../dist/tokens.json") as TokenEntry[];
const policy = readJson("../contrast-pairs.json") as ContrastPolicy;
const results = evaluateContrastPolicy(catalogue, policy);

describe.each(policy.groups)("contrast group $id", (group) => {
  const groupResults = results.filter((result) => result.group === group.id);

  it("declares at least one pair", () => {
    expect(groupResults.length).toBeGreaterThan(0);
  });

  it.each(groupResults.map((result) => [result.foreground, result.background, result] as const))(
    "%s on %s meets the group minimum",
    (_foreground, _background, result) => {
      expect(
        result.ratio,
        `${result.foreground} on ${result.background} (${result.surface ?? "light"}) = ${result.ratio.toFixed(2)}:1`
      ).toBeGreaterThanOrEqual(result.min);
    }
  );
});

describe("contrast policy", () => {
  it("allows a ratio below AA only for the brand-fill exception, and never below the AA-large floor", () => {
    const loose = policy.groups.filter((group) => group.min < AA_NORMAL);
    expect(loose.every((group) => group.exception === "brand-fill" && group.min === 3)).toBe(true);
  });

  it("uses the brand-fill exception only over the brand pink", () => {
    const brandPink = resolveColor(catalogue, "color-surface-brand", null);
    for (const group of policy.groups.filter((candidate) => candidate.exception === "brand-fill")) {
      for (const [, background] of pairsOf(group)) {
        const ground = resolveColor(catalogue, group.backdrop ?? background, group.surface);
        expect(ground, `${group.id}: exception ground`).toBe(brandPink);
      }
    }
  });

  it("rates white on the brand pink as the declared exception, not a pass", () => {
    const onBrand = results.find(
      (result) =>
        result.foreground === "color-text-on-brand" && result.background === "color-surface-brand"
    );
    expect(onBrand?.verdict).toBe("exception");
  });
});

describe("verdictOf", () => {
  it.each([
    [4.5, 3, "pass"],
    [4.04, 3, "exception"],
    [2.9, 3, "fail"],
    [4.49, 4.5, "fail"],
    [5, 7, "fail"],
    [7, 7, "pass"],
  ] as const)("rates %s against a minimum of %s as %s", (ratio, min, verdict) => {
    expect(verdictOf(ratio, min)).toBe(verdict);
  });
});

describe("a group stricter than AA", () => {
  it("fails a pair that clears AA but not the group's own minimum", () => {
    const strict: ContrastPolicy = {
      groups: [
        {
          id: "aaa-body",
          surface: null,
          pairs: [["color-text-muted", "color-surface-page"]],
          min: 7,
        },
      ],
    };
    const [result] = evaluateContrastPolicy(catalogue, strict);
    expect(result?.ratio).toBeGreaterThanOrEqual(AA_NORMAL);
    expect(result?.ratio).toBeLessThan(7);
    expect(result?.verdict).toBe("fail");
  });
});

describe("pairsOf", () => {
  it("rejects a declared pair that is not [foreground, background]", () => {
    expect(() =>
      pairsOf({ id: "bad", surface: null, pairs: [["color-text-body"]], min: 4.5 })
    ).toThrow(/group "bad" has a pair that is not \[foreground, background\]/);
  });
});
