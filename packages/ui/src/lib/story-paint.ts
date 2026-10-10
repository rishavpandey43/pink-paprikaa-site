/**
 * Stories only — never exported from the barrel. The value a token paints, in the browser's own
 * format, read off a probe placed next to `element` so it resolves under the same surface.
 */
export function paint(
  element: HTMLElement,
  property: "color" | "borderColor" | "backgroundColor",
  token: string
) {
  const probe = document.createElement("span");
  probe.style[property] = `var(${token})`;
  element.parentElement?.append(probe);
  const expected = getComputedStyle(probe)[property];
  probe.remove();
  return expected;
}

/**
 * Stories only. The first painted background behind `element` — the ground it must stand out
 * from (R89: a pink mark on the pink field vanishes). Transparent ancestors are skipped.
 */
export function groundOf(element: Element) {
  for (let node = element.parentElement; node !== null; node = node.parentElement) {
    const colour = getComputedStyle(node).backgroundColor;
    if (colour !== "rgba(0, 0, 0, 0)") return colour;
  }
  return getComputedStyle(document.body).backgroundColor;
}
