Every Instagram post, story, banner or OG image starts here — it fixes the exact pixel canvas so nothing is designed at an invented size.

```jsx
<PostFrame format="post" fit background="var(--pink-500)">
  <SocialHeadline size="hero" on="brand">Chai first, decisions later.</SocialHeadline>
</PostFrame>
```

Children are authored at **true canvas pixels** (use the `--fs-canvas-*` scale, not screen type sizes); the frame scales the whole thing down for preview. `safeArea` draws the story chrome guides. Never design a marketing asset outside the seven listed formats.
