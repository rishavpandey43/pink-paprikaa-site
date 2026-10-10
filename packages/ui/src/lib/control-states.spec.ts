import { controlStates } from "./control-states";

describe("controlStates", () => {
  it("exposes only the cursor/aria half of disabled — no fill class", () => {
    const classes = controlStates();
    expect(classes).toMatch(/disabled:cursor-not-allowed/);
    expect(classes).toMatch(/aria-disabled:pointer-events-none/);
    expect(classes.split(/\s+/).filter((name) => /(^|:)bg-/.test(name))).toEqual([]);
  });
});
