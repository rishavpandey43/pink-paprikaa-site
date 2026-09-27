const { Logo, IconButton, Icon, Text, Card, Badge, Button, SpiceLevel, PatternField, ImageSlot,
        SearchField, FilterBar, MenuItemCard, LoyaltyCard, ListRow, Switch, Avatar, Divider } = window.PinkPaprikaaDesignSystem_23ef63;
const BASE = "../../assets";

/** App home: pink header, loyalty, category rail, most-ordered rail, promo. */
function HomeScreen({ menu, onOpen, onSeeMenu }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "var(--surface-page)" }}>
      <PatternField tone="brand" tile={58} base={BASE}>
        <div style={{ padding: "4px 20px 26px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Logo base={BASE} tone="white" height={46} />
            <IconButton icon="bell" label="Notifications" on="brand" />
          </div>
          <div style={{ marginTop: 18 }}>
            <Text variant="h2" as="div" tone="inverse">Chai first,<br />decisions later.</Text>
            <span style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 12, color: "rgba(255,255,255,.88)" }}>
              <Icon name="map-pin" size="sm" />
              <Text variant="body-sm" as="span" tone="rgba(255,255,255,.88)">Sector 57 &middot; 12 min pickup</Text>
            </span>
          </div>
          <div style={{ marginTop: 18 }}>
            <SearchField value="" onChange={() => {}} placeholder="Search chai, paneer, kulfi..." />
          </div>
        </div>
      </PatternField>

      <div style={{ padding: "20px 20px 0" }}>
        <LoyaltyCard base={BASE} visits={3} goal={6} reward="chai" />
      </div>

      <div style={{ padding: "22px 0 0 20px" }}>
        <FilterBar value="All" onChange={onSeeMenu} options={["All", "Small Plates", "All Day", "Chai & Coffee", "Sweets"]} />
      </div>

      <div style={{ padding: "22px 20px 0", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <Text variant="h4" as="h4">Most ordered</Text>
        <Button variant="ghost" size="sm" onClick={onSeeMenu}>See all</Button>
      </div>
      <div style={{ display: "flex", gap: 14, overflowX: "auto", padding: "14px 20px 4px" }}>
        {menu.slice(0, 3).map((m) => (
          <div key={m.name} style={{ flex: "0 0 auto" }}>
            <MenuItemCard base={BASE} {...m} width={216} onClick={() => onOpen(m)} onAdd={() => onOpen(m)} />
          </div>
        ))}
      </div>

      <div style={{ padding: "24px 20px 28px" }}>
        <Card variant="ink" padding={0} style={{ overflow: "hidden" }}>
          <PatternField tone="ink" tile={52} base={BASE}>
            <div style={{ padding: 20 }}>
              <Badge tone="brand">Tonight Only</Badge>
              <Text variant="h4" as="div" tone="inverse" style={{ marginTop: 10, fontWeight: 800 }}>Extra Hot Fries, half price</Text>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                <SpiceLevel level={4} base={BASE} />
                <Text variant="caption" as="span" tone="rgba(255,255,255,.7)">till 11:30pm</Text>
              </div>
              <Button size="sm" style={{ marginTop: 16 }} onClick={onSeeMenu}>Add to Order</Button>
            </div>
          </PatternField>
        </Card>
      </div>
    </div>
  );
}

/** Account screen — ListRow settings. */
function YouScreen() {
  const [alerts, setAlerts] = React.useState(true);
  const [jain, setJain] = React.useState(false);
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "4px 20px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 0 20px" }}>
        <Avatar name="Aditi Rao" size="lg" ring />
        <div>
          <Text variant="h4" as="div">Aditi Rao</Text>
          <Text variant="body-sm" tone="muted" as="div">+91 98765 43210</Text>
        </div>
      </div>
      <LoyaltyCard base={BASE} visits={3} goal={6} reward="chai" />
      <Divider variant="diamond" base={BASE} style={{ margin: "20px 0" }} />
      <ListRow icon="map-pin" title="Default outlet" value="Sector 57" chevron onClick={() => {}} />
      <ListRow icon="receipt" title="Order history" description="12 orders since 2024" chevron onClick={() => {}} />
      <ListRow icon="credit-card" title="Payment methods" value="UPI" chevron onClick={() => {}} />
      <ListRow icon="bell" title="Order updates" trailing={<Switch checked={alerts} onChange={() => setAlerts(!alerts)} />} />
      <ListRow icon="leaf" title="Jain preferences" description="Hides onion and garlic." trailing={<Switch checked={jain} onChange={() => setJain(!jain)} />} />
      <ListRow icon="log-out" title="Sign out" danger chevron onClick={() => {}} divider={false} />
    </div>
  );
}
Object.assign(window, { HomeScreen, YouScreen });
