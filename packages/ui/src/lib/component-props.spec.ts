import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * The prop vocabulary (AUTHORING.md §2b). A design system is only predictable if the same idea
 * carries the same prop name everywhere, so this is enforced rather than reviewed.
 *
 * The library first shipped with ELEVEN different names for "how does this look" — `tone`,
 * `variant`, `status`, `layout`, `type`, `mark`, `shape`, `state`, `frame`, `statusTone`, `format`
 * — because 15 agents each picked a reasonable-looking name in isolation. Reasonable individually,
 * unusable collectively.
 */
const ALLOWED_VARIANT_PROPS = new Set([
  "variant", // the primary appearance axis — always the first choice
  "size",
  "tone", // a colour axis, only when genuinely independent of `variant`
  "status", // the shared form-validation system only
  "align",
  // Layout axes, which are structural rather than appearance.
  "orientation",
  "justify",
  "position",
  "padding",
  "measure",
  "ratio",
  "radius",
  "on", // "sits on a brand/light ground" — a context flag, not an appearance choice
]);

const BOOLEAN_PREFIX = /^(is|has|can|should)[A-Z]/;

interface Component {
  file: string;
  variantKeys: string[];
  defaults: string[];
}

function componentFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) componentFiles(path, found);
    else if (entry.name.endsWith(".tsx") && !/\.(test|stories)\.tsx$/.test(entry.name))
      found.push(path);
  }
  return found;
}

function parse(file: string): Component | null {
  const source = readFileSync(file, "utf8");
  const call = /componentVariants\(\{[\s\S]*?\n\}\);/.exec(source);
  if (!call) return null;

  const variants = /variants:\s*\{([\s\S]*?)\n {2}\},/.exec(call[0]);
  const variantKeys = [...(variants?.[1] ?? "").matchAll(/^ {4}([A-Za-z_$][\w$]*):\s*\{/gm)].map(
    (m) => m[1] ?? ""
  );

  const defaultBlock = /defaultVariants:\s*\{([^}]*)\}/.exec(call[0]);
  const defaults = (defaultBlock?.[1] ?? "")
    .split(",")
    .map((entry) => entry.trim().split(":")[0]?.trim() ?? "")
    .filter(Boolean);

  return { file: file.slice(SRC.length + 1), variantKeys, defaults };
}

const components = componentFiles(SRC)
  .map(parse)
  .filter((c): c is Component => c !== null && c.variantKeys.length > 0);

describe("component prop vocabulary", () => {
  it("found the components to check", () => {
    expect(components.length).toBeGreaterThan(40);
  });

  it("uses only vocabulary prop names", () => {
    const violations = components.flatMap(({ file, variantKeys }) =>
      variantKeys
        .filter((key) => !ALLOWED_VARIANT_PROPS.has(key) && !BOOLEAN_PREFIX.test(key))
        .map(
          (key) =>
            `${file}: "${key}" is not in the vocabulary — the primary appearance axis is ` +
            `\`variant\` (AUTHORING.md §2b)`
        )
    );
    expect(violations).toEqual([]);
  });

  it("prefixes every boolean variant with is/has", () => {
    const violations = components.flatMap(({ file, variantKeys }) =>
      variantKeys
        .filter((key) => !ALLOWED_VARIANT_PROPS.has(key) && !BOOLEAN_PREFIX.test(key))
        .map((key) => `${file}: boolean "${key}" should read as a question, e.g. "is${key}"`)
    );
    expect(violations).toEqual([]);
  });

  it("gives every variant a default so the component renders bare", () => {
    const violations = components.flatMap(({ file, variantKeys, defaults }) =>
      variantKeys
        .filter((key) => !defaults.includes(key))
        .map((key) => `${file}: variant "${key}" has no defaultVariants entry`)
    );
    expect(violations).toEqual([]);
  });
});
