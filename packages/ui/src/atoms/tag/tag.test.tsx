import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Clock, Flame, Leaf } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Tag } from "./tag";

const noop = () => undefined;

describe("Tag", () => {
  it("is a static chip, not a button, when it has no onClick", () => {
    render(<Tag>Static, no onClick</Tag>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    const chip = screen.getByText("Static, no onClick").parentElement;
    expect(chip?.tagName).toBe("SPAN");
    expect(chip).not.toHaveAttribute("aria-pressed");
    expect(chip).not.toHaveAttribute("type");
  });

  it("is a toggle button that reports its pressed state when it has onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Tag onClick={onClick}>Sweets</Tag>);
    const tag = screen.getByRole("button", { name: "Sweets" });
    expect(tag).toHaveAttribute("type", "button");
    expect(tag).toHaveAttribute("aria-pressed", "false");
    await user.click(tag);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("toggles from the keyboard", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Tag onClick={onClick}>Sweets</Tag>);
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await user.keyboard(" ");
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("floods pink and reports pressed when selected", () => {
    render(
      <Tag isSelected onClick={noop}>
        All
      </Tag>
    );
    const tag = screen.getByRole("button", { name: "All" });
    expect(tag).toHaveAttribute("aria-pressed", "true");
    expect(tag).toHaveClass("bg-tag-selected", "border-tag-selected", "text-ink-000");
  });

  it("shows a static selected chip without claiming to be pressable", () => {
    render(<Tag isSelected>Hot</Tag>);
    const chip = screen.getByText("Hot").parentElement;
    expect(chip).toHaveClass("bg-tag-selected");
    expect(chip).not.toHaveAttribute("aria-pressed");
  });

  it("tints on hover only when it can be pressed and is not already selected", () => {
    render(
      <>
        <Tag onClick={noop}>All</Tag>
        <Tag onClick={noop} isSelected>
          Hot
        </Tag>
        <Tag>Static</Tag>
      </>
    );
    expect(screen.getByRole("button", { name: "All" })).toHaveClass(
      "hover:bg-pink-50",
      "cursor-pointer"
    );
    expect(screen.getByRole("button", { name: "Hot" })).not.toHaveClass("hover:bg-pink-50");
    expect(screen.getByText("Static").parentElement).not.toHaveClass("hover:bg-pink-50");
    expect(screen.getByText("Static").parentElement).not.toHaveClass("cursor-pointer");
  });

  it("presses with the brand scale and darkens a selected tag on hover, only when pressable (readme §3.8)", () => {
    render(
      <>
        <Tag onClick={noop} isSelected>
          Hot
        </Tag>
        <Tag isSelected>Static</Tag>
      </>
    );
    expect(screen.getByRole("button", { name: "Hot" })).toHaveClass(
      "active:press-scale",
      "hover:bg-tag-selected-hover",
      "hover:border-tag-selected-hover"
    );
    const chip = screen.getByText("Static").parentElement;
    expect(chip).not.toHaveClass("active:press-scale");
    expect(chip).not.toHaveClass("hover:bg-tag-selected-hover");
  });

  it("keeps its glyph decorative, so the label alone names it", () => {
    render(
      <Tag icon={Leaf} onClick={noop}>
        Jain
      </Tag>
    );
    const glyphs = screen.getByRole("button", { name: "Jain" }).querySelectorAll("svg");
    expect(glyphs).toHaveLength(1);
    expect(glyphs[0]).toHaveAttribute("aria-hidden", "true");
  });

  it("lets a consumer className replace its radius", () => {
    render(<Tag className="rounded-md">Sweets</Tag>);
    const chip = screen.getByText("Sweets").parentElement;
    expect(chip).toHaveClass("rounded-md");
    expect(chip).not.toHaveClass("rounded-pill");
  });

  it.each([
    ["default", "bg-ink-000", "border-ink-300", "text-ink-700"],
    ["success", "bg-status-success-soft", "border-status-success", "text-text-success"],
    ["brand", "bg-ink-000", "border-pink-200", "text-pink-700"],
  ] as const)("paints the %s tone with %s, %s and %s", (tone, fill, border, text) => {
    render(<Tag tone={tone}>Sector 57</Tag>);
    expect(screen.getByText("Sector 57").parentElement).toHaveClass(fill, border, text);
  });

  it("is a fixed 38px pill in DM Sans that never wraps — a long label truncates (Review Focus 1)", () => {
    const label = "Under 15 minutes, every weekday lunch";
    render(<Tag onClick={noop}>{label}</Tag>);
    const tag = screen.getByRole("button", { name: label });
    expect(tag).toHaveClass(
      "h-tag-h",
      "rounded-pill",
      "font-body",
      "text-tag",
      "whitespace-nowrap",
      "max-w-full",
      "shrink-0"
    );
    expect(screen.getByText(label)).toHaveClass("min-w-0", "truncate");
  });

  it("draws a 16px leading glyph", () => {
    render(<Tag icon={Clock}>Under 15 min</Tag>);
    expect(screen.getByText("Under 15 min").parentElement?.firstElementChild).toHaveClass(
      "size-icon-sm"
    );
  });

  it("disables a pressable tag natively, with the grey fill", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Tag disabled onClick={onClick}>
        Breakfast
      </Tag>
    );
    const tag = screen.getByRole("button", { name: "Breakfast" });
    expect(tag).toBeDisabled();
    expect(tag).toHaveClass("disabled:bg-ink-200", "disabled:text-ink-400");
    expect(tag.className).not.toMatch(/opacity/);
    await user.click(tag);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("marks a disabled static chip with aria-disabled", () => {
    render(<Tag disabled>Breakfast</Tag>);
    const chip = screen.getByText("Breakfast").parentElement;
    expect(chip).toHaveAttribute("aria-disabled", "true");
    expect(chip).toHaveClass("aria-disabled:bg-ink-200");
    expect(chip).not.toHaveAttribute("disabled");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Tag onClick={noop} isSelected icon={Flame}>
          Hot
        </Tag>
        <Tag onClick={noop}>All</Tag>
        <Tag tone="success">Sector 57</Tag>
        <Tag disabled>Breakfast</Tag>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
