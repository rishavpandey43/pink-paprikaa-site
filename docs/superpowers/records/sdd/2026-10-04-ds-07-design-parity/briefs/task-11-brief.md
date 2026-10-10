### Task 11: Foundations pages, brand facts and the Website kit

**Source:** audit-foundations §Foundations pages, §Kits, §Brand facts, §Rules · R140.
- **`states` page:** the handoff's 5-state matrix across components, built from the `States` stories (Task 3 helper).
- **`form-states` page:** the hover row, Combobox and DatePicker entries, and the three native-UI policy notes (no native popups, input-type policy, no validation bubbles).
- **`brand-company` page:** Ordering and Reviews boxes, plus the `googleRating`/`est` derived lines.
- **`packages/content` brand facts** per R140; the rating is read from one value everywhere (grep for literal ratings like `4.6`/`4.3` in `apps/storybook/src` and replace them with the content value).
- **Website kit:**
  - every gap in §Kits;
  - the FAQ egg line rewritten to "no egg in anything";
  - "18 spices" removed;
  - the booking dialog per Task 7.
- **Motion "Duration & easing" specimen must match `guidelines/motion.card.html` (owner report 2026-10-05; the audit marked this card "mapped" without diffing the specimen).**
  - **Today:** `apps/storybook/src/docs-kit/motion-demo.tsx` is a click-to-play button that runs the real token duration once (140ms over ~268px reads as a jump; measured in Chromium, it does animate).
  - **The card:** four rows, each a 300×10px `ink-200` pill track (`overflow:hidden`) with a 34px `pink-500` pill knob that **loops by itself** on `@keyframes sl { 0%,8% { translateX(0) } 50%,58% { translateX(calc(300px - 34px)) } 100% { translateX(0) } }` at `2.4s infinite`. Each row has its own timing function: `--ease-out`, `--ease-in-out`, `--ease-entrance`, `--ease-pop`. Beside each track sit a mono 11px `text-heading` token name and an 11px `text-subtle` note: `140–220ms`, `220ms`, `340ms`, `220ms · add-to-cart only`. Rows sit in a 12px-gap grid, max-width 300px + label; the track and label have a 14px gap.
  - **Build it:** a `MotionEasingSpecimen` docs-kit component (tokens only). Add `@keyframes pp-ease-demo` and `--animate-ease-demo` to the docs-kit stylesheet or `styles.css`, with the track width as a CSS variable, not an arbitrary value; register any new utility. It's the first specimen on the Motion page, under the card's title and subtitle ("Hover 140ms, state 220ms, sheets 340ms. --ease-pop only for add-to-cart.").
  - **Keep or remove:** keep the token tables and copy chips below it as reference. Remove the Play-button rows (they aren't in the design).
  - **Reduced motion:** honour it like the design's own `tokens/base.css:39` (no exemption), and keep the existing mdx note telling readers how to check the OS setting.
  - **Play:** `getComputedStyle(knob).animationName === "pp-ease-demo"`, `animationIterationCount === "infinite"`, `animationTimingFunction` equals each row's token, and the knob's x-position at two points in time differs (it moves).
  - **Visual check:** compare with the card in the Task 12 tool.
  - **Same for the other motion-family cards:** `states.card.html` and `form-states.card.html` specimens are already in this task. Diff each specimen against its card, not just page existence.
- [ ] Each change gets a play or a content-spec assertion. Commits per page/kit.

