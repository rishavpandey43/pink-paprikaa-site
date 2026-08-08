import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = dirname(fileURLToPath(import.meta.url)) + "/..";
const TOKENS_PATH = join(SRC, "../../design-tokens/dist/tokens.json");

/**
 * Tailwind v4 theme namespaces. A token whose first path segment is one of these becomes a named
 * utility for free (`--text-h1` → `text-h1`, `--color-brand-primary` → `bg-brand-primary`).
 * A token under any other prefix has NO namespace, so there is no named utility for it — it can
 * only be reached with the var syntax, `bg-(--button-bg-disabled)`.
 */
const TAILWIND_NAMESPACES = new Set([
  "color",
  "text",
  "font",
  "tracking",
  "leading",
  "radius",
  "shadow",
  "ease",
  "breakpoint",
  "spacing",
  "animate",
]);

function namespacelessTokens(): string[] {
  const tokens = JSON.parse(readFileSync(TOKENS_PATH, "utf8")) as Record<string, string>;
  return Object.keys(tokens).filter((name) => !TAILWIND_NAMESPACES.has(name.split("-")[0] ?? ""));
}

function sourceFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(path, found);
    else if (entry.name.endsWith(".tsx") && !entry.name.endsWith(".test.tsx")) found.push(path);
  }
  return found;
}

/**
 * This is the one defect class the component tests are structurally blind to.
 *
 * `expect(node).toHaveClass("bg-button-bg-disabled")` passes whether or not that class produces a
 * single line of CSS — `toHaveClass` only reads the attribute. So a namespace-less token written as
 * a named utility renders nothing, silently, with a green suite behind it. It shipped in the Button
 * exemplar exactly that way: `disabled:bg-button-bg-disabled` painted no fill at all, and every
 * disabled button was transparent.
 *
 * Rather than assert per component, this walks every source file once and fails on the pattern.
 */
describe("token class usage", () => {
  const tokens = namespacelessTokens();
  const files = sourceFiles(SRC);

  it("finds namespace-less tokens to check", () => {
    expect(tokens.length).toBeGreaterThan(20);
    expect(files.length).toBeGreaterThan(70);
  });

  it("never writes a namespace-less token as a named utility", () => {
    const violations: string[] = [];

    for (const file of files) {
      // Drop every legal `(--token)` reference first, so what remains can only be a bare usage.
      const source = readFileSync(file, "utf8").replace(/\(--[a-z0-9-]+\)/g, "");

      for (const token of tokens) {
        const bare = new RegExp(String.raw`\b[a-z][a-z0-9]*(?:-[a-z0-9]+)*?-${token}\b`);
        const match = bare.exec(source);
        if (match) {
          violations.push(
            `${file.slice(SRC.length + 1)}: "${match[0]}" — --${token} has no Tailwind namespace, ` +
              `so this compiles to nothing. Write it as \`${match[0].replace(`-${token}`, `-(--${token})`)}\`.`
          );
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
