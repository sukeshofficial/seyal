import React, { useCallback } from "react";

import { GitHubLogoIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const AUTH_PROVIDERS = {
  GOOGLE: `${API_BASE_URL}/auth/google`,
  GITHUB: `${API_BASE_URL}/auth/github`,
};

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const STYLES = {
  container: "grid gap-3",
  buttonGrid: "grid grid-cols-2 gap-3",
  socialButton: cn(
    "bg-zinc-900 border border-zinc-700 hover:border-zinc-600",
    "text-zinc-200 transition-all rounded-full h-10 text-xs font-semibold"
  ),
  iconBase: "h-4 w-4 mr-2",
  dividerContainer: "relative flex items-center gap-3",
  dividerLine: "flex-1 h-px bg-zinc-800",
  dividerText: "text-[10px] font-bold uppercase tracking-widest text-zinc-600",
};

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

/**
 * Google Brand Icon Component
 */
const GoogleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

/**
 * SocialAuth Component
 * Handles OAuth redirection for Google and GitHub providers.
 */
const SocialAuth = () => {
  /* ---------------------------------------------------------------------- */
  /*                                 Actions                                */
  /* ---------------------------------------------------------------------- */

  const initiateOAuth = useCallback((url) => {
    window.location.href = url;
  }, []);

  const handleGoogleLogin = useCallback(() => {
    initiateOAuth(AUTH_PROVIDERS.GOOGLE);
  }, [initiateOAuth]);

  const handleGithubLogin = useCallback(() => {
    initiateOAuth(AUTH_PROVIDERS.GITHUB);
  }, [initiateOAuth]);

  /* ---------------------------------------------------------------------- */
  /*                               Computed UI                              */
  /* ---------------------------------------------------------------------- */

  const divider = (
    <div className={STYLES.dividerContainer}>
      <div className={STYLES.dividerLine} aria-hidden="true" />
      <span className={STYLES.dividerText}>or continue with</span>
      <div className={STYLES.dividerLine} aria-hidden="true" />
    </div>
  );

  return (
    <div className={STYLES.container}>
      <div className={STYLES.buttonGrid}>
        {/* Google Provider */}
        <Button
          variant="ghost"
          type="button"
          onClick={handleGoogleLogin}
          className={STYLES.socialButton}
          aria-label="Continue with Google"
        >
          <GoogleIcon className={STYLES.iconBase} />
          Google
        </Button>

        {/* GitHub Provider */}
        <Button
          variant="ghost"
          type="button"
          onClick={handleGithubLogin}
          className={STYLES.socialButton}
          aria-label="Continue with GitHub"
        >
          <GitHubLogoIcon className={STYLES.iconBase} />
          GitHub
        </Button>
      </div>

      {divider}
    </div>
  );
};

export default SocialAuth;
