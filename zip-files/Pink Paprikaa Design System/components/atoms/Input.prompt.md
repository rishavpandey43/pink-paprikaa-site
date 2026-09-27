Single-line or multiline text field - 48px tall (40 sm / 56 lg), 10px radius, 2px status border.

    <Input label="Mobile number" icon="phone" placeholder="98765 43210" />
    <Input label="Card" error="That card didn't go through. Try another?" />
    <Input label="Promo code" success="PAPRIKAA50 applied." />
    <Input label="Outlet" value="Sector 57" readOnly />

**States:** rest, hover, focus (2px + ring), filled, `disabled`, `readOnly`, `loading`, `error`, `success`, `warning`. Each status prop takes `true` or the message string; the message replaces `hint` and the matching glyph appears on the right. Labels are sentence case; error copy says what to do next, never a code.
