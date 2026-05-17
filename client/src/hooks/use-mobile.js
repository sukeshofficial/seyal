import { useSyncExternalStore, useCallback } from "react";

const BREAKPOINTS = {
  MOBILE: 768,
};

const QUERY = `(max-width: ${BREAKPOINTS.MOBILE - 1}px)`;

/* -------------------------------------------------------------------------- */
/*                               Helper Functions                             */
/* -------------------------------------------------------------------------- */

/**
 * Returns the current match state of the mobile media query.
 * Safe for SSR by checking if window is defined.
 */
const getMobileSnapshot = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia(QUERY).matches;
};

/**
 * Server Snapshot for SSR Hydration.
 * Prevents hydration mismatch by defaulting to a consistent value (usually false).
 */
const getServerSnapshot = () => false;

export function useIsMobile() {
  /**
   * Subscription logic for the external store.
   * Listens for media query changes and notifies React to re-sync.
   */
  const subscribe = useCallback((onStoreChange) => {
    const mql = window.matchMedia(QUERY);

    mql.addEventListener("change", onStoreChange);

    // Cleanup function: essential for performance and preventing memory leaks
    return () => mql.removeEventListener("change", onStoreChange);
  }, []);

  const isMobile = useSyncExternalStore(
    subscribe,
    getMobileSnapshot,
    getServerSnapshot
  );

  return isMobile;
}