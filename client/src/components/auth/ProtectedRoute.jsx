import React from "react";

import { Loader2 } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const PROTECTED_CONFIG = {
  REDIRECT_PATH: "/login",
  LOADING_TEXT: "Verifying session...",
};

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const STYLES = {
  // Full-screen verification overlay
  container: cn(
    "flex h-screen w-screen items-center justify-center",
    "bg-gray-50/50 dark:bg-zinc-950"
  ),

  // Centered content stack
  contentStack: "flex flex-col items-center gap-4",

  // Animated assets
  loaderIcon: "h-10 w-10 animate-spin text-zinc-900 dark:text-zinc-50",

  // Status typography
  statusText: "text-sm font-medium text-zinc-500 animate-pulse",
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

/**
 * ProtectedRoute
 * Guards routes from unauthenticated access. 
 * Displays a global loading state during initial session hydration.
 */
const ProtectedRoute = () => {

  const { isAuthenticated, isLoading } = useAuth();

  /* ---------------------------------------------------------------------- */
  /*                               Computed UI                              */
  /* ---------------------------------------------------------------------- */

  /**
   * Renders the session verification screen.
   * Accessible status included for screen readers.
   */
  const verificationLoader = (
    <div className={STYLES.container} role="status" aria-live="polite">
      <div className={STYLES.contentStack}>
        <Loader2 className={STYLES.loaderIcon} />

        <p className={STYLES.statusText}>
          {PROTECTED_CONFIG.LOADING_TEXT}
        </p>
      </div>
    </div>
  );

  /* ---------------------------------------------------------------------- */
  /*                                 Actions                                */
  /* ---------------------------------------------------------------------- */

  // Handle initialization state
  if (isLoading) {
    return verificationLoader;
  }

  // Handle authentication gate
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={PROTECTED_CONFIG.REDIRECT_PATH} replace />
  );
};

export default ProtectedRoute;