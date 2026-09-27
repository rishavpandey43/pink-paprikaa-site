const { Section, Container, AutoGrid, SectionHeader, Stat, ImageSlot, Text, Button, OutletCard, FilterBar, Card, SpiceLevel } = window.PinkPaprikaaDesignSystem_23ef63;
const BASE = "../../assets";

function Story() {
  return (
    <Section tone="alt">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px,100%), 1fr))", gap: "clamp(32px,5vw,64px)", alignItems: "center" }}>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <ImageSlot ratio="3:4" tone="strong" radius="var(--radius-lg)" label="Kitchen portrait 3:4" />
          <ImageSlot ratio="3:4" radius="var(--radius-lg)" label="Masala grinding 3:4" style={{ marginTop: 40 }} />
        </div>
        <div>
          <SectionHeader overline="Our Story" title="A cafe that tastes like where it's from" />
          <Text variant="body-lg" as="p" style={{ marginTop: 16 }}>
            We started in one Gurgaon market with a chai counter and a grinder. The idea was simple: a cafe that runs on Indian flavour instead of borrowing someone else's.
          </Text>
          <Text variant="body-lg" as="p">
            Every masala is roasted in-house each morning. Every dish is built to be shared, argued over, and ordered again.
          </Text>
          <div style={{ display: "flex", gap: 16, marginTop: 28, flexWrap: "wrap" }}>
            <Card variant="feature" padding={20} style={{ flex: 1, minWidth: 200 }}>
              <Stat value="18" label="spices ground in-house, daily" tone="brand" />
            </Card>
            <Card variant="feature" padding={20} style={{ flex: 1, minWidth: 200 }}>
              <div style={{ marginBottom: 6 }}><SpiceLevel level={4} size={16} showLabel base={BASE} /></div>
              <Text variant="body-sm" as="div" tone="var(--pink-800)">the heat scale we cook to</Text>
            </Card>
          </div>
          <Button variant="secondary" style={{ marginTop: 28 }} iconAfter="arrow-right">Read Our Story</Button>
        </div>
      </div>
    </Section>
  );
}

const PP_OUTLETS = [
  { city: "Gurgaon", name: "Sector 57", address: "Booth No. 67P, HSVP Market, Sector 57, Gurgaon 122003", hours: "Open daily", status: "open" },
];

function Outlets() {
  const list = PP_OUTLETS;
  return (
    <Section>
      <SectionHeader overline="Outlets" title="Find a Paprikaa" />
      <AutoGrid min={320} style={{ marginTop: 32 }}>
        {list.map((o) => (
          <OutletCard key={o.name} base={BASE} {...o} imageLabel="Outlet interior 16:9"
            action={<Button size="sm" variant="ghost" iconAfter="arrow-up-right">Directions</Button>} />
        ))}
      </AutoGrid>
    </Section>
  );
}
Object.assign(window, { Story, Outlets, PP_OUTLETS });
