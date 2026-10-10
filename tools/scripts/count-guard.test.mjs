import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { countStories, findRegressions, raiseBaseline, readVitestReport } from "./count-guard.mjs";

const here = fileURLToPath(new URL(".", import.meta.url));
const guard = join(here, "count-guard.mjs");
const fixture = (name) => join(here, "fixtures", name);

const scratch = mkdtempSync(join(tmpdir(), "count-guard-test-"));
after(() => rmSync(scratch, { force: true, recursive: true }));

/** Runs the CLI against a fixture counts file and a (copied, so `--update` is safe) baseline. */
function run(countsFixture, ...extra) {
  const baseline = join(scratch, `baseline-${Math.random().toString(36).slice(2)}.json`);
  copyFileSync(fixture("baseline.json"), baseline);
  const result = spawnSync(
    process.execPath,
    [guard, "--baseline", baseline, "--counts", fixture(countsFixture), ...extra],
    { encoding: "utf8" }
  );
  return { ...result, baseline };
}

describe("count-guard CLI", () => {
  it("exits 1 and names the count that dropped", () => {
    const result = run("counts-lower.json");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /storybook dropped from 50 to 49/);
    assert.doesNotMatch(result.stderr, /ui dropped/);
  });

  it("exits 0 when every count is equal or higher", () => {
    const result = run("counts-higher.json");
    assert.equal(result.status, 0);
  });

  it("raises the baseline with --update, never lowers it", () => {
    const result = run("counts-higher.json", "--update");
    assert.equal(result.status, 0);
    assert.deepEqual(JSON.parse(readFileSync(result.baseline, "utf8")), {
      stories: 31,
      storybook: 55,
      tokens: 20,
      ui: 100,
    });
  });

  it("refuses --update when a count dropped and leaves the baseline alone", () => {
    const result = run("counts-lower.json", "--update");
    assert.equal(result.status, 1);
    assert.deepEqual(
      JSON.parse(readFileSync(result.baseline, "utf8")),
      JSON.parse(readFileSync(fixture("baseline.json"), "utf8"))
    );
  });
});

describe("count-guard helpers", () => {
  const baseline = { stories: 30, storybook: 50, tokens: 20, ui: 100 };

  it("finds every lowered key", () => {
    const lowered = findRegressions({ stories: 29, storybook: 50, tokens: 19, ui: 100 }, baseline);
    assert.deepEqual(
      lowered.map((entry) => entry.key),
      ["tokens", "stories"]
    );
  });

  it("treats a missing count as zero", () => {
    assert.equal(findRegressions({}, baseline).length, 4);
  });

  it("raiseBaseline keeps the maximum of each number", () => {
    assert.deepEqual(raiseBaseline({ stories: 40, storybook: 10, tokens: 20, ui: 101 }, baseline), {
      stories: 40,
      storybook: 50,
      tokens: 20,
      ui: 101,
    });
  });

  it("reads passed and failed tests from a Vitest JSON report", () => {
    assert.deepEqual(readVitestReport({ numFailedTests: 2, numPassedTests: 7 }), {
      failed: 2,
      passed: 7,
    });
    assert.throws(() => readVitestReport({}), /not a Vitest JSON report/);
  });

  it("counts only story entries in a Storybook index", () => {
    const entries = {
      a: { type: "story" },
      b: { type: "docs" },
      c: { type: "story" },
    };
    assert.equal(countStories({ entries }), 2);
  });
});
