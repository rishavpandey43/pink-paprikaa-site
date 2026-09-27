Loading placeholder — light-pink blocks, never grey, never a gradient spinner.

```jsx
<Skeleton height={180} radius="var(--radius-lg)" />
<Skeleton lines={3} />
```

Needs `@keyframes pp-skeleton` (opacity 1 → .55 → 1) in the page. For whole-page loads use the pulsing pink diamond symbol instead.
