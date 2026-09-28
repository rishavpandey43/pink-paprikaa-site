import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { CATALOGUE, libraryUsesOf, utilitiesOf } from "./catalogue";

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

/** Utilities that read Tailwind's spacing namespace; `text-*`, `z-*` and the rest read others. */
const SPACING_READER =
  /^-?(?:[pm][xytrblse]?|gap(?:-[xy])?|space-[xy]|inset(?:-[xy])?|top|right|bottom|left|start|end|translate-[xy]|scroll-[mp][xytrblse]?|indent|basis|size|w|h|min-[wh]|max-[wh])$/;
const SIZING = new Set(["size", "w", "h", "min-w", "min-h", "max-w", "max-h"]);

/** The spacing-namespace utilities packages/ui uses a named spacing step as (`size`, `h`, `p`, …). */
function usesOf(step: string): string[] {
  return libraryUsesOf(step, SPACING_READER);
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
    expect(utilitiesOf("spacing-hit")).toEqual(["min-h-hit"]);
    expect(utilitiesOf("spacing-dock-clearance")).toEqual(["bottom-dock-clearance"]);
    expect(utilitiesOf("spacing-card-min")).toEqual([]);
    expect(utilitiesOf("spacing-card-min-wide")).toEqual([]);
  });
});

/*
 * R65: a colour's chips are its role default (R62) plus every colour utility packages/ui really
 * writes it as — the status glyphs paint `text-status-*` through currentColor, the veg mark
 * `text-veg`, the focus outline `outline-focus` — so the docs never hide a class the library uses.
 */
describe("R65 colour chips", () => {
  it.each([
    ["color-status-danger", ["bg-status-danger", "border-status-danger", "text-status-danger"]],
    ["color-status-success", ["bg-status-success", "border-status-success", "text-status-success"]],
    ["color-status-warning", ["bg-status-warning", "border-status-warning", "text-status-warning"]],
    ["color-veg", ["bg-veg", "border-veg", "text-veg"]],
    ["color-focus", ["bg-focus", "text-focus", "border-focus", "outline-focus"]],
  ])("%s offers its role default and the classes packages/ui uses", (name, expected) => {
    expect(utilitiesOf(name)).toEqual(expected);
  });

  it("keeps an unused colour at its role default", () => {
    expect(libraryUsesOf("turmeric", /^text$/)).toEqual([]);
    expect(utilitiesOf("color-turmeric")).toEqual(["bg-turmeric", "border-turmeric"]);
  });

  it("reads a class under a variant prefix, never one inside a longer name", () => {
    // `has-disabled:border-status-danger` is a use; `shadow-field-ring-danger` is not `ring-danger`.
    expect(libraryUsesOf("status-danger", /^border$/)).toEqual(["border"]);
    expect(libraryUsesOf("danger", /^ring$/)).toEqual([]);
  });
});
