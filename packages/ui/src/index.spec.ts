import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import * as publicApi from "./index";

const SRC = dirname(fileURLToPath(import.meta.url));
const LAYERS = ["atoms", "molecules", "organisms", "templates"] as const;

/** `menu-item-card` → `MenuItemCard` */
function toPascalCase(kebab: string): string {
  return kebab
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function componentFolders(layer: string): string[] {
  return readdirSync(join(SRC, layer), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

const barrel = readFileSync(join(SRC, "index.ts"), "utf8");

/**
 * The barrel is the package's only public surface, and it is hand-maintained. These tests are the
 * guard: add a component folder and forget the export, and the suite fails rather than the
 * component silently being unreachable from `@pink-paprikaa-web/ui`.
 */
describe("public API", () => {
  it.each(LAYERS)("re-exports every %s component folder", (layer) => {
    const missing = componentFolders(layer).filter(
      (name) => !barrel.includes(`./${layer}/${name}/${name}`)
    );
    expect(missing).toEqual([]);
  });

  it.each(LAYERS)("exports a PascalCase component for every %s folder", (layer) => {
    const missing = componentFolders(layer)
      .map(toPascalCase)
      .filter((name) => !(name in publicApi));
    expect(missing).toEqual([]);
  });

  /**
   * The trio is the package's structural contract (AUTHORING.md §1). It is asserted here rather
   * than trusted, because a missing file is invisible: a component with no test still passes the
   * suite, and one with no stories simply never appears in Storybook. `Spinner` shipped exactly
   * that way — built as a `Button` dependency, absent from Storybook until this test existed.
   */
  it.each(LAYERS)("gives every %s component the full file trio", (layer) => {
    const incomplete = componentFolders(layer).flatMap((name) =>
      ["tsx", "test.tsx", "stories.tsx"]
        .filter((role) => !existsSync(join(SRC, layer, name, `${name}.${role}`)))
        .map((role) => `${layer}/${name}/${name}.${role}`)
    );
    expect(incomplete).toEqual([]);
  });

  it("exports the variant builder components are authored with", () => {
    expect(publicApi).toHaveProperty("componentVariants");
  });

  it("has no default export — the package is named exports only", () => {
    expect(publicApi).not.toHaveProperty("default");
  });
});
