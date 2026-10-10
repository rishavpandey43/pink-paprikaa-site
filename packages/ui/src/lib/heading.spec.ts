import { headingTag } from "./heading";

describe("headingTag", () => {
  it.each([
    [1, "h1"],
    [2, "h2"],
    [3, "h3"],
    [4, "h4"],
    [5, "h5"],
    [6, "h6"],
  ] as const)("maps level %i to <%s>", (level, tag) => {
    expect(headingTag(level)).toBe(tag);
  });
});
