Modal for a decision that must be made now; `sheet` for the mobile app.

```jsx
<Dialog title="Remove this item?" onClose={close} footer={<><Button variant="ghost">Keep It</Button><Button>Remove</Button></>}>
  Chilli Paneer will come off your order.
</Dialog>
```

24px radius, `--shadow-4`, 56% ink scrim. Positioned `absolute` inside the nearest positioned ancestor so it works inside phone frames — give that ancestor `position:relative`.
