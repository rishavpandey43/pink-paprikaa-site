import { render, screen } from "@testing-library/react";
import { User } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Avatar } from "./avatar";

describe("Avatar", () => {
  it("shows two initials on pink-100 and is an image named by the person", () => {
    render(<Avatar name="Aditi Rao" />);
    const avatar = screen.getByRole("img", { name: "Aditi Rao" });
    expect(avatar).toHaveTextContent("AR");
    expect(avatar).toHaveAttribute("title", "Aditi Rao");
    expect(avatar).toHaveClass(
      "bg-pink-100",
      "text-pink-700",
      "font-display",
      "rounded-pill",
      "overflow-hidden",
      "size-avatar-md",
      "text-avatar-md"
    );
  });

  it.each([
    ["Kabir", "K"],
    ["Meera S Iyer", "MS"],
    ["  aditi   rao  ", "AR"],
    ["प्रिया शर्मा", "पश"],
  ] as const)("derives the initials of %j as %s", (name, initials) => {
    render(<Avatar name={name} />);
    expect(screen.getByRole("img")).toHaveTextContent(initials);
  });

  it("layers a photo over the initials, which stay as the fallback while it loads or if it fails", () => {
    render(<Avatar name="Aditi Rao" src="/guests/aditi.jpg" />);
    const avatar = screen.getByRole("img", { name: "Aditi Rao" });
    const photo = avatar.querySelector("img");
    expect(photo).toHaveAttribute("src", "/guests/aditi.jpg");
    expect(photo).toHaveAttribute("alt", "");
    expect(photo).toHaveClass("absolute", "inset-0", "size-full", "object-cover");
    expect(avatar).toHaveClass("relative");
    expect(avatar).toHaveTextContent("AR");
  });

  it("draws the glyph instead of initials when both are given, still named by the person", () => {
    render(<Avatar name="Aditi Rao" icon={User} />);
    const avatar = screen.getByRole("img", { name: "Aditi Rao" });
    expect(avatar.querySelector("svg")).not.toBeNull();
    expect(avatar).not.toHaveTextContent("AR");
  });

  it("lets a consumer className replace its radius, and never selects its initials", () => {
    render(<Avatar name="Aditi Rao" className="rounded-md" />);
    const avatar = screen.getByRole("img");
    expect(avatar).toHaveClass("rounded-md", "select-none");
    expect(avatar).not.toHaveClass("rounded-pill");
  });

  it("draws a glyph at half its size in place of initials", () => {
    const { container } = render(<Avatar icon={User} size="lg" />);
    const glyph = container.firstElementChild?.firstElementChild;
    expect(glyph).toHaveClass("size-1/2");
    expect(glyph).not.toHaveClass("size-icon-lg");
    expect(glyph?.querySelector("svg")).toHaveAttribute("stroke-width", "1.75");
  });

  it("uses the heavy 2px stroke on the small sizes", () => {
    const { container } = render(<Avatar icon={User} size="xs" />);
    expect(container.querySelector("svg")).toHaveAttribute("stroke-width", "2");
  });

  it.each([
    ["xs", "size-avatar-xs", "text-avatar-xs"],
    ["sm", "size-avatar-sm", "text-avatar-sm"],
    ["md", "size-avatar-md", "text-avatar-md"],
    ["lg", "size-avatar-lg", "text-avatar-lg"],
    ["xl", "size-avatar-xl", "text-avatar-xl"],
  ] as const)("sizes %s with %s and %s", (size, box, type) => {
    render(<Avatar name="Aditi Rao" size={size} />);
    expect(screen.getByRole("img")).toHaveClass(box, type);
  });

  it("marks the signed-in guest with the pink ring", () => {
    render(<Avatar name="Aditi Rao" hasRing />);
    expect(screen.getByRole("img")).toHaveClass("shadow-avatar-ring");
  });

  it("is decorative when it has no name (Review Focus 2)", () => {
    const { container } = render(<Avatar icon={User} />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstElementChild).not.toHaveAttribute("role");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("treats a blank name as no name", () => {
    const { container } = render(<Avatar name="   " />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstElementChild).toBeEmptyDOMElement();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Avatar name="Aditi Rao" hasRing />
        <Avatar name="Kabir" src="/guests/kabir.jpg" />
        <Avatar icon={User} />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
