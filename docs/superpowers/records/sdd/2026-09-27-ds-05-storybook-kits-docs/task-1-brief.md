### Task 1: One contrast evaluator for the gate and the docs

**Files:**

- Create: `packages/design-tokens/src/catalogue.ts`
- Modify: `packages/design-tokens/src/contrast.ts` (append), `packages/design-tokens/src/policy.spec.ts` (replace), `packages/design-tokens/package.json` (exports)

**Dev reference:** `git show dev:apps/storybook/README.md` (§ "Current state: this target is red") and `git show dev:apps/storybook/.storybook/preview.tsx` (the `color-contrast` comment)

**Dev parity:**

| Dev item                                                                                   | Ruling  | Where / spec clause                                                                                        |
| ------------------------------------------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------- |
| Measured failing-pair table (on-brand 4.04, subtle 3.78, brand-on-soft 3.18, mint 3.15, …) | DROP    | Spec §5.2–§5.3, C13: text tokens re-pointed; this task's evaluator re-measures every pair on every build   |
| Blanket `color-contrast` OFF, justified by ~460 unactionable failures                      | ALREADY | Spec §5.4: off because axe cannot scope one exception; the token gate replaces it (Plan 1 preview comment) |
| "White on the brand pink passes large, fails body; the brand fill is not negotiable"       | ALREADY | D3 + the `brand-fill` exception group; Colors → Contrast (Task 4) renders it                               |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: Plan 1 Task 2 — `contrastRatio`, `parseColor`, `dist/tokens.json`, `contrast-pairs.json`.
- Produces: `@pink-paprikaa-web/design-tokens/catalogue` → `type TokenEntry`; `@pink-paprikaa-web/design-tokens/contrast` adds `AA_NORMAL`, `type CatalogueEntry`, `type PolicyGroup`, `type ContrastPolicy`, `type ContrastVerdict`, `type ContrastResult`, `resolveColor(catalogue, name, surface)`, `pairsOf(group)`, `verdictOf(ratio, min)`, `evaluateContrastPolicy(catalogue, policy)`; `@pink-paprikaa-web/design-tokens/contrast-pairs.json`.

- [ ] **Step 1: Write the failing spec**

Replace `packages/design-tokens/src/policy.spec.ts`:

```ts
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

const readJson = <T>(relative: string): T =>
  JSON.parse(readFileSync(join(import.meta.dirname, relative), "utf8")) as T;

const catalogue = readJson<TokenEntry[]>("../dist/tokens.json");
const policy = readJson<ContrastPolicy>("../contrast-pairs.json");
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
  ] as const)("rates %s against a minimum of %s as %s", (ratio, min, verdict) => {
    expect(verdictOf(ratio, min)).toBe(verdict);
  });
});

describe("pairsOf", () => {
  it("rejects a declared pair that is not [foreground, background]", () => {
    expect(() =>
      pairsOf({ id: "bad", surface: null, pairs: [["color-text-body"]], min: 4.5 })
    ).toThrow(/group "bad" has a pair that is not \[foreground, background\]/);
  });
});
```

Run: `pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -12`
Expected: FAIL — `Cannot find module './catalogue.js'` / `evaluateContrastPolicy is not exported`.

- [ ] **Step 2: The catalogue type**

Create `packages/design-tokens/src/catalogue.ts`:

```ts
/**
 * One entry of `dist/tokens.json` — the catalogue `sd.config.mjs` emits (format `pp/catalogue`).
 * The type lives beside the build that writes the file, so every reader (the contrast policy,
 * Storybook's foundation pages) shares one shape. `theme.spec.ts` asserts the build keeps it.
 */
export interface TokenEntry {
  /** Path joined with `-`, e.g. `color-text-body`. */
  readonly name: string;
  /** `--${name}` — what a consumer puts in `var()`. */
  readonly cssVar: string;
  readonly path: readonly string[];
  /** Resolved value: a CSS string, a number, or a typography composite. */
  readonly value: unknown;
  /** The DTCG alias this token points at (`color.ink.800`), or null for a literal. */
  readonly reference: string | null;
  readonly type: string | null;
  readonly tier: "primitive" | "semantic" | "component" | "surface" | "unknown";
  /** Set on a surface override; null for the base token. */
  readonly surface: "brand" | "ink" | "soft" | "light" | null;
  readonly description: string;
}
```

- [ ] **Step 3: Move the evaluation into `contrast.ts`**

Append to `packages/design-tokens/src/contrast.ts` (after `contrastRatio`), and add the type import at the top of the file (`import type { TokenEntry } from "./catalogue.js";`):

```ts
/** WCAG 2.x AA minimum for normal-size text. */
export const AA_NORMAL = 4.5;

/** The part of a catalogue entry the policy reads. */
export type CatalogueEntry = Pick<TokenEntry, "name" | "value" | "surface">;

/** One group of `contrast-pairs.json` (spec §5.4). Pairs are string arrays so the JSON types as-is. */
export interface PolicyGroup {
  readonly id: string;
  readonly surface: string | null;
  readonly foregrounds?: readonly string[];
  readonly backgrounds?: readonly string[];
  readonly pairs?: readonly (readonly string[])[];
  readonly backdrop?: string;
  readonly min: number;
  readonly exception?: string;
}

export interface ContrastPolicy {
  readonly groups: readonly PolicyGroup[];
}

export type ContrastVerdict = "pass" | "exception" | "fail";

export interface ContrastResult {
  readonly group: string;
  readonly surface: string | null;
  readonly foreground: string;
  readonly background: string;
  readonly backdrop: string | null;
  readonly foregroundValue: string;
  readonly backgroundValue: string;
  readonly backdropValue: string | null;
  readonly ratio: number;
  readonly min: number;
  readonly exception: string | null;
  readonly verdict: ContrastVerdict;
}

/** A colour token's value on a surface: the surface override if there is one, else the base token. */
export function resolveColor(
  catalogue: readonly CatalogueEntry[],
  name: string,
  surface: string | null
): string {
  const override =
    surface === null
      ? undefined
      : catalogue.find((entry) => entry.surface === surface && entry.name === name);
  const entry =
    override ??
    catalogue.find((candidate) => candidate.surface === null && candidate.name === name);
  if (entry === undefined || typeof entry.value !== "string") {
    throw new Error(
      `contrast policy: no colour token "${name}"${surface === null ? "" : ` on ${surface}`}`
    );
  }
  return entry.value;
}

/** Every [foreground, background] pair a group declares. */
export function pairsOf(group: PolicyGroup): [string, string][] {
  if (group.pairs !== undefined) {
    return group.pairs.map((pair) => {
      const [foreground, background] = pair;
      if (pair.length !== 2 || foreground === undefined || background === undefined) {
        throw new Error(
          `contrast policy: group "${group.id}" has a pair that is not [foreground, background]`
        );
      }
      return [foreground, background];
    });
  }
  const backgrounds = group.backgrounds ?? [];
  return (group.foregrounds ?? []).flatMap((foreground) =>
    backgrounds.map((background): [string, string] => [foreground, background])
  );
}

/** "pass" at AA; "exception" between a group's lower minimum and AA; "fail" below the minimum. */
export function verdictOf(ratio: number, min: number): ContrastVerdict {
  if (ratio >= AA_NORMAL) return "pass";
  return ratio >= min ? "exception" : "fail";
}

/**
 * Measures every pair the policy declares against the built catalogue. The contrast gate
 * (`policy.spec.ts`) and Storybook's Colors → Contrast page both call this, so the page can never
 * show a different verdict from the one CI enforces.
 */
export function evaluateContrastPolicy(
  catalogue: readonly CatalogueEntry[],
  policy: ContrastPolicy
): ContrastResult[] {
  return policy.groups.flatMap((group) =>
    pairsOf(group).map(([foreground, background]) => {
      const backdropValue =
        group.backdrop === undefined
          ? null
          : resolveColor(catalogue, group.backdrop, group.surface);
      const foregroundValue = resolveColor(catalogue, foreground, group.surface);
      const backgroundValue = resolveColor(catalogue, background, group.surface);
      const ratio = contrastRatio(foregroundValue, backgroundValue, backdropValue ?? undefined);
      return {
        group: group.id,
        surface: group.surface,
        foreground,
        background,
        backdrop: group.backdrop ?? null,
        foregroundValue,
        backgroundValue,
        backdropValue,
        ratio,
        min: group.min,
        exception: group.exception ?? null,
        verdict: verdictOf(ratio, group.min),
      };
    })
  );
}
```

- [ ] **Step 4: Export the catalogue type and the policy file**

In `packages/design-tokens/package.json` → `exports`, keep the four Plan 1 entries and add:

```json
"./catalogue": {
  "types": "./src/catalogue.ts",
  "import": "./src/catalogue.ts",
  "default": "./src/catalogue.ts"
},
"./contrast-pairs.json": "./contrast-pairs.json"
```

- [ ] **Step 5: Run to green, then probe the gate**

Run: `pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -12` → PASS (all groups, the three policy tests, verdictOf, pairsOf).

Probe (the refactor must still bite): set `tokens/semantic/color.json` → `color.text.muted` to `{color.ink.400}`, rerun, expect FAIL `color-text-muted on color-surface-page (light) = 2.…:1`; `git checkout packages/design-tokens/tokens/semantic/color.json`, rerun, PASS. Paste both.

- [ ] **Step 6: Gate and commit**

```bash
pnpm nx run-many -t typecheck lint test build -p @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static 2>&1 | tail -10
pnpm nx format:check && pnpm nx sync:check
git add packages/design-tokens
git commit -m "feat(tokens): share the contrast policy evaluator with the docs

evaluateContrastPolicy moves out of the policy spec into contrast.ts so the
gate and Storybook's Contrast page read one implementation and can never show
different verdicts. The catalogue entry type and contrast-pairs.json become
package exports (a relative import across packages is a boundary violation).
Probe: muted text on ink-400 fails the gate; reverted.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

