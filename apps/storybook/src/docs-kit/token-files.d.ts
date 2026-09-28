/**
 * Types for the JSON files the docs read from @pink-paprikaa-web/design-tokens. Vite loads them at
 * runtime; TypeScript never parses them (this project leaves `resolveJsonModule` off), so these
 * declarations are what it sees. Typecheck therefore never depends on `dist/` having been built,
 * and each file has one explicit shape owned by the package that writes it.
 */
declare module "@pink-paprikaa-web/design-tokens/tokens.json" {
  import type { TokenEntry } from "@pink-paprikaa-web/design-tokens/catalogue";

  const catalogue: readonly TokenEntry[];
  export default catalogue;
}

declare module "@pink-paprikaa-web/design-tokens/contrast-pairs.json" {
  import type { ContrastPolicy } from "@pink-paprikaa-web/design-tokens/contrast";

  const policy: ContrastPolicy;
  export default policy;
}
