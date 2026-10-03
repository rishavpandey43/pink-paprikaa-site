// packages/ui/src/lib/sx.spec.ts
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { type Sx, SX_SAFELIST, sxClass, withSx } from "./sx";

describe("sxClass", () => {
  it("returns an empty string for no sx", () => {
    expect(sxClass(undefined)).toBe("");
    expect(sxClass({})).toBe("");
  });

  it.each([
    [{ m: 4 }, "m-4"],
    [{ mt: 0.5 }, "mt-0.5"],
    [{ mx: "auto" }, "mx-auto"],
    [{ ms: 2, me: 3 }, "ms-2 me-3"],
    [{ p: 6, px: 8, py: 2 }, "p-6 px-8 py-2"],
    [{ pt: 1, pb: 1.5, ps: 0, pe: 32 }, "pt-1 pb-1.5 ps-0 pe-32"],
    [{ gap: 4, gapX: 2, gapY: 6 }, "gap-4 gap-x-2 gap-y-6"],
    [{ display: "none" }, "hidden"],
    [{ display: "inline-flex" }, "inline-flex"],
    [{ textAlign: "center" }, "text-center"],
    [{ w: "full" }, "w-full"],
    [{ h: "fit" }, "h-fit"],
    [{ minW: "0" }, "min-w-0"],
    [{ maxW: "none" }, "max-w-none"],
    [{ grow: true, shrink: false }, "grow shrink-0"],
    [{ alignSelf: "baseline" }, "self-baseline"],
    [{ position: "sticky" }, "sticky"],
    [{ overflow: "clip" }, "overflow-clip"],
    [{ radius: "pill" }, "rounded-pill"],
    [{ shadow: 0 }, "shadow-none"],
    [{ shadow: 3 }, "shadow-3"],
    [{ border: true }, "border-default border-border-default"],
    [{ bg: "soft" }, "bg-surface-brand-soft"],
    [{ color: "muted" }, "text-text-muted"],
  ] satisfies [Sx, string][])("%o → %s", (sx, expected) => {
    expect(sxClass(sx)).toBe(expected);
  });

  it("prefixes responsive values mobile-first and skips undefined breakpoints", () => {
    expect(sxClass({ mt: { base: 2, md: 6, lg: undefined, xl: 8 } })).toBe("mt-2 md:mt-6 xl:mt-8");
    expect(sxClass({ display: { base: "none", lg: "flex" } })).toBe("hidden lg:flex");
    // Key order inside sxClass: spacing keys, then display, textAlign, w, then the static keys.
    expect(sxClass({ w: { sm: "full" }, textAlign: { md: "end" } })).toBe("md:text-end sm:w-full");
  });

  it("rejects dark grounds and free values at the type level", () => {
    // @ts-expect-error — brand/ink grounds go through the `surface` prop (data-surface), never sx.bg
    sxClass({ bg: "brand" });
    // @ts-expect-error — only SpaceStep values
    sxClass({ mt: 13 });
    // @ts-expect-error — no raw lengths
    sxClass({ p: "12px" });
    // @ts-expect-error — no unknown keys
    sxClass({ fontSize: 12 });
  });
});

describe("withSx", () => {
  it("puts sx before className so className still wins in tailwind-merge", () => {
    expect(withSx({ mt: 4 }, "mt-2 text-center")).toBe("mt-4 mt-2 text-center");
  });
  it("returns className untouched without sx, and sx alone without className", () => {
    expect(withSx(undefined, "x")).toBe("x");
    expect(withSx({ p: 2 }, undefined)).toBe("p-2");
    expect(withSx(undefined, undefined)).toBeUndefined();
  });
});

describe("SX_SAFELIST", () => {
  it("is declared verbatim in styles.css, so every runtime class has CSS", () => {
    // join(import.meta.dirname, …) is the repo convention (brand-artwork.spec.ts)
    const css = readFileSync(join(import.meta.dirname, "../styles.css"), "utf8");
    for (const line of SX_SAFELIST) expect(css).toContain(`@source inline("${line}");`);
  });
});
