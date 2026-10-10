import { createRef } from "react";

import { assignRef } from "./assign-ref";

describe("assignRef", () => {
  it("calls a callback ref with the node", () => {
    const ref = vi.fn();
    const node = document.createElement("input");
    assignRef(ref, node);
    expect(ref).toHaveBeenCalledWith(node);
  });

  it("sets an object ref's current", () => {
    const ref = createRef<HTMLInputElement>();
    const node = document.createElement("input");
    assignRef(ref, node);
    expect(ref.current).toBe(node);
  });

  it("does nothing without a ref", () => {
    expect(() => {
      assignRef(undefined, null);
    }).not.toThrow();
  });
});
