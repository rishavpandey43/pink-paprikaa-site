# Batch F report (Plan 5 T11–T13)

**Status:** done

**SHAs**
- T11 `8a6a58c560ae3cd64ff5d43208d40b2b06af303f` feat(storybook): the App kit
- T12 `4cc5243bb110c95c7addaa6ac7188015ebc427d3` feat(storybook): the Marketing reference kit
- T13 `463018d0a84c977c8c121560081f939b33bf1e2d` feat(storybook): react-hook-form + zod pattern (commitlint subject-case rejected the requested Start Case)

**Gates (once, before T13):** `run-many typecheck lint test build` · `format:check` · `sync:check` · `storybook:test` 107 files / 989 tests · `guard:founder` clean · `pnpm install --frozen-lockfile` ok

**T11** OrderingApp in AppShell; Dialog `portalContainer` = frame ref; `ToastProvider isContained` in overlay; `cartTotals` for Pay; Home360 fullscreen phone-sm. Stories 7/7. Probe: `size:"phone"` → page 375px at 360.

**T12** Feed+ads artboards, `PriceTag size="canvas"`, canvas pads via `token("canvas-pad")`. Stories 11/11. Probe: `max-w-150` + no `isFit` → page 1108px at 360.

**T13** Installed rhf 7.89.0, resolvers 5.9.1, zod 4.4.3. KeyboardOnly 1/1. Probe: drop `noValidate` → step 1 misses schema messages.

**Ruling:**
- T11: tracking starts at step 0 and advances; overlay is ToastProvider in AppShell overlay; Dialog portals to AppShell `ref`.
- T12: prices use PriceTag canvas, not formatRupees; CouponTicket `isCopyable={false}` on boards.
- T13: ChoiceCardGroup/ChipGroup not wrapped in Field; RHF `shouldFocusError` focused meal radios, so invalid submit focuses `[name=name]` instead; handleSubmit wrapped so `onSubmit` is values-only; occasion placeholder `"Pick one"` so it does not clash with the error string; commitlint forbade the requested T13 subject casing; `register().min` must not overwrite ChoiceCardGroup `min="sm"`.
