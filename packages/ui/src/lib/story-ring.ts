/**
 * Stories only — never exported from the barrel. The `overflow` ancestors of `element` whose
 * padding box cuts its focus ring (a ring is clipped like any other paint, so one drawn outside a
 * flush child of an `overflow-hidden` box all but vanishes). A `play` that focuses a control inside
 * a clipping frame asserts this is `[]`. The ring is the element's outline or, without one, its
 * outer box-shadow (a field's `shadow-focus-ring`, drawn on the field box, not the `<input>`).
 * Throws when `element` draws neither (not focused, or the wrong element): there is nothing to
 * measure, and an empty list would pass.
 */
export function ringClippers(element: HTMLElement) {
  // A ring that transitions in (`transition-control` on a field box) is measured where it settles.
  if ("getAnimations" in element) {
    for (const animation of element.getAnimations()) {
      if (animation instanceof CSSTransition) animation.finish();
    }
  }
  const style = getComputedStyle(element);
  const width = Number.parseFloat(style.outlineWidth);
  const hasOutline = style.outlineStyle !== "none" && width > 0;
  // Negative for an inset outline (`-outline-offset-4`): its outer edge sits inside the box.
  const reach = hasOutline
    ? width + Number.parseFloat(style.outlineOffset)
    : shadowReach(style.boxShadow);
  if (!Number.isFinite(reach) || (!hasOutline && !(reach > 0))) {
    throw new Error(
      `ringClippers: <${element.tagName.toLowerCase()}> draws no focus ring (outline-style "${style.outlineStyle}", width "${style.outlineWidth}", box-shadow "${style.boxShadow}")`
    );
  }
  // Scroll extents are whole pixels, so a child scrolled fully into view can sit a fraction past.
  const box = element.getBoundingClientRect();
  const slack = 1;
  const clippers: HTMLElement[] = [];
  // Only a box in the containing-block chain clips: a fixed scrim escapes an `overflow-hidden` body.
  for (let node = containingBlock(element); node !== null; node = containingBlock(node)) {
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

/** The box `node` is laid out in — the one whose `overflow` can clip it; `null` for the viewport. */
function containingBlock(node: HTMLElement) {
  const { position } = getComputedStyle(node);
  if (position !== "absolute" && position !== "fixed") return node.parentElement;
  for (let ancestor = node.parentElement; ancestor !== null; ancestor = ancestor.parentElement) {
    const style = getComputedStyle(ancestor);
    if (position === "absolute" && isSet(style.position) && style.position !== "static") {
      return ancestor;
    }
    if (
      isSet(style.transform) ||
      isSet(style.translate) ||
      isSet(style.rotate) ||
      isSet(style.scale) ||
      isSet(style.filter) ||
      isSet(style.getPropertyValue("backdrop-filter")) ||
      isSet(style.perspective) ||
      /transform|translate|rotate|scale|perspective|filter|contain/.test(style.willChange) ||
      /layout|paint|strict|content/.test(style.contain) ||
      (isSet(style.containerType) && style.containerType !== "normal") ||
      style.contentVisibility === "auto"
    ) {
      return ancestor;
    }
  }
  return null;
}

function isSet(value: string) {
  return value !== "" && value !== "none";
}

/** How far the outer shadows of a computed `box-shadow` reach past the box; NaN when none do. */
function shadowReach(boxShadow: string) {
  let reach = Number.NaN;
  // A colour function's channels (`oklch(0.75 0.12 350)`) are not lengths.
  for (const shadow of boxShadow.replaceAll(/\w+\([^)]*\)/g, "").split(",")) {
    if (shadow.includes("inset")) continue;
    const lengths = shadow
      .trim()
      .split(/\s+/)
      .filter((token) => /^-?[\d.]+(px)?$/.test(token))
      .map((token) => Number.parseFloat(token));
    if (lengths.length < 2) continue;
    const [x = 0, y = 0, blur = 0, spread = 0] = lengths;
    const shadowEdge = Math.max(Math.abs(x), Math.abs(y)) + blur + spread;
    reach = Number.isNaN(reach) ? shadowEdge : Math.max(reach, shadowEdge);
  }
  return reach;
}
