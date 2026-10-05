const BANNED_INPUT_TYPES = new Set([
  "date",
  "time",
  "datetime-local",
  "month",
  "week",
  "color",
  "file",
  "range",
]);

/** @param {import("eslint").Rule.Node} node */
function isIntrinsic(node) {
  return (
    node.type === "JSXOpeningElement" &&
    node.name.type === "JSXIdentifier" &&
    /^[a-z]/.test(node.name.name)
  );
}

/** @param {import("eslint").Rule.Node} opening */
function attr(opening, name) {
  return opening.attributes.find(
    (entry) =>
      entry.type === "JSXAttribute" &&
      entry.name.type === "JSXIdentifier" &&
      entry.name.name === name
  );
}

/** @param {import("eslint").Rule.Node} attribute */
function attrStringValue(attribute) {
  if (attribute.value === null) return "";
  if (attribute.value.type === "Literal" && typeof attribute.value.value === "string") {
    return attribute.value.value;
  }
  if (
    attribute.value.type === "JSXExpressionContainer" &&
    attribute.value.expression.type === "Literal" &&
    typeof attribute.value.expression.value === "string"
  ) {
    return attribute.value.expression.value;
  }
  return undefined;
}

/** @param {string} filename */
function isUnderLib(filename) {
  return /(?:^|[/\\])lib[/\\]/.test(filename.replaceAll("\\", "/"));
}

/** @param {string} filename */
function isSelectAtom(filename) {
  // Platform <select> lives in the Select atom until Task 7 replaces it with our list.
  return /(?:^|[/\\])atoms[/\\]select[/\\]/.test(filename.replaceAll("\\", "/"));
}

/** @param {string} filename */
function isSliderAtom(filename) {
  return /(?:^|[/\\])atoms[/\\]slider[/\\]/.test(filename.replaceAll("\\", "/"));
}

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Ban native browser UI the design system replaces: <select>, date/time inputs, required, title tooltips, and forms without noValidate.",
    },
    messages: {
      select:
        "Native <select> is banned outside packages/ui/src/lib (and atoms/select until Task 7). Use the Select atom / list.",
      inputType:
        'Native <input type="{{value}}"> is banned outside atoms/slider. Use the design-system control instead.',
      required:
        "The DOM `required` attribute is banned — use `aria-required` (Field owns the message).",
      title: "DOM `title=` tooltips are banned — use the Tooltip atom (or <svg><title> for icons).",
      form: "<form> must set noValidate — native validation UI is banned.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    return {
      JSXOpeningElement(node) {
        if (!isIntrinsic(node)) return;
        const tag = node.name.name;

        if (tag === "select" && !isUnderLib(filename) && !isSelectAtom(filename)) {
          context.report({ node, messageId: "select" });
        }

        if (tag === "input") {
          const typeAttr = attr(node, "type");
          const typeValue = typeAttr === undefined ? undefined : attrStringValue(typeAttr);
          if (
            typeof typeValue === "string" &&
            BANNED_INPUT_TYPES.has(typeValue) &&
            !(typeValue === "range" && isSliderAtom(filename))
          ) {
            context.report({ node: typeAttr, messageId: "inputType", data: { value: typeValue } });
          }
        }

        if (tag === "form" && attr(node, "noValidate") === undefined) {
          context.report({ node, messageId: "form" });
        }

        if (attr(node, "required") !== undefined) {
          context.report({ node: attr(node, "required"), messageId: "required" });
        }

        // <svg><title>…</title></svg> is an element, not a title= attribute — allowed.
        if (attr(node, "title") !== undefined) {
          context.report({ node: attr(node, "title"), messageId: "title" });
        }
      },
    };
  },
};
