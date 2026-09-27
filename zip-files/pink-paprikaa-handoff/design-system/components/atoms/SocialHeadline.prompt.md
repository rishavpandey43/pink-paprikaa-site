Type for marketing canvases — sized in canvas pixels, wrapped with `text-wrap: balance`.

```jsx
<SocialHeadline size="overline" on="brand">Tonight Only</SocialHeadline>
<SocialHeadline size="hero" on="brand" max="14ch">Chai first, decisions later.</SocialHeadline>
```

Never use screen `--fs-*` sizes on a 1080 canvas — they render as fine print. Keep headlines ≤ 6 words so `balance` can do its job.
