---
name: pink-paprikaa-design
description: Use this skill to generate well-branded interfaces and assets for Pink Paprikaa (Paprikaa Culinary Ventures Private Limited), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for protoyping.
user-invocable: true
---

Read the readme.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Company facts (legal entity, GSTIN, FSSAI, phone, website, outlets, GST rate) are in `brand.js` — always read them from there, never retype them.

## Rules that are easy to miss
- **No browser-native UI.** Never a native `<select>`, `type="date|time|number"` picker, `title` tooltip or validation bubble. Use `Select`, `Combobox`, `DatePicker`, `SlotPicker`, `QuantityStepper`, `ActionMenu`, `Tooltip`; forms are `noValidate` with errors via each control's `error` prop.
- **Every pressable element has rest / hover / press / focus-visible / disabled.** Text-only actions (toast CTAs, "Undo", "Edit") are `TextButton`, never a bare `<button>`. Custom pressables use the `usePress` hook (exported from `components/atoms/TextButton.jsx`) and the `--state-*` tokens.
- **Text colour follows the surface** (`data-surface="brand|ink|soft"`); never black on pink.
- Developer handoff (tokens, every component's props, screens, QA checklist): `handoff/README.md`.
