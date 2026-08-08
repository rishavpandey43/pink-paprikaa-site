import { render, screen } from "@testing-library/react";
import { User } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Avatar } from "./avatar";

/**
 * jsdom never fetches, so Radix's preload probe reports the image as still loading and the
 * fallback stays up. Stubbing the two properties it reads is what "the photo arrived" looks like.
 */
function stubLoadedImages(): void {
  vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
  vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(240);
}

describe("Avatar", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("falls back to two initials when there is no photo", () => {
    render(<Avatar name="Aditi Rao" />);
    expect(screen.getByText("AR")).toBeInTheDocument();
  });

  it("uses a single initial for a single-word name", () => {
    render(<Avatar name="Kabir" />);
    expect(screen.getByText("K")).toBeInTheDocument();
  });

  it("stops at two initials for a three-word name", () => {
    render(<Avatar name="Meera S Iyer" />);
    expect(screen.getByText("MS")).toBeInTheDocument();
  });

  it("shows the photo, named by the guest, once it has loaded", async () => {
    stubLoadedImages();
    render(<Avatar name="Aditi Rao" src="/images/guests/aditi-rao.jpg" />);

    expect(await screen.findByRole("img", { name: "Aditi Rao" })).toHaveAttribute(
      "src",
      "/images/guests/aditi-rao.jpg"
    );
  });

  it("keeps the initials up while the photo has not loaded", () => {
    render(<Avatar name="Aditi Rao" src="/images/guests/aditi-rao.jpg" />);

    expect(screen.getByText("AR")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders a glyph instead of initials when one is given", () => {
    const { container } = render(<Avatar icon={User} name="Aditi Rao" />);

    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.queryByText("AR")).not.toBeInTheDocument();
  });

  it.each([
    ["xs", "size-6"],
    ["sm", "size-8"],
    ["md", "size-10"],
    ["lg", "size-14"],
    ["xl", "size-20"],
  ] as const)("renders the %s size at its fixed diameter", (size, expected) => {
    const { container } = render(<Avatar name="Aditi Rao" size={size} />);
    expect(container.firstElementChild).toHaveClass(expected);
  });

  it("draws the signed-in halo as an offset ring, not a border", () => {
    const { container } = render(<Avatar hasRing name="Aditi Rao" />);
    const node = container.firstElementChild;

    expect(node).toHaveClass("ring-2");
    expect(node).toHaveClass("ring-offset-2");
    expect(node?.className).not.toMatch(/border-/);
  });

  it("stays circular by default", () => {
    const { container } = render(<Avatar name="Aditi Rao" />);
    expect(container.firstElementChild).toHaveClass("rounded-6");
  });

  it("merges a caller className", () => {
    const { container } = render(<Avatar className="rounded-1" name="Aditi Rao" />);
    const node = container.firstElementChild;

    expect(node).toHaveClass("rounded-1");
    expect(node).not.toHaveClass("rounded-6");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Avatar name="Aditi Rao" />
        <Avatar hasRing name="Kabir Sethi" size="lg" />
        <Avatar icon={User} size="sm" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
