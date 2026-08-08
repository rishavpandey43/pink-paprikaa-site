import { render } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { PostFrame } from "./post-frame";

describe("PostFrame", () => {
  it("pins the 1080 square feed canvas by default", () => {
    const { container } = render(<PostFrame>Chai first, decisions later.</PostFrame>);
    const root = container.firstElementChild;
    const canvas = root?.firstElementChild;

    expect(root).toHaveClass("w-[calc(var(--canvas-post-w)*var(--pp-canvas-scale))]");
    expect(root).toHaveClass("h-[calc(var(--canvas-post-h)*var(--pp-canvas-scale))]");
    expect(canvas).toHaveClass("w-(--canvas-post-w)", "h-(--canvas-post-h)");
  });

  it.each([
    ["post", "--canvas-post"],
    ["portrait", "--canvas-portrait"],
    ["story", "--canvas-story"],
    ["landscape", "--canvas-landscape"],
    ["wide", "--canvas-wide"],
    ["mpu", "--canvas-mpu"],
    ["leaderboard", "--canvas-leaderboard"],
  ] as const)("pins the %s canvas to its token size", (variant, token) => {
    const { container } = render(<PostFrame variant={variant}>Pink Paprikaa</PostFrame>);
    const canvas = container.firstElementChild?.firstElementChild;

    expect(canvas).toHaveClass(`w-(${token}-w)`, `h-(${token}-h)`);
  });

  it("carries the display scale as a custom property, not a hard-coded transform", () => {
    const { container } = render(<PostFrame scale={0.2}>Pink Paprikaa</PostFrame>);
    const root = container.firstElementChild;

    expect(root).toHaveStyle({ "--pp-canvas-scale": "0.2" });
    expect(root?.firstElementChild).toHaveClass("scale-(--pp-canvas-scale)", "origin-top-left");
  });

  it("renders at full canvas size when no scale is given", () => {
    const { container } = render(<PostFrame>Pink Paprikaa</PostFrame>);

    expect(container.firstElementChild).toHaveStyle({ "--pp-canvas-scale": "1" });
  });

  it.each([
    ["default", "p-(--canvas-pad)"],
    ["tight", "p-(--canvas-pad-tight)"],
    ["none", "p-0"],
  ] as const)("applies the %s canvas padding", (padding, expected) => {
    const { container } = render(
      <PostFrame padding={padding}>Chai first, decisions later.</PostFrame>
    );
    expect(container.firstElementChild?.firstElementChild).toHaveClass(expected);
  });

  it.each(["mpu", "leaderboard"] as const)(
    "drops the 72px canvas pad on the %s display unit",
    (variant) => {
      const { container } = render(<PostFrame variant={variant}>Pink Paprikaa</PostFrame>);
      const canvas = container.firstElementChild?.firstElementChild;

      expect(canvas).toHaveClass("p-5");
      expect(canvas).not.toHaveClass("p-(--canvas-pad)");
    }
  );

  it("draws the story chrome guides only on the story canvas", () => {
    const { container, rerender } = render(
      <PostFrame variant="story" hasSafeArea>
        Half off, on us.
      </PostFrame>
    );
    const canvas = container.firstElementChild?.firstElementChild;

    expect(canvas?.querySelectorAll("span")).toHaveLength(2);
    expect(canvas?.firstElementChild).toHaveClass("h-(--canvas-story-safe-top)");

    rerender(
      <PostFrame variant="post" hasSafeArea>
        Half off, on us.
      </PostFrame>
    );
    expect(container.firstElementChild?.firstElementChild?.querySelectorAll("span")).toHaveLength(
      0
    );
  });

  it("renders its children inside the true-pixel canvas", () => {
    const { container } = render(
      <PostFrame variant="landscape" scale={0.3}>
        <p>Six outlets. One grinder.</p>
      </PostFrame>
    );
    const canvas = container.firstElementChild?.firstElementChild;

    expect(canvas?.textContent).toBe("Six outlets. One grinder.");
  });

  it("merges a caller className onto the frame", () => {
    const { container } = render(
      <PostFrame className="shrink bg-surface-brand">Pink Paprikaa</PostFrame>
    );
    const root = container.firstElementChild;

    expect(root).toHaveClass("bg-surface-brand", "shrink");
    expect(root).not.toHaveClass("shrink-0");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <PostFrame variant="story" hasSafeArea scale={0.2}>
        <p>Half off, on us.</p>
      </PostFrame>
    );
    await expectNoA11yViolations(container);
  });
});
