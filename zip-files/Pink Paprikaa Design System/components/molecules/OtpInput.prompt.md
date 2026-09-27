Mobile-OTP login code — the app's only sign-in method.

```jsx
<OtpInput value={code} onChange={setCode} />
```

48×56 cells, Space Mono digits, filled cells take a 2px pink border. Wraps to a second row rather than overflowing on a 360px screen.
