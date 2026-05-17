import React, { useMemo } from "react";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const BRAND_CONFIG = {
  backgroundImageUrl:
    "https://res.cloudinary.com/ddo5ryeor/image/upload/q_auto/f_auto/v1778739585/gargantua-endurance-3840x2160-25445.jpg_lgtwtr.jpg",
  logoUrl: "/SEYAL-LOGO.svg",
  features: [
    { label: "Community", value: "Join 10k+ devs" },
    { label: "Resources", value: "500+ Projects" },
  ],
  quote: {
    text: "The best way to predict the future is to build it. Joining SEYAL was the first step in my developer journey.",
    author: "Sukesh D, Founder of SEYAL",
  },
};

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const STYLES = {
  // Layout
  container: "relative hidden h-full overflow-hidden bg-muted p-8 text-white lg:flex lg:flex-col",

  // Atmospheric Background Layers
  backgroundWrapper: "pointer-events-none absolute inset-0 z-0",
  bgImage: "h-full w-full scale-105 object-cover opacity-60",
  cinematicOverlay: "absolute inset-0 bg-zinc-950/40",
  depthVignette: "absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(9,9,11,0.8)_100%)]",
  readabilityShield: "absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-zinc-950/80 via-zinc-950/40 to-transparent",
  identityTint: "absolute inset-0 bg-indigo-950/15 mix-blend-color",
  atmosphericGlow: "absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-orange-500/[0.03] to-transparent blur-3xl",

  // Brand Header
  header: "relative z-20 flex items-center gap-3 text-xl font-bold tracking-tight",
  logoContainer: "h-9 w-9 overflow-hidden rounded-full bg-white p-1.5 shadow-xl shadow-white/10 ring-1 ring-white/20",
  logoImg: "h-full w-full object-contain",
  brandText: "bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent",

  // Hero Section
  main: "relative z-20 mt-auto",
  heroWrapper: "max-w-sm space-y-3",
  heroTitle: "text-4xl font-bold leading-[1.1] tracking-tighter",
  heroHighlight: "text-indigo-400",
  heroDescription: "text-lg font-medium leading-relaxed text-zinc-400",

  // Features Grid
  featuresContainer: "mt-8 flex gap-6",
  featureItem: "flex flex-col gap-1",
  featureLabel: "text-[10px] font-bold uppercase tracking-widest text-zinc-500",
  featureValue: "text-xs font-medium text-zinc-300",
  featureDivider: "h-8 w-px bg-zinc-800",

  // Quote Footer
  footer: "relative z-20 mt-auto border-t border-white/5 pt-8",
  quoteWrapper: "space-y-5",
  quoteText: "text-[14px] italic text-zinc-400",
  quoteCite: "text-xs font-semibold not-italic text-zinc-500",
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

/**
 * AuthBranding
 * Displays the high-impact visual side-panel for authentication screens.
 * Incorporates multiple atmospheric layers and brand messaging.
 */
const AuthBranding = () => {
  /* ---------------------------------------------------------------------- */
  /*                               Computed UI                              */
  /* ---------------------------------------------------------------------- */

  /**
   * Renders the complex stack of background overlays to create 
   * the cinematic "Gargantua" effect.
   */
  const atmosphericBackground = useMemo(() => (
    <div className={STYLES.backgroundWrapper} aria-hidden="true">
      <img
        src={BRAND_CONFIG.backgroundImageUrl}
        alt=""
        className={STYLES.bgImage}
      />
      <div className={STYLES.cinematicOverlay} />
      <div className={STYLES.depthVignette} />
      <div className={STYLES.readabilityShield} />
      <div className={STYLES.identityTint} />
      <div className={STYLES.atmosphericGlow} />
    </div>
  ), []);

  const brandingHeader = (
    <header className={STYLES.header}>
      <div className={STYLES.logoContainer}>
        <img
          src={BRAND_CONFIG.logoUrl}
          alt="SEYAL Logo"
          className={STYLES.logoImg}
        />
      </div>
      <span className={STYLES.brandText}>SEYAL</span>
    </header>
  );

  const heroContent = (
    <div className={STYLES.heroWrapper}>
      <h1 className={STYLES.heroTitle}>
        Build. Learn.
        <br />
        <span className={STYLES.heroHighlight}>Create.</span>
      </h1>
      <p className={STYLES.heroDescription}>
        SEYAL helps developers build, collaborate, and grow
        together in the most modern ecosystem.
      </p>
    </div>
  );

  const featuresList = (
    <div className={STYLES.featuresContainer}>
      {BRAND_CONFIG.features.map((feature, index) => (
        <React.Fragment key={feature.label}>
          <div className={STYLES.featureItem}>
            <span className={STYLES.featureLabel}>{feature.label}</span>
            <span className={STYLES.featureValue}>{feature.value}</span>
          </div>
          {index < BRAND_CONFIG.features.length - 1 && (
            <div className={STYLES.featureDivider} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const quoteFooter = (
    <footer className={STYLES.footer}>
      <blockquote className={STYLES.quoteWrapper}>
        <p className={STYLES.quoteText}>
          &ldquo;{BRAND_CONFIG.quote.text}&rdquo;
        </p>
        <cite className={STYLES.quoteCite}>
          — {BRAND_CONFIG.quote.author}
        </cite>
      </blockquote>
    </footer>
  );

  return (
    <div className={STYLES.container}>
      {atmosphericBackground}

      {brandingHeader}

      <main className={STYLES.main}>
        {heroContent}
        {featuresList}
      </main>

      {quoteFooter}
    </div>
  );
};

export default AuthBranding;
