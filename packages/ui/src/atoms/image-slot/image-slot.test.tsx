import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ImageSlot } from "./image-slot";

describe("ImageSlot", () => {
  it("renders a labelled placeholder that names the crop, announced as an image", () => {
    render(<ImageSlot label="Hero 16:9 — warm, close-cropped" ratio="16:9" />);
    const slot = screen.getByRole("img", { name: "Hero 16:9 — warm, close-cropped" });
    expect(slot).toHaveTextContent("Hero 16:9 — warm, close-cropped");
    expect(slot.firstElementChild).toHaveClass(
      "font-display",
      "text-image-slot-label",
      "uppercase",
      "text-balance",
      "text-center"
    );
  });

  it("keeps its aspect box and full width with no photo (Review Focus 4)", () => {
    render(<ImageSlot label="Dish photo" ratio="16:9" />);
    const slot = screen.getByRole("img");
    expect(slot).toHaveClass("aspect-16-9", "w-full", "overflow-hidden");
    expect(slot.className.match(/(^|\s)aspect-/g)).toHaveLength(1);
  });

  it.each([
    ["square", "aspect-square"],
    ["4:3", "aspect-4-3"],
    ["3:4", "aspect-3-4"],
    ["4:5", "aspect-4-5"],
    ["16:9", "aspect-16-9"],
    ["16:10", "aspect-16-10"],
    ["wide", "aspect-wide"],
  ] as const)("ratio %s uses %s", (ratio, aspect) => {
    render(<ImageSlot label="Crop" ratio={ratio} />);
    expect(screen.getByRole("img")).toHaveClass(aspect);
  });

  it("defaults to a 4:3 soft slot with the md radius", () => {
    render(<ImageSlot label="Dish photo" />);
    expect(screen.getByRole("img")).toHaveClass("aspect-4-3", "bg-pink-100", "rounded-md");
  });

  it.each([
    ["soft", "bg-pink-100", "text-pink-700"],
    ["strong", "bg-pink-200", "text-pink-800"],
    ["ink", "bg-ink-200", "text-ink-600"],
  ] as const)("fill %s paints %s and labels in %s (AA, spec §5.3)", (fill, bg, label) => {
    render(<ImageSlot label="Kitchen" fill={fill} />);
    const slot = screen.getByRole("img");
    expect(slot).toHaveClass(bg);
    expect(slot.firstElementChild).toHaveClass(label);
  });

  it("sx lands on the placeholder and beats its own radius", () => {
    render(<ImageSlot label="Kitchen" sx={{ radius: "xl", mt: 4 }} />);
    expect(screen.getByRole("img")).toHaveClass("rounded-xl", "mt-4");
    expect(screen.getByRole("img")).not.toHaveClass("rounded-md");
  });

  it("sx lands on the root of a real image too", () => {
    const { container } = render(
      <ImageSlot src="/x.jpg" alt="Thali" width={4} height={3} sx={{ mt: 4 }} />
    );
    expect(container.firstElementChild).toHaveClass("mt-4");
  });

  it.each([
    ["none", "rounded-none"],
    ["md", "rounded-md"],
    ["lg", "rounded-lg"],
    ["xl", "rounded-xl"],
  ] as const)("radius %s uses %s", (radius, radiusClass) => {
    render(<ImageSlot label="Crop" radius={radius} />);
    expect(screen.getByRole("img")).toHaveClass(radiusClass);
  });

  it("fills its parent's height instead of an aspect ratio when isFill — one aspect class (Review Focus 4)", () => {
    render(<ImageSlot label="Full-bleed panel" isFill />);
    const slot = screen.getByRole("img");
    expect(slot).toHaveClass("h-full", "aspect-auto");
    expect(slot.className.match(/(^|\s)aspect-/g)).toHaveLength(1);
  });

  it("renders a real photo as a lazy, intrinsically sized img covering the box (Review Focus 4)", () => {
    render(
      <ImageSlot
        src="/photos/boxes-packed.avif"
        alt="Freshly packed Homely Meals box"
        width={1200}
        height={900}
      />
    );
    const img = screen.getByRole("img", { name: "Freshly packed Homely Meals box" });
    expect(img.tagName).toBe("IMG");
    expect(img).toHaveAttribute("width", "1200");
    expect(img).toHaveAttribute("height", "900");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
    expect(img).toHaveClass("size-full", "object-cover");
    expect(img.parentElement).toHaveClass("aspect-4-3");
    expect(img.parentElement).not.toHaveAttribute("role");
  });

  it("passes srcSet, sizes and an eager high priority through for the hero", () => {
    render(
      <ImageSlot
        src="/hero-1200.avif"
        srcSet="/hero-600.avif 600w, /hero-1200.avif 1200w"
        sizes="(min-width: 768px) 50vw, 100vw"
        alt="Classic thali"
        width={1200}
        height={1500}
        ratio="4:5"
        loading="eager"
        fetchPriority="high"
      />
    );
    const img = screen.getByRole("img", { name: "Classic thali" });
    expect(img).toHaveAttribute("srcset", "/hero-600.avif 600w, /hero-1200.avif 1200w");
    expect(img).toHaveAttribute("sizes", "(min-width: 768px) 50vw, 100vw");
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("fetchpriority", "high");
  });

  it("renders a <picture> from the image pipeline inside the same box", () => {
    render(
      <ImageSlot label="Thali 4:3" ratio="4:3">
        <picture>
          <source srcSet="/thali.avif" type="image/avif" />
          <img src="/thali.jpg" alt="Classic thali" width={800} height={600} />
        </picture>
      </ImageSlot>
    );
    const img = screen.getByRole("img", { name: "Classic thali" });
    expect(img.closest("picture")?.parentElement).toHaveClass("aspect-4-3");
    expect(screen.queryByRole("img", { name: "Thali 4:3" })).not.toBeInTheDocument();
  });

  it.each(["", "   "])("never renders an unnamed image for a blank label %j", (label) => {
    const { container } = render(<ImageSlot label={label} />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(container.firstElementChild).not.toHaveAttribute("aria-label");
  });

  it("does not compile a photo without alt, width and height", () => {
    // @ts-expect-error — a real image needs alt (a11y) and intrinsic size (no layout shift)
    render(<ImageSlot src="/photos/thali.jpg" />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("forwards native div props to the root, as a placeholder and as a photo (R35)", () => {
    render(
      <>
        <ImageSlot label="Dish photo" id="slot" data-testid="placeholder" />
        <ImageSlot
          src="/photos/thali.jpg"
          alt="Classic thali"
          width={800}
          height={600}
          id="photo"
          data-testid="photo"
        />
      </>
    );
    const placeholder = screen.getByTestId("placeholder");
    expect(placeholder).toBe(screen.getByRole("img", { name: "Dish photo" }));
    expect(placeholder).toHaveAttribute("id", "slot");
    const photo = screen.getByTestId("photo");
    expect(photo.tagName).toBe("DIV");
    expect(photo).toHaveAttribute("id", "photo");
    expect(photo.firstElementChild).toBe(screen.getByRole("img", { name: "Classic thali" }));
  });

  it("merges a consumer className", () => {
    render(<ImageSlot label="Dish photo" className="w-40" />);
    const slot = screen.getByRole("img");
    expect(slot).toHaveClass("w-40");
    expect(slot).not.toHaveClass("w-full");
  });

  it("has no accessibility violations as a placeholder and as a photo", async () => {
    const { container } = render(
      <>
        <ImageSlot label="Hero 4:5 — warm, close-cropped" ratio="4:5" />
        <ImageSlot src="/photos/thali.jpg" alt="Classic thali" width={800} height={600} />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
