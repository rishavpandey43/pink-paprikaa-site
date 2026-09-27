The signature that closes a piece of marketing artwork — a post, a story, an ad.

```jsx
<LogoLockup tone="white" size={280} />
<LogoLockup tone="pink" size={200} align="center" />
```

The tagline is part of the supplied logo artwork, so it scales with the mark and can never drift out of sync. Keep `size` at 200 or above; below that pass `tagline={false}` to drop to the wordmark. On a coloured field use `tone="white"`; on light artwork use `tone="pink"`.
