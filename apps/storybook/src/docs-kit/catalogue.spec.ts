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

/** The spacing-namespace utilities packages/ui uses a named spacing step as (`size`, `h`, `p`, …). */
function usesOf(step: string): string[] {
  const pattern = new RegExp(`(?<![\\w-])(-?[a-z]+(?:-[a-z]+)*?)-${step}(?![\\w-])`, "g");
  const prefixes = [...SOURCE.matchAll(pattern)].map((match) => match[1] ?? "");
  return [...new Set(prefixes.filter((prefix) => SPACING_READER.test(prefix)))].sort();
}

/*
 * R61: a spacing token the library uses only as a size (`size-icon-sm`, `h-button-h-md`) carries
 * `$extensions.pink-paprikaa.utility` naming exactly those utilities, so the docs offer
 * `size-icon-sm` instead of `p-icon-sm`. A token used for padding or a gap — or not at all —
 * carries none and keeps the p/m/mt/gap default.
 */
describe("R61 sizing markers", () => {
  it.each(
    BASE.filter((entry) => entry.name.startsWith("spacing-")).map((entry) => [entry.name, entry])
  )("%s is marked exactly when packages/ui uses it only as a size", (name, entry) => {
    const uses = usesOf(name.slice("spacing-".length));
    const isSizingOnly = uses.length > 0 && uses.every((use) => SIZING.has(use));
    const marker = entry.extensions?.["pink-paprikaa"]?.utility;
    expect(marker === undefined ? undefined : [...marker].sort()).toEqual(
      isSizingOnly ? uses : undefined
    );
    if (isSizingOnly) {
      expect(utilitiesOf(name)).toEqual(uses.map((use) => `${use}-${name.slice(8)}`));
    }
  });
});
