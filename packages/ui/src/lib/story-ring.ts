/**
 * Stories only — never exported from the barrel. The `overflow` ancestors of `element` whose
 * padding box cuts its focus outline (an outline is clipped like any other paint, so a ring drawn
 * outside a flush child of an `overflow-hidden` box all but vanishes). A `play` that focuses a
 * control inside a clipping frame asserts this is `[]`. Throws when `element` draws no outline (not
 * focused, or a box-shadow ring): there is nothing to measure, and an empty list would pass.
 */
export function ringClippers(element: HTMLElement) {
  const style = getComputedStyle(element);
  const width = Number.parseFloat(style.outlineWidth);
  // Negative for an inset ring (`-outline-offset-4`): its outer edge sits inside the box.
  const reach = width + Number.parseFloat(style.outlineOffset);
  if (style.outlineStyle === "none" || !(width > 0) || !Number.isFinite(reach)) {
    throw new Error(
      `ringClippers: <${element.tagName.toLowerCase()}> draws no focus outline (outline-style "${style.outlineStyle}", width "${style.outlineWidth}")`
    );
  }
  // Scroll extents are whole pixels, so a child scrolled fully into view can sit a fraction past.
  const box = element.getBoundingClientRect();
  const slack = 1;
  const clippers: HTMLElement[] = [];
  for (let node = element.parentElement; node !== null; node = node.parentElement) {
    const { overflowX, overflowY } = getComputedStyle(node);
    if (overflowX === "visible" && overflowY === "visible") continue;
    const frame = node.getBoundingClientRect();
    const left = frame.left + node.clientLeft;
    const top = frame.top + node.clientTop;
    if (
      box.left - reach < left - slack ||
      box.top - reach < top - slack ||
      box.right + reach > left + node.clientWidth + slack ||
      box.bottom + reach > top + node.clientHeight + slack
    ) {
      clippers.push(node);
    }
  }
  return clippers;
}
