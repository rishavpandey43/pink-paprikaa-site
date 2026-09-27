import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import * as publicApi from "./index";

const SRC = import.meta.dirname;
/** The four tiers (AUTHORING §2). A tier with no folder yet is skipped, not failed. */
const LAYERS = ["atoms", "molecules", "organisms", "layouts"].filter((layer) =>
  existsSync(join(SRC, layer))
);

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
 * The barrel is the package's only public surface (AUTHORING §12), and it is hand-maintained. Add
 * a component folder and forget the export, the test or the stories, and this suite fails rather
 * than the component silently being unreachable, untested or absent from Storybook.
 */
describe("public API", () => {
  it.each(LAYERS)("re-exports every %s component folder from the barrel", (layer) => {
    const missing = componentFolders(layer).filter(
      (name) => !barrel.includes(`./${layer}/${name}/${name}"`)
    );
    expect(missing).toEqual([]);
  });

  it.each(LAYERS)("exports a PascalCase component for every %s folder", (layer) => {
    const missing = componentFolders(layer)
      .map(toPascalCase)
      .filter((name) => !(name in publicApi));
    expect(missing).toEqual([]);
  });

  it.each(LAYERS)("gives every %s component the full file trio (AUTHORING §2)", (layer) => {
    const incomplete = componentFolders(layer).flatMap((name) =>
      ["tsx", "test.tsx", "stories.tsx"]
        .filter((role) => !existsSync(join(SRC, layer, name, `${name}.${role}`)))
        .map((role) => `${layer}/${name}/${name}.${role}`)
    );
    expect(incomplete).toEqual([]);
  });

  it("has no default export — the package is named exports only", () => {
    expect(publicApi).not.toHaveProperty("default");
  });
});
