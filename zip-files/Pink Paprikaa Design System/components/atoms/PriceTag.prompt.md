The only correct way to render a price: `₹` with no space, no decimals on whole rupees, Indian digit grouping.

```jsx
<PriceTag amount={280} />
<PriceTag amount={240} was={320} />
<PriceTag amount={180} to={320} size="sm" />
```

`tone="inverse"` on pink or ink panels. Never hand-write a price string.
