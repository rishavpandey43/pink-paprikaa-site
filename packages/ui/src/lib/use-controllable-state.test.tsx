import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useControllableState } from "./use-controllable-state";

interface HarnessProps {
  value?: string | undefined;
  defaultValue?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
}

/** One value, two buttons: one flips it, one sets it to what it already is. */
function Harness({ value, defaultValue = "off", onChange }: HarnessProps) {
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange });
  return (
    <>
      <output>{current}</output>
      <button
        type="button"
        onClick={() => {
          setCurrent(current === "off" ? "on" : "off");
        }}
      >
        Flip
      </button>
      <button
        type="button"
        onClick={() => {
          setCurrent(current);
        }}
      >
        Keep
      </button>
    </>
  );
}

describe("useControllableState", () => {
  it("keeps its own value when uncontrolled, starting from defaultValue", async () => {
    const user = userEvent.setup();
    render(<Harness defaultValue="on" />);
    expect(screen.getByRole("status")).toHaveTextContent("on");
    await user.click(screen.getByRole("button", { name: "Flip" }));
    expect(screen.getByRole("status")).toHaveTextContent("off");
  });

  it("reports every change when uncontrolled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Flip" }));
    await user.click(screen.getByRole("button", { name: "Flip" }));
    expect(onChange.mock.calls).toEqual([["on"], ["off"]]);
  });

  it("only reports when controlled — the caller's value wins until it changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<Harness value="off" onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Flip" }));
    expect(onChange).toHaveBeenCalledWith("on");
    expect(screen.getByRole("status")).toHaveTextContent("off");
    rerender(<Harness value="on" onChange={onChange} />);
    expect(screen.getByRole("status")).toHaveTextContent("on");
  });

  it.each([
    ["uncontrolled", undefined],
    ["controlled", "off"],
  ] as const)("never reports a set to the value it already holds (%s)", async (_mode, value) => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness value={value} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Keep" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
