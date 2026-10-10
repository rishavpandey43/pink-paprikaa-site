#!/usr/bin/env node
/**
 * Count guard — the design-parity pass may add tests and stories, never lose them.
 *
 * Measures four numbers and compares each with `baseline-counts.json`:
 *
 *   ui         passed tests of `packages/ui`           (Vitest, jsdom)
 *   storybook  passed tests of `apps/storybook`        (Vitest, browser mode: every story + docs-kit)
 *   tokens     passed tests of `packages/design-tokens`
 *   stories    `type: "story"` entries in `apps/storybook/storybook-static/index.json`
 *
 * It exits 1 if ANY count is lower than its baseline, naming which one. A suite that has failing
 * tests also fails the guard: a red test is not "kept".
 *
 *   node tools/scripts/count-guard.mjs              # measure and compare
 *   node tools/scripts/count-guard.mjs --update     # after a green batch: raise the baseline
 *
 * `--update` only ever raises a number; if any count is lower it refuses and exits 1, so a
 * baseline can never be lowered through this script. Lowering one needs a `Ruling:` in the ledger
 * and a hand edit of the JSON in review.
 *
 * Measuring runs Vitest (a few minutes: the storybook suite is a real browser). To skip that — the
 * unit test does — pass numbers you already have:
 *
 *   --counts <file.json>   { "ui": N, "storybook": N, "tokens": N, "stories": N }
 *   --baseline <file.json> compare against another baseline (default: the checked-in one)
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const KEYS = ["ui", "storybook", "tokens", "stories"];

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const DEFAULT_BASELINE = join(
  root,
  "docs/superpowers/specs/2026-10-04-design-parity/baseline-counts.json"
);
const INDEX_JSON = join(root, "apps/storybook/storybook-static/index.json");
const SUITES = { storybook: "apps/storybook", tokens: "packages/design-tokens", ui: "packages/ui" };

/** Passed-test count of a Vitest `--reporter=json` report; `failed` is reported alongside. */
export function readVitestReport(report) {
  const passed = report?.numPassedTests;
  if (!Number.isInteger(passed)) {
    throw new Error("not a Vitest JSON report: numPassedTests is missing");
  }
  return { failed: report.numFailedTests ?? 0, passed };
}

/** Number of `type: "story"` entries in a Storybook `index.json`. */
export function countStories(index) {
  const entries = Object.values(index?.entries ?? {});
  return entries.filter((entry) => entry.type === "story").length;
}

/** Keys whose measured count is below the baseline: `[{ key, baseline, actual }]`. */
export function findRegressions(counts, baseline) {
  return KEYS.filter((key) => (counts[key] ?? 0) < baseline[key]).map((key) => ({
    actual: counts[key] ?? 0,
    baseline: baseline[key],
    key,
  }));
}

/** A new baseline that keeps every number at least as high as before. */
export function raiseBaseline(counts, baseline) {
  return Object.fromEntries(KEYS.map((key) => [key, Math.max(baseline[key], counts[key] ?? 0)]));
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function runSuite(key) {
  const dir = mkdtempSync(join(tmpdir(), `count-guard-${key}-`));
  const outputFile = join(dir, "report.json");
  try {
    console.log(`count-guard: running the ${key} suite (${SUITES[key]}) …`);
    // Vitest exits non-zero on test failures but still writes the report; read it either way.
    spawnSync("pnpm", ["exec", "vitest", "run", "--reporter=json", `--outputFile=${outputFile}`], {
      cwd: join(root, SUITES[key]),
      stdio: ["ignore", "ignore", "inherit"],
    });
    if (!existsSync(outputFile)) throw new Error(`the ${key} suite wrote no JSON report`);
    return readVitestReport(readJson(outputFile));
  } finally {
    rmSync(dir, { force: true, recursive: true });
  }
}

function measure() {
  const counts = {};
  const failures = [];
  for (const key of ["ui", "storybook", "tokens"]) {
    const { failed, passed } = runSuite(key);
    counts[key] = passed;
    if (failed > 0) failures.push(`${key}: ${failed} failing test(s)`);
  }
  if (!existsSync(INDEX_JSON)) {
    throw new Error("storybook-static/index.json is missing — run `pnpm nx run storybook:build`");
  }
  counts.stories = countStories(readJson(INDEX_JSON));
  return { counts, failures };
}

function argValue(args, name) {
  const at = args.indexOf(name);
  return at === -1 ? undefined : args[at + 1];
}

export function main(args) {
  const baselinePath = argValue(args, "--baseline") ?? DEFAULT_BASELINE;
  const baseline = readJson(baselinePath);
  const countsPath = argValue(args, "--counts");

  let counts;
  let failures = [];
  if (countsPath) counts = readJson(countsPath);
  else ({ counts, failures } = measure());

  const regressions = findRegressions(counts, baseline);
  for (const key of KEYS) {
    const mark = regressions.some((r) => r.key === key) ? "LOWER" : "ok";
    console.log(`count-guard: ${key.padEnd(9)} ${counts[key]} (baseline ${baseline[key]}) ${mark}`);
  }

  for (const { actual, baseline: floor, key } of regressions) {
    console.error(`count-guard: ${key} dropped from ${floor} to ${actual}`);
  }
  for (const failure of failures) console.error(`count-guard: ${failure}`);
  if (regressions.length > 0 || failures.length > 0) return 1;

  if (args.includes("--update")) {
    writeFileSync(baselinePath, `${JSON.stringify(raiseBaseline(counts, baseline), null, 2)}\n`);
    console.log(`count-guard: baseline raised in ${baselinePath}`);
  }
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (error) {
    console.error(`count-guard: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(2);
  }
}
