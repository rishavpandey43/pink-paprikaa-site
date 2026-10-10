import { SURFACE_BG, SURFACE_DATA } from "./common-props";

describe("surface maps", () => {
  it("set data-surface the way Section always has", () => {
    expect(SURFACE_DATA).toEqual({
      page: "light",
      alt: "light",
      sunken: "light",
      soft: "soft",
      brand: "brand",
      ink: "ink",
    });
  });
  it("paint each ground with its surface token", () => {
    expect(SURFACE_BG).toEqual({
      page: "bg-surface-page",
      alt: "bg-surface-page-alt",
      sunken: "bg-surface-sunken",
      soft: "bg-surface-brand-soft",
      brand: "bg-surface-brand",
      ink: "bg-surface-inverse",
    });
  });
});
