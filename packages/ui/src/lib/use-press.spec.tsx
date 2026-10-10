import { fireEvent, render, screen } from "@testing-library/react";

import { usePress } from "./use-press";

describe("usePress", () => {
  it("marks press on pointer and on Space/Enter, clears on release/leave/blur", () => {
    function T() {
      const p = usePress();
      return <button {...p.pressProps}>Add</button>;
    }
    render(<T />);
    const b = screen.getByRole("button", { name: "Add" });
    b.focus();
    fireEvent.keyDown(b, { key: "Enter" });
    expect(b).toHaveAttribute("data-pressed");
    fireEvent.keyUp(b, { key: "Enter" });
    expect(b).not.toHaveAttribute("data-pressed");
    fireEvent.keyDown(b, { key: " " });
    expect(b).toHaveAttribute("data-pressed");
    fireEvent.blur(b);
    expect(b).not.toHaveAttribute("data-pressed");
    fireEvent.pointerDown(b);
    expect(b).toHaveAttribute("data-pressed");
    fireEvent.pointerLeave(b);
    expect(b).not.toHaveAttribute("data-pressed");
  });

  it("composes the caller's pointer and keyboard handlers", () => {
    const onPointerDown = vi.fn();
    const onKeyDown = vi.fn();
    function T() {
      const p = usePress({ onPointerDown, onKeyDown });
      return <button {...p.pressProps}>Add</button>;
    }
    render(<T />);
    const b = screen.getByRole("button", { name: "Add" });
    fireEvent.pointerDown(b);
    fireEvent.keyDown(b, { key: "Enter" });
    expect(onPointerDown).toHaveBeenCalledOnce();
    expect(onKeyDown).toHaveBeenCalledOnce();
  });
});
