const { PostFrame, PatternField, SocialHeadline, LogoLockup, OfferSeal, CouponTicket, Logo, Button, ProgressBar } = window.PinkPaprikaaDesignSystem_23ef63;
const AD_BASE = "../../assets";

/** 9:16 story — offer with a coupon stub, inside the chrome safe area. */
function OfferStory({ scale, safeArea }) {
  return (
    <PostFrame format="story" scale={scale} background="var(--pink-500)" safeArea={safeArea} padding={0}>
      <PatternField tone="brand" tile={112} base={AD_BASE} style={{ position: "absolute", inset: 0 }} />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "var(--story-safe-top) var(--canvas-pad) var(--story-safe-bottom)" }}>
        <div>
          <SocialHeadline size="overline" on="brand">First Order</SocialHeadline>
          <SocialHeadline size="hero" on="brand" max="10ch" style={{ marginTop: 32 }}>Half off, on us.</SocialHeadline>
        </div>
        <CouponTicket width={880} tone="light" base={AD_BASE} notchColor="var(--pink-500)" headline="50% off your first order" code="PAPRIKAA50" terms="One use per guest. Dine-in and pickup. Till 30 Sep." />
        <LogoLockup tone="white" size={280} base={AD_BASE} align="center" />
      </div>
    </PostFrame>
  );
}

/** 9:16 story — dish with a swipe-up prompt. */
function DishStory({ scale, safeArea }) {
  return (
    <PostFrame format="story" scale={scale} background="var(--ink-900)" safeArea={safeArea} padding={0}>
      <div style={{ height: 1100, background: "var(--pink-100)", display: "grid", placeItems: "center" }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--pink-400)" }}>Dish photo 1080×1100</span>
      </div>
      <div style={{ flex: 1, padding: "56px var(--canvas-pad) var(--story-safe-bottom)", display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: 28 }}>
        <SocialHeadline size="overline" on="ink" style={{ color: "var(--pink-300)" }}>On The Tandoor</SocialHeadline>
        <SocialHeadline size="h1" on="ink" max="13ch">Tandoori Paneer Bowl</SocialHeadline>
        <SocialHeadline size="body" on="ink" max="28ch">Charred paneer, burnt garlic rice, pickled slaw. ₹420.</SocialHeadline>
        <div style={{ marginTop: 12 }}><LogoLockup tone="white" size={220} base={AD_BASE} /></div>
      </div>
    </PostFrame>
  );
}

/** 1200×628 link / OG image. */
function LinkBanner({ scale }) {
  return (
    <PostFrame format="landscape" scale={scale} background="var(--pink-100)" padding={56}>
      <div style={{ display: "flex", height: "100%", gap: 48, alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 0, display: "grid", gap: 24 }}>
          <SocialHeadline size="overline" on="soft">India&rsquo;s First Desi Urban Café</SocialHeadline>
          <SocialHeadline size="h2" on="soft" max="16ch">One kitchen. One grinder.</SocialHeadline>
          <LogoLockup tone="pink" size={220} base={AD_BASE} />
        </div>
        <div style={{ width: 380, height: "100%", borderRadius: 24, background: "var(--pink-200)", display: "grid", placeItems: "center" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--pink-700)", textAlign: "center", padding: 20 }}>Photo 380×516</span>
        </div>
      </div>
    </PostFrame>
  );
}

/** 728×90 leaderboard. */
function Leaderboard({ scale }) {
  return (
    <PostFrame format="leaderboard" scale={scale} background="var(--pink-500)" padding={0}>
      <PatternField tone="brand" tile={44} base={AD_BASE} style={{ position: "absolute", inset: 0 }} />
      <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", gap: 18, padding: "0 18px" }}>
        <Logo base={AD_BASE} tone="white" height={44} />
        <span style={{ width: 1, height: 40, background: "rgba(255,255,255,.3)" }} />
        <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, letterSpacing: "-.02em", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>50% off your first order</span>
        <Button on="brand" size="sm">Order Now</Button>
      </div>
    </PostFrame>
  );
}

/** 300×250 MPU. */
function Mpu({ scale }) {
  return (
    <PostFrame format="mpu" scale={scale} background="var(--ink-900)" padding={0}>
      <PatternField tone="ink" tile={40} base={AD_BASE} style={{ position: "absolute", inset: 0 }} />
      <div style={{ position: "relative", height: "100%", padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <Logo base={AD_BASE} tone="white" height={40} />
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, lineHeight: 1.05, letterSpacing: "-.025em", color: "#fff", textWrap: "balance" }}>Chai first, decisions later.</span>
        <Button size="sm" fullWidth>Order Now</Button>
        <OfferSeal value="50%" label="Off" size={110} bleed={20} />
      </div>
    </PostFrame>
  );
}
Object.assign(window, { OfferStory, DishStory, LinkBanner, Leaderboard, Mpu });
