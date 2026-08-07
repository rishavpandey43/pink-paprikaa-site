const HEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/;

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Ban literal hex colours. The brand hex exists once, in packages/design-tokens — use the token.",
    },
    messages: {
      rawHex:
        "Raw hex colour '{{value}}' — use a design token from @pink-paprikaa-web/design-tokens instead.",
    },
    schema: [],
  },
  create(context) {
    const check = (node, raw) => {
      const match = typeof raw === "string" && raw.match(HEX);
      if (match) {
        context.report({ node, messageId: "rawHex", data: { value: match[0] } });
      }
    };
    return {
      Literal(node) {
        check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value.raw);
      },
      JSXText(node) {
        check(node, node.value);
      },
    };
  },
};
