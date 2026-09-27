/**
 * Shared `@typescript-eslint/naming-convention` options. Severity is applied by
 * the consumer (`base.js` wires these at "error" — a LAW since the design
 * system rewrite).
 *
 * Ported from a battle-tested predecessor config, minus its project-specific
 * filters (GraphQL `__typename`, generated-hook `loading` names). Add
 * workspace-specific `filter` escapes here as real cases arrive — never inline
 * eslint-disables at the call site.
 */
export default [
  {
    selector: "variable",
    format: ["camelCase", "UPPER_CASE", "PascalCase"],
    leadingUnderscore: "allow",
    trailingUnderscore: "allow",
  },
  {
    // Booleans read as questions: isOpen, hasMenu, shouldRetry, canOrder.
    selector: "variable",
    types: ["boolean"],
    format: ["camelCase", "UPPER_CASE", "PascalCase"],
    prefix: ["is", "should", "has", "can", "did", "will", "does", "disable", "enable"],
  },
  {
    selector: "memberLike",
    modifiers: ["private"],
    format: ["camelCase"],
    leadingUnderscore: "require",
  },
  {
    // PascalCase allowed for React components.
    selector: "function",
    format: ["PascalCase", "camelCase"],
  },
  {
    selector: "parameter",
    format: ["PascalCase", "camelCase"],
    leadingUnderscore: "allow",
  },
  {
    // Object literals mirror external shapes (headers, CSS-in-JS, API payloads)
    // — no format enforced.
    selector: "objectLiteralProperty",
    format: null,
    leadingUnderscore: "allow",
  },
  {
    selector: "typeLike",
    format: ["PascalCase"],
  },
  {
    // snake_case allowed so API payload types can mirror the wire format.
    selector: "typeProperty",
    format: ["camelCase", "snake_case"],
  },
  {
    selector: "enumMember",
    format: ["PascalCase"],
  },
  {
    selector: "typeParameter",
    format: ["PascalCase"],
  },
  {
    // No Hungarian `IThing` interfaces.
    selector: "interface",
    format: ["PascalCase"],
    custom: { regex: "^I[A-Z]", match: false },
  },
];
