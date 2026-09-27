const { PostFrame, PatternField, SocialHeadline, LogoLockup, OfferSeal, Badge, SpiceLevel, DietMark, PriceTag } = window.PinkPaprikaaDesignSystem_23ef63;
const BASE = "../../assets";

function PhotoSlot({ label = "Dish photo", tone = "soft", style }) {
  return (
    <div style={{ background: tone === "soft" ? "var(--pink-100)" : "var(--ink-200)", display: "grid", placeItems: "center", ...style }}>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, letterSpacing: ".12em", textTransform: "uppercase", color: tone === "soft" ? "var(--pink-400)" : "var(--ink-500)", textAlign: "center", padding: 24 }}>{label}</span>
    </div>
  );
}

/** 1:1 offer post — flooded pink, pattern, corner seal. */
function OfferPost({ scale }) {
  return (
    <PostFrame format="post" scale={scale} background="var(--pink-500)">
      <PatternField tone="brand" tile={104} base={BASE} style={{ position: "absolute", inset: 0 }} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
        <SocialHeadline size="overline" on="brand">Tonight Only · Till 11:30pm</SocialHeadline>
        <SocialHeadline size="hero" on="brand" max="12ch">Masala Fries, half price.</SocialHeadline>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40 }}>
          <LogoLockup tone="white" size={280} base={BASE} />
          <SocialHeadline size="caption" on="brand" max="18ch" align="end">Dine-in and pickup. At our Sector 57 café.</SocialHeadline>
        </div>
      </div>
      <OfferSeal value="50%" label="Off" size={360} bleed={64} />
    </PostFrame>
  );
}

/** 1:1 dish launch — photo half, copy half. */
function DishLaunchPost({ scale }) {
  return (
    <PostFrame format="post" scale={scale} background="var(--ink-000)" padding={0}>
      <PhotoSlot label="Dish photo 1080×560" style={{ height: 560 }} />
      <div style={{ flex: 1, padding: "var(--canvas-pad)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <DietMark size={30} />
            <SocialHeadline size="overline" on="light" style={{ color: "var(--pink-600)" }}>New On The Menu</SocialHeadline>
          </div>
          <SocialHeadline size="h1" on="light" max="15ch" style={{ marginTop: 24 }}>Masala Cold Brew</SocialHeadline>
          <SocialHeadline size="body" on="light" max="30ch" style={{ marginTop: 20, color: "var(--text-muted)" }}>Cold brew, jaggery, cardamom. Served over one big cube.</SocialHeadline>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <PriceTag amount={220} size="lg" style={{ fontSize: 56 }} />
          <LogoLockup tone="pink" size={200} base={BASE} />
        </div>
      </div>
    </PostFrame>
  );
}

/** 4:5 statement post — the brand's loudest format. */
function StatementPost({ scale }) {
  return (
    <PostFrame format="portrait" scale={scale} background="var(--ink-900)">
      <PatternField tone="ink" tile={96} base={BASE} style={{ position: "absolute", inset: 0 }} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
        <div>
          <SocialHeadline size="overline" on="ink" style={{ color: "var(--pink-300)" }}>Since 2025</SocialHeadline>
          <SocialHeadline size="hero" on="ink" max="11ch" style={{ marginTop: 40 }}>Desi at heart. Urban by nature.</SocialHeadline>
        </div>
        <div style={{ display: "grid", gap: 28 }}>
          <span style={{ height: 2, background: "rgba(255,255,255,.22)" }} />
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32 }}>
            <SocialHeadline size="body" on="ink" max="26ch">100% vegetarian kitchen. 18 spices ground every morning.</SocialHeadline>
            <LogoLockup tone="white" size={240} base={BASE} align="start" />
          </div>
        </div>
      </div>
    </PostFrame>
  );
}

/** 1:1 carousel slide — one menu item per slide, index bottom-right. */
function CarouselSlide({ scale, index = 2, total = 5 }) {
  return (
    <PostFrame format="post" scale={scale} background="var(--pink-50)">
      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 40 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <SocialHeadline size="overline" on="light" style={{ color: "var(--pink-600)" }}>Small Plates</SocialHeadline>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 26, color: "var(--pink-500)" }}>{index}/{total}</span>
        </div>
        <PhotoSlot label="Dish photo 4:3" style={{ flex: 1, borderRadius: 28 }} />
        <div>
          <SocialHeadline size="h2" on="light" max="18ch">Paprikaa Chilli Paneer</SocialHeadline>
          <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 22 }}>
            <PriceTag amount={280} size="lg" style={{ fontSize: 44 }} />
            <SpiceLevel level={3} size={26} />
          </div>
        </div>
      </div>
    </PostFrame>
  );
}
Object.assign(window, { OfferPost, DishLaunchPost, StatementPost, CarouselSlide, PhotoSlot });
