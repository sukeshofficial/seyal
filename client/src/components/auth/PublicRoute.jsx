import React from "react";

import { Loader2 } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

import { cn } from "@/lib/utils";

const PUBLIC_ROUTE_CONFIG = {
  AUTHENTICATED_REDIRECT: "/",
};

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const STYLES = {
  // Global splash/overlay container
  container: cn(
    "flex h-screen w-screen items-center justify-center",
    "bg-gray-50/50 dark:bg-zinc-950"
  ),

  // Animated assets
  loaderIcon: "h-8 w-8 animate-spin text-zinc-900 dark:text-zinc-50",
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

/**
 * PublicRoute
 * Prevents authenticated users from accessing "public-only" pages 
 * (e.g., Login, Signup, Forgot Password).
 */
const PublicRoute = () => {

  const { isAuthenticated, isLoading } = useAuth();

  /**
   * Standardized loading splash for route transitions.
   * Centralized here to allow global design tweaks without touching logic.
   */
  const routeLoader = (
    <div className={STYLES.container} role="status" aria-live="polite">
      <Loader2 className={STYLES.loaderIcon} />
    </div>
  );

  /* ---------------------------------------------------------------------- */
  /*                                 Actions                                */
  /* ---------------------------------------------------------------------- */

  // 1. Handle session hydration state
  if (isLoading) {
    return routeLoader;
  }

  // 2. Gate logic: If logged in, push to internal dashboard
  // Otherwise, render the requested public view (Outlet)
  return isAuthenticated ? (
    <Navigate to={PUBLIC_ROUTE_CONFIG.AUTHENTICATED_REDIRECT} replace />
  ) : (
    <Outlet />
  );
};

export default PublicRoute;
