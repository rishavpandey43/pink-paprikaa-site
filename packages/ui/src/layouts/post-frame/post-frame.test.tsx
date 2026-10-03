import { act, render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { PostFrame } from "./post-frame";

function frameOf(container: HTMLElement): HTMLElement {
  const frame = container.firstElementChild;
  if (!(frame instanceof HTMLElement)) throw new Error("PostFrame rendered nothing");
  return frame;
}

/** The true-pixel canvas is the element that carries the board's surface. */
function canvasOf(container: HTMLElement): HTMLElement {
  const canvas = container.querySelector<HTMLElement>("[data-surface]");
  if (canvas === null) throw new Error("PostFrame rendered no canvas");
  return canvas;
}

describe("PostFrame", () => {
  it("reserves the scaled box and scales the true-pixel canvas into it", () => {
    const { container } = render(
      <PostFrame format="post" scale={0.25}>
        Board
      </PostFrame>
    );
    const canvas = canvasOf(container);
    expect(frameOf(container)).toHaveStyle({ width: "270px", height: "270px" });
    expect(canvas).toHaveStyle({ width: "1080px", height: "1080px" });
    expect(canvas.parentElement).toHaveStyle({ transform: "scale(0.25)" });
    expect(canvas.parentElement).toHaveClass("origin-top-left");
  });

  it("shows the canvas at true size when no scale is given", () => {
    const { container } = render(<PostFrame format="portrait">Board</PostFrame>);
    expect(frameOf(container)).toHaveStyle({ width: "1080px", height: "1350px" });
  });

  // Review Focus 5, pure half — the rendered half is the FitsItsParentAt360 story.
  it("clips the canvas to the reserved box and never shrinks it", () => {
    const { container } = render(
      <PostFrame format="post" scale={0.25}>
        Board
      </PostFrame>
    );
    expect(frameOf(container)).toHaveClass("relative", "shrink-0", "overflow-hidden");
  });

  it.each([
    ["brand", "bg-surface-brand", "brand"],
    ["ink", "bg-surface-inverse", "ink"],
    ["soft", "bg-surface-brand-soft", "soft"],
    ["page", "bg-surface-page", "light"],
    ["alt", "bg-surface-page-alt", "light"],
  ] as const)(
    "surface=%s paints the board %s and sets data-surface=%s",
    (surfaceProp, background, surface) => {
      const { container } = render(<PostFrame format="post" surface={surfaceProp} />);
      const canvas = canvasOf(container);
      expect(canvas).toHaveAttribute("data-surface", surface);
      expect(canvas).toHaveClass(background);
    }
  );

  it("is a light board by default", () => {
    const { container } = render(<PostFrame format="post" />);
    expect(canvasOf(container)).toHaveAttribute("data-surface", "light");
  });

  it.each([
    ["post", "p-canvas-pad"],
    ["portrait", "p-canvas-pad"],
    ["story", "p-canvas-pad"],
    ["wide", "p-canvas-pad"],
    ["landscape", "p-canvas-pad-tight"],
    ["mpu", "p-5"],
    ["leaderboard", "p-5"],
  ] as const)("pads %s with its safe margin (%s) by default", (format, pad) => {
    const { container } = render(<PostFrame format={format} />);
    expect(canvasOf(container)).toHaveClass(pad);
  });

  it.each([
    ["tight", "p-canvas-pad-tight"],
    ["none", "p-0"],
  ] as const)("padding=%s sets %s on any format", (padding, pad) => {
    const { container } = render(<PostFrame format="post" padding={padding} />);
    expect(canvasOf(container)).toHaveClass(pad);
  });

  it("draws the story chrome guides, hidden from assistive tech", () => {
    const { container } = render(<PostFrame format="story" hasSafeArea surface="brand" />);
    const guides = [...canvasOf(container).querySelectorAll("[aria-hidden='true']")];
    expect(guides).toHaveLength(2);
    expect(guides[0]).toHaveClass("top-0", "h-story-safe-top");
    expect(guides[1]).toHaveClass("bottom-0", "h-story-safe-bottom");
  });

  it("draws no guides outside the story format", () => {
    const { container } = render(<PostFrame format="post" hasSafeArea />);
    expect(canvasOf(container).querySelectorAll("[aria-hidden='true']")).toHaveLength(0);
  });

  it("renders its children inside the true-pixel canvas", () => {
    const { container } = render(
      <PostFrame format="landscape" scale={0.3}>
        <p>One kitchen. One grinder.</p>
      </PostFrame>
    );
    expect(canvasOf(container)).toContainElement(screen.getByText("One kitchen. One grinder."));
  });

  it("merges a consumer className onto the frame and keeps its style, but not over the box", () => {
    const { container } = render(
      <PostFrame format="post" scale={0.25} className="shrink" style={{ marginTop: 8 }} />
    );
    const frame = frameOf(container);
    expect(frame).toHaveClass("shrink");
    expect(frame).not.toHaveClass("shrink-0");
    expect(frame).toHaveStyle({ marginTop: "8px", width: "270px" });
  });

  describe("isFit", () => {
    let frameWidth = 0;
    let report: () => void = () => undefined;

    beforeEach(() => {
      vi.spyOn(Element.prototype, "clientWidth", "get").mockImplementation(() => frameWidth);
      vi.stubGlobal(
        "ResizeObserver",
        class {
          constructor(callback: () => void) {
            report = callback;
          }
          // The real observer reports the initial size as soon as it starts observing.
          observe = vi.fn(() => {
            report();
          });
          unobserve = vi.fn();
          disconnect = vi.fn();
        }
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    it("fills the parent's width in a box of the canvas's aspect ratio, capped at true size", () => {
      frameWidth = 540;
      const { container } = render(
        <PostFrame format="portrait" isFit>
          Board
        </PostFrame>
      );
      const frame = frameOf(container);
      expect(frame).toHaveClass("w-full");
      expect(frame).toHaveStyle({ maxWidth: "1080px", aspectRatio: "1080 / 1350" });
    });

    it("scales the canvas to the frame's width and re-fits when the frame resizes", () => {
      frameWidth = 540;
      const { container } = render(
        <PostFrame format="post" isFit>
          Board
        </PostFrame>
      );
      const scaler = canvasOf(container).parentElement;
      expect(scaler).toHaveStyle({ transform: "scale(0.5)" });
      expect(scaler).not.toHaveClass("invisible");
      frameWidth = 270;
      act(() => {
        report();
      });
      expect(scaler).toHaveStyle({ transform: "scale(0.25)" });
    });

    it("never scales a canvas above its true size", () => {
      frameWidth = 2000;
      const { container } = render(<PostFrame format="post" isFit />);
      expect(canvasOf(container).parentElement).toHaveStyle({ transform: "scale(1)" });
    });

    it("keeps its last scale while the frame measures 0 wide (a hidden tab or collapsed panel)", () => {
      frameWidth = 0;
      const { container } = render(<PostFrame format="post" isFit />);
      const scaler = canvasOf(container).parentElement;
      expect(scaler).toHaveClass("invisible");
      frameWidth = 540;
      act(() => {
        report();
      });
      frameWidth = 0;
      act(() => {
        report();
      });
      expect(scaler).toHaveStyle({ transform: "scale(0.5)" });
    });

    it("stays invisible until it has measured", () => {
      vi.stubGlobal(
        "ResizeObserver",
        class {
          observe = vi.fn();
          unobserve = vi.fn();
          disconnect = vi.fn();
        }
      );
      const { container } = render(<PostFrame format="post" isFit />);
      expect(canvasOf(container).parentElement).toHaveClass("invisible");
    });
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <PostFrame format="story" scale={0.25} surface="brand" hasSafeArea>
        <h2>Half off, on us.</h2>
      </PostFrame>
    );
    await expectNoA11yViolations(container);
    expect(screen.getByRole("heading", { name: "Half off, on us." })).toBeInTheDocument();
  });

  it("takes sx on its root", () => {
    render(
      <PostFrame format="post" data-testid="root" sx={{ mt: 6, px: { md: 4 } }}>
        x
      </PostFrame>
    );
    expect(screen.getByTestId("root")).toHaveClass("mt-6", "md:px-4");
  });
});
