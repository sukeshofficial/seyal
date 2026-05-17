import React from "react";

import { Shield } from "lucide-react";
import { Toaster } from "react-hot-toast";

import LightRays from "../ui/LightRays";
import AuthBranding from "./AuthBranding";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

/**
 * Configuration for the global notification system.
 * Centralized here to maintain visual consistency across all auth flows.
 */
const TOASTER_CONFIG = {
  position: "top-center",
  toastOptions: {
    className: cn(
      "dark:bg-zinc-900 dark:text-zinc-100",
      "border border-white/5 shadow-2xl backdrop-blur-xl"
    ),
    style: {
      maxWidth: "450px",
      padding: "12px 24px",
      fontSize: "0.875rem",
      fontWeight: "500",
      borderRadius: "9999px",
      background: "rgba(9, 9, 11, 0.9)",
      color: "#fff",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
    success: {
      iconTheme: {
        primary: "#4f46e5",
        secondary: "#fff",
      },
    },
  },
};

const LIGHT_RAYS_PROPS = {
  raysOrigin: "top-center",
  raysColor: "#6366f1",
  raysSpeed: 0.8,
  lightSpread: 0.7,
  rayLength: 1.5,
  followMouse: true,
  mouseInfluence: 0.2,
};

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const STYLES = {
  // Main Layout Grid
  layoutContainer: cn(
    "relative grid h-[100dvh] max-h-screen overflow-hidden bg-zinc-950",
    "lg:grid-cols-[4fr_6fr]"
  ),

  // Background Decorations
  backgroundLayer: "pointer-events-none absolute inset-0 z-0 opacity-40 md:pl-125",

  // Content Sections
  brandingSidebar: "relative z-10",
  formWrapper: "relative z-10 flex flex-col items-center overflow-hidden p-4 lg:px-8 lg:py-6",

  // Mobile UI
  mobileHeader: "mt-2 mb-6 flex shrink-0 items-center gap-3 lg:hidden",
  logoContainer: cn(
    "h-9 w-9 overflow-hidden rounded-xl bg-white p-1.5",
    "shadow-xl shadow-white/5 ring-1 ring-white/10"
  ),
  logoImage: "h-full w-full object-contain",
  brandTitle: "text-xl font-bold tracking-tight text-white",

  // Main Viewport
  mainContent: cn(
    "my-auto w-full max-w-[720px] overflow-y-auto py-4 scrollbar-hide",
    "animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150"
  ),

  // Footer / Compliance
  footer: cn(
    "flex shrink-0 items-center justify-center py-4",
    "animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500"
  ),
  footerBadge: cn(
    "group flex items-center gap-2 rounded-full border border-white/5",
    "bg-white/[0.03] px-3 py-1.5 shadow-inner backdrop-blur-sm",
    "transition-all duration-300 hover:border-white/10 hover:bg-white/[0.05]"
  ),
  footerIcon: "h-3 w-3 text-green-400 opacity-50 transition-opacity group-hover:opacity-100",
  footerText: cn(
    "text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500",
    "transition-colors group-hover:text-zinc-400"
  ),
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

/**
 * AuthLayout
 * Provides a standardized split-screen layout for all authentication pages.
 * Handles branding, global notifications, and background animations.
 */
const AuthLayout = ({ children }) => {
  /* ---------------------------------------------------------------------- */
  /*                               Computed UI                              */
  /* ---------------------------------------------------------------------- */

  const backgroundEffects = (
    <div className={STYLES.backgroundLayer}>
      <LightRays {...LIGHT_RAYS_PROPS} />
    </div>
  );

  const mobileBranding = (
    <header className={STYLES.mobileHeader}>
      <div className={STYLES.logoContainer}>
        <img
          src="/SEYAL-LOGO.svg"
          alt="SEYAL Logo"
          className={STYLES.logoImage}
        />
      </div>
      <span className={STYLES.brandTitle}>SEYAL</span>
    </header>
  );

  const securityFooter = (
    <footer className={STYLES.footer}>
      <div className={STYLES.footerBadge}>
        <Shield className={STYLES.footerIcon} />
        <span className={STYLES.footerText}>
          Securely encrypted by SEYAL Shield
        </span>
      </div>
    </footer>
  );

  return (
    <div className={STYLES.layoutContainer}>
      {backgroundEffects}

      <Toaster
        position={TOASTER_CONFIG.position}
        toastOptions={TOASTER_CONFIG.toastOptions}
      />

      {/* Left Column: Branding / Marketing */}
      <aside className={STYLES.brandingSidebar}>
        <AuthBranding />
      </aside>

      {/* Right Column: Interactive Content */}
      <div className={STYLES.formWrapper}>
        {mobileBranding}

        <main className={STYLES.mainContent}>
          {children}
        </main>

        {securityFooter}
      </div>
    </div>
  );
};

export default AuthLayout;
