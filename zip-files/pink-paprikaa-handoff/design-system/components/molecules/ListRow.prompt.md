Settings, account and detail rows in the app.

    <ListRow icon="map-pin" title="Default outlet" value="Sector 57" chevron onClick={pick} />
    <ListRow icon="bell" title="Order updates" trailing={<Switch checked={on} onChange={t} />} />

Rows are hairline separated - never a stack of cards. Minimum 44px tall. Use danger for destructive rows.
