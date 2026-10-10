// `w-(--x)`, `text-(length:--fs)`: Tailwind v4's CSS-variable shorthand, optionally type-hinted.
const VARIABLE_SHORTHAND = /-\((?:--|[a-z-]+:)/;
// `[mask-type:alpha]`, `[--x:1px]`: an arbitrary property.
const ARBITRARY_PROPERTY = /^\[-{0,2}[a-z][a-z-]*:[^\]]+\]/;

// The utility a class applies, with its variants (`hover:`, `md:`, `[&>*]:`) and `!` removed. A
// variant ends at a `:` outside brackets/parens, so `[mask-type:alpha]` keeps its own colon.
const utilityOf = (token) => {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token[i];
    if (char === "[" || char === "(") depth++;
    else if (char === "]" || char === ")") depth--;
    else if (char === ":" && depth === 0) start = i + 1;
  }
  return token.slice(start).replace(/^!|!$/g, "");
};

/**
 * `tailwindcss/no-arbitrary-value` only reports `-[…]` values, and `no-custom-classname` accepts
 * both forms below as valid Tailwind — this closes the token-only LAW's two remaining escapes.
 * @type {import("eslint").Rule.RuleModule}
 */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Ban arbitrary shorthand classes (`w-(--x)`, `[mask-type:alpha]`) — only token-backed utilities.",
    },
    messages: {
      arbitraryShorthand:
        "Arbitrary shorthand class '{{value}}' — add a token and use its named utility instead.",
    },
    schema: [],
  },
  create(context) {
    const check = (node, raw) => {
      if (typeof raw !== "string") return;
      for (const token of raw.split(/\s+/)) {
        const utility = utilityOf(token);
        if (VARIABLE_SHORTHAND.test(utility) || ARBITRARY_PROPERTY.test(utility)) {
          context.report({ node, messageId: "arbitraryShorthand", data: { value: token } });
        }
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
