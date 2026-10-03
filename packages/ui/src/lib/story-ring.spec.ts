import { ringClippers } from "./story-ring";

type RingStyle = Partial<
  Pick<
    CSSStyleDeclaration,
    "boxShadow" | "outlineOffset" | "outlineStyle" | "outlineWidth" | "position"
  >
>;

/** A control `inset` px inside a 100px `overflow: hidden` frame (jsdom has no layout, so both are stubbed). */
function framed(ring: RingStyle, inset = 8) {
  const frame = document.createElement("div");
  frame.style.overflow = "hidden";
  Object.defineProperties(frame, { clientWidth: { value: 100 }, clientHeight: { value: 100 } });
  frame.getBoundingClientRect = () => rect(0, 100);
  const control = document.createElement("button");
  Object.assign(control.style, ring);
  control.getBoundingClientRect = () => rect(inset, 100 - inset);
  frame.append(control);
  return { frame, control };
}

function rect(start: number, end: number) {
  const size = end - start;
  return { left: start, top: start, right: end, bottom: end, width: size, height: size } as DOMRect;
}

const OUTLINE = { outlineStyle: "solid", outlineWidth: "2px", outlineOffset: "2px" };

describe("ringClippers", () => {
  it("throws when the element draws no ring, so a play cannot pass with nothing measured", () => {
    expect(() => ringClippers(framed({}).control)).toThrow(/draws no focus ring/);
  });

  it("throws on an outline styled none, whatever its width", () => {
    expect(() => ringClippers(framed({ ...OUTLINE, outlineStyle: "none" }).control)).toThrow(
      /draws no focus ring/
    );
  });

  it("throws on a zero-width outline", () => {
    expect(() => ringClippers(framed({ ...OUTLINE, outlineWidth: "0px" }).control)).toThrow(
      /draws no focus ring/
    );
  });

  it("throws on an inset box-shadow, which draws nothing outside the box", () => {
    expect(() => ringClippers(framed({ boxShadow: "inset 0 0 0 3px red" }).control)).toThrow(
      /draws no focus ring/
    );
  });

  it("names the frame that cuts an outline, and none when the outline fits", () => {
    const tight = framed(OUTLINE, 2);
    expect(ringClippers(tight.control)).toEqual([tight.frame]);
    expect(ringClippers(framed(OUTLINE, 5).control)).toEqual([]);
  });

  it("measures an inset outline, whose reach is negative", () => {
    expect(ringClippers(framed({ ...OUTLINE, outlineOffset: "-4px" }, 0).control)).toEqual([]);
  });

  it("skips a frame a fixed control escapes", () => {
    expect(ringClippers(framed({ ...OUTLINE, position: "fixed" }, 2).control)).toEqual([]);
  });

  it("skips a static frame an absolute control escapes, but not a positioned one", () => {
    expect(ringClippers(framed({ ...OUTLINE, position: "absolute" }, 2).control)).toEqual([]);
    const positioned = framed({ ...OUTLINE, position: "absolute" }, 2);
    positioned.frame.style.position = "relative";
    expect(ringClippers(positioned.control)).toEqual([positioned.frame]);
  });

  it("measures a box-shadow ring (a field's) by its spread when there is no outline", () => {
    const tight = framed({ boxShadow: "0 0 0 3px red" }, 1);
    expect(ringClippers(tight.control)).toEqual([tight.frame]);
    expect(
      ringClippers(framed({ boxShadow: "rgb(255, 185, 206) 0px 0px 0px 3px" }, 4).control)
    ).toEqual([]);
  });

  it("reads no lengths from a colour function's channels (Chromium keeps oklch() computed)", () => {
    const tight = framed({ boxShadow: "oklch(0.75 0.12 350) 0px 0px 0px 3px" }, 1);
    expect(ringClippers(tight.control)).toEqual([tight.frame]);
    expect(
      ringClippers(framed({ boxShadow: "color(srgb 9 0.7 0.8) 0px 0px 0px 3px" }, 4).control)
    ).toEqual([]);
  });
});
