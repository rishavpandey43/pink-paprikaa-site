Transient pill confirmation, bottom-centre above the tab bar.

```jsx
<Toast tone="brand" pop action="View Cart" onAction={open}>Added to your order.</Toast>
```

`pop` is the only sanctioned overshoot in the system — reserve it for add-to-cart and reward confirmations. Copy is one short sentence, no exclamation mark. Needs `@keyframes pp-toast-pop` (translateY 12px → 0) in the page.
