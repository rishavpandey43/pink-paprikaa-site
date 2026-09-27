Outlet open/closed state and live order state.

```jsx
<StatusDot tone="open" label="Open till 11:30pm" />
<StatusDot tone="live" pulse label="On the tandoor" />
```

A rotated diamond, not a circle — the brand shape carries all the way down. `pulse` needs `@keyframes pp-dot-pulse` (scale 1→2.4, opacity .6→0).
