import next from "@pink-paprikaa-web/eslint-config/next";

export default [
  ...next,
  // Content Collections writes its generated module (imported as
  // `content-collections` via the tsconfig path alias) into
  // `.content-collections/generated` at build/typegen time — not hand-written
  // source, and not covered by any tsconfig `include`, so the type-aware
  // project service can't parse it. Same pattern as the `**/out-tsc` ignores
  // elsewhere in this workspace.
  {
    ignores: ["**/.content-collections"],
  },
];
