Offer badge for posts, stories and banners — a rotated brand diamond, never a circular starburst.

```jsx
<OfferSeal value="50%" label="Off" note="till 11:30pm" size={280} bleed={50} />
```

One per artboard. Use `bleed` (with `corner`) to hang it off the canvas edge — the component clamps the offset to 0.18 x `size`, because the number reaches ~0.32 x `size` from the centre and the value must never be clipped. Text counter-rotates so it stays upright.
