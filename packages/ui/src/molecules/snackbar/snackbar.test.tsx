import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Snackbar } from "./snackbar";

const UNDO = { label: "Undo", altText: "Undo removing Chilli Paneer" } as const;

function messages(): HTMLElement {
  return screen.getByRole("region", { name: "Messages" });
}

describe("Snackbar", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows its message with a dismiss button", () => {
    render(<Snackbar>Table held for 10 minutes.</Snackbar>);
    expect(within(messages()).getByText("Table held for 10 minutes.")).toBeInTheDocument();
    expect(within(messages()).getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  it("leaves nothing behind while closed", () => {
    render(
      <Snackbar open={false} onOpenChange={vi.fn()}>
        Code copied.
      </Snackbar>
    );
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("anchors inside the nearest positioned box by default, or to the window", () => {
    const { rerender } = render(<Snackbar>Code copied.</Snackbar>);
    expect(within(messages()).getByRole("list")).toHaveClass(
      "absolute",
      "bottom-6",
      "justify-center"
    );
    rerender(<Snackbar isContained={false}>Code copied.</Snackbar>);
    const list = within(messages()).getByRole("list");
    expect(list).toHaveClass("fixed", "bottom-dock-clearance");
    expect(list).not.toHaveClass("absolute");
  });

  it.each([
    ["bottom-left", ["bottom-6", "justify-start"]],
    ["bottom-right", ["bottom-6", "justify-end"]],
    ["top-center", ["top-6", "justify-center"]],
    ["top-right", ["top-6", "justify-end"]],
  ] as const)("sits at %s", (position, classes) => {
    render(<Snackbar position={position}>Code copied.</Snackbar>);
    expect(within(messages()).getByRole("list")).toHaveClass(...classes);
  });

  it.each([
    ["ink", "ink", "bg-surface-inverse", "text-text-brand"],
    ["brand", "brand", "bg-surface-brand", "text-text-body"],
    ["success", "ink", "bg-snackbar-success-bg", "text-text-body"],
    ["danger", "ink", "bg-status-danger", "text-text-body"],
  ] as const)("paints the %s tone and its action", (tone, surface, fill, actionColour) => {
    render(
      <Snackbar tone={tone} action={{ ...UNDO, onClick: vi.fn() }}>
        Chilli Paneer removed.
      </Snackbar>
    );
    const bar = within(messages()).getByRole("listitem");
    expect(bar).toHaveAttribute("data-surface", surface);
    expect(bar).toHaveClass(fill);
    expect(within(bar).getByRole("button", { name: "Undo" })).toHaveClass(actionColour);
  });

  it.each([
    ["ink", "polite"],
    ["success", "polite"],
    ["danger", "assertive"],
  ] as const)(
    "announces a %s bar %sly — a failure interrupts, a confirmation waits",
    (tone, politeness) => {
      render(<Snackbar tone={tone}>Code copied.</Snackbar>);
      expect(
        document.body.querySelector(`[role="status"][aria-live="${politeness}"]`)
      ).toBeInTheDocument();
    }
  );

  it("gives the action a 44px hit height and the dismiss a 40px one, without growing the bar", () => {
    render(<Snackbar action={{ ...UNDO, onClick: vi.fn() }}>Chilli Paneer removed.</Snackbar>);
    expect(screen.getByRole("button", { name: "Undo" })).toHaveClass("min-h-hit", "-my-3");
    expect(screen.getByRole("button", { name: "Dismiss" })).toHaveClass(
      "size-6",
      "before:-inset-2"
    );
  });

  it("merges a caller className over the bar", () => {
    render(<Snackbar className="rounded-lg">Code copied.</Snackbar>);
    const bar = within(messages()).getByRole("listitem");
    expect(bar).toHaveClass("rounded-lg");
    expect(bar).not.toHaveClass("rounded-md");
  });

  it("runs its action, then closes and reports it", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Snackbar action={{ ...UNDO, onClick }} onOpenChange={onOpenChange}>
        Chilli Paneer removed.
      </Snackbar>
    );
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByText("Chilli Paneer removed.")).not.toBeInTheDocument();
  });

  it("closes from its dismiss button and reports it", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Snackbar onOpenChange={onOpenChange}>Code copied.</Snackbar>);
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("hides itself after 3.2 seconds by default", () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    render(<Snackbar onOpenChange={onOpenChange}>Code copied.</Snackbar>);
    act(() => {
      vi.advanceTimersByTime(3199);
    });
    expect(onOpenChange).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("stays until dismissed with an infinite duration", () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    render(
      <Snackbar duration={Infinity} onOpenChange={onOpenChange}>
        Code copied.
      </Snackbar>
    );
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("follows open when controlled", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Snackbar open={false} onOpenChange={onOpenChange}>
        Code copied.
      </Snackbar>
    );
    expect(screen.queryByText("Code copied.")).not.toBeInTheDocument();
    rerender(
      <Snackbar open onOpenChange={onOpenChange}>
        Code copied.
      </Snackbar>
    );
    expect(within(messages()).getByText("Code copied.")).toBeInTheDocument();
  });

  it("has no accessibility violations with an action and a dismiss", async () => {
    const { container } = render(
      <div className="relative">
        <Snackbar action={{ ...UNDO, onClick: vi.fn() }}>Chilli Paneer removed.</Snackbar>
      </div>
    );
    await expectNoA11yViolations(container);
  });
});
