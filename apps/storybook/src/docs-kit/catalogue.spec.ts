import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { CATALOGUE, utilitiesOf } from "./catalogue";

const UI_SRC = join(import.meta.dirname, "../../../../packages/ui/src");
const stylesheet = readFileSync(join(UI_SRC, "styles.css"), "utf8");

const BASE = CATALOGUE.filter((entry) => entry.surface === null);

/** Namespaces Tailwind does not own: their classes exist only as `@utility` rules in styles.css. */
const HAND_KEPT = ["duration-", "z-", "pattern-", "effect-", "motion-"];

describe("utilitiesOf", () => {
  it.each(
    BASE.filter((entry) => HAND_KEPT.some((prefix) => entry.name.startsWith(prefix))).map(
      (entry) => entry.name
    )
  )("every class %s produces is an @utility in packages/ui styles.css", (name) => {
    for (const utility of utilitiesOf(name)) {
      expect(stylesheet, utility).toContain(`@utility ${utility} {`);
    }
  });

  it("never offers Tailwind's static max-w-prose (65ch shadows --container-prose)", () => {
    const offered = BASE.flatMap((entry) => utilitiesOf(entry.name));
    expect(offered.filter((utility) => utility.startsWith("max-w-prose"))).toEqual([]);
    expect(utilitiesOf("container-prose")).toEqual(["max-w-text-measure-prose"]);
    expect(utilitiesOf("container-prose-narrow")).toEqual(["max-w-text-measure-narrow"]);
  });

  it("maps only the scrims of the effect namespace", () => {
    expect(utilitiesOf("effect-scrim-bottom")).toEqual(["scrim-bottom"]);
  });
});

/** Library source a consumer ships — not its tests or stories. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    const isSource = /\.(tsx?|css)$/.test(entry.name);
    const isTestOrStory = /\.(test|spec|stories)\./.test(entry.name);
    return isSource && !isTestOrStory ? [path] : [];
  });
}

const SOURCE = sourceFiles(UI_SRC)
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");

/** Utilities that read Tailwind's spacing namespace; `text-*`, `z-*` and the rest read others. */
const SPACING_READER =
  /^-?(?:[pm][xytrblse]?|gap(?:-[xy])?|space-[xy]|inset(?:-[xy])?|top|right|bottom|left|start|end|translate-[xy]|scroll-[mp][xytrblse]?|indent|basis|size|w|h|min-[wh]|max-[wh])$/;
const SIZING = new Set(["size", "w", "h", "min-w", "min-h", "max-w", "max-h"]);

/**
 * The spacing-namespace utilities packages/ui uses a named spacing step as (`size`, `h`, `p`, …).
 * Blind spots: it reads literal class names only, so a step reached through `var(--spacing-…)`, an
 * arbitrary value (`h-(--spacing-…)`, `min-h-[…]`) or a class built at runtime (`` `size-${x}` ``)
 * reads as unused — which the R63 rule below lets carry any marker. Tailwind cannot see a runtime
 * class either, so the library writes every class out literally.
 */
function usesOf(step: string): string[] {
  const pattern = new RegExp(`(?<![\\w-])(-?[a-z]+(?:-[a-z]+)*?)-${step}(?![\\w-])`, "g");
  const prefixes = [...SOURCE.matchAll(pattern)].map((match) => match[1] ?? "");
  return [...new Set(prefixes.filter((prefix) => SPACING_READER.test(prefix)))].sort();
}

/*
 * R61/R63: a spacing token the library uses only as a size (`size-icon-sm`, `h-button-h-md`) carries
 * `$extensions.pink-paprikaa.utility` naming exactly those utilities, so the docs offer
 * `size-icon-sm` instead of `p-icon-sm`; a token it uses for padding or a gap carries none. A token
 * it does not use yet MAY carry one — the primitive chrome sizes are marked by their documented use
 * (`h-header`, `min-h-hit`, `bottom-dock-clearance`) before any component reaches for them. Once
 * the library uses a marked token, its marker must equal those uses.
 */
describe("R61 sizing markers", () => {
  it.each(
    BASE.filter((entry) => entry.name.startsWith("spacing-")).map((entry) => [entry.name, entry])
  )("%s is marked exactly as packages/ui uses it", (name, entry) => {
    const step = name.slice("spacing-".length);
    const uses = usesOf(step);
    const marker = entry.extensions?.["pink-paprikaa"]?.utility;
    for (const utility of marker ?? []) {
      expect(SPACING_READER.test(utility), `${utility} reads the spacing namespace`).toBe(true);
    }
    if (uses.length === 0) return;
    const isSizingOnly = uses.every((use) => SIZING.has(use));
    expect(marker === undefined ? undefined : [...marker].sort()).toEqual(
      isSizingOnly ? uses : undefined
    );
    if (isSizingOnly) {
      expect(utilitiesOf(name)).toEqual(uses.map((use) => `${use}-${step}`));
    }
  });

  it("marks the primitive chrome sizes by their documented use (R63)", () => {
    expect(utilitiesOf("spacing-header")).toEqual(["h-header"]);
    expect(utilitiesOf("spacing-header-compact")).toEqual(["h-header-compact"]);
    expect(utilitiesOf("spacing-tabbar")).toEqual(["h-tabbar"]);
    expect(utilitiesOf("spacing-hit")).toEqual(["min-h-hit", "min-w-hit"]);
    expect(utilitiesOf("spacing-dock-clearance")).toEqual(["bottom-dock-clearance"]);
    expect(utilitiesOf("spacing-card-min")).toEqual([]);
    expect(utilitiesOf("spacing-card-min-wide")).toEqual([]);
  });
});
