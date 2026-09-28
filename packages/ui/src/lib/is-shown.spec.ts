import { isShown } from "./is-shown";

describe("isShown", () => {
  it.each([undefined, null, false, ""])("hides %j", (node) => {
    expect(isShown(node)).toBe(false);
  });

  it.each([0, "Sector 57", true])("shows %j", (node) => {
    expect(isShown(node)).toBe(true);
  });
});
