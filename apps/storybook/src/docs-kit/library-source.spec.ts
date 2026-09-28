import { describe, expect, it } from "vitest";

import { LIBRARY_SOURCE } from "./library-source";

describe("LIBRARY_SOURCE", () => {
  // lib/story-surfaces.tsx and lib/story-paint.ts open with this line; their classes are story
  // chrome, never library uses.
  it("leaves out the story helpers in packages/ui/src/lib", () => {
    expect(LIBRARY_SOURCE).not.toContain("Stories only — never exported from the barrel");
  });
});
