import { ringClippers } from "./story-ring";

function control(
  outline: Partial<Pick<CSSStyleDeclaration, "outlineOffset" | "outlineStyle" | "outlineWidth">>
) {
  const button = document.createElement("button");
  Object.assign(button.style, outline);
  document.body.append(button);
  return button;
}

describe("ringClippers", () => {
  it("throws when the element draws no outline, so a play cannot pass without a ring to measure", () => {
    expect(() => ringClippers(control({}))).toThrow(/draws no focus outline/);
  });

  it("throws on an outline styled none, whatever its width", () => {
    expect(() =>
      ringClippers(control({ outlineStyle: "none", outlineWidth: "2px", outlineOffset: "2px" }))
    ).toThrow(/draws no focus outline/);
  });

  it("throws on a zero-width outline", () => {
    expect(() =>
      ringClippers(control({ outlineStyle: "solid", outlineWidth: "0px", outlineOffset: "2px" }))
    ).toThrow(/draws no focus outline/);
  });

  it("measures an inset ring, whose reach is negative", () => {
    expect(
      ringClippers(control({ outlineStyle: "solid", outlineWidth: "2px", outlineOffset: "-4px" }))
    ).toEqual([]);
  });
});
