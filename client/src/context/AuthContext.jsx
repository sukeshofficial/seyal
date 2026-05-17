import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { getMe, logoutUser } from "@/services/auth.api";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const AUTH_CONFIG = {
  STORAGE_KEYS: {
    LAST_LOGOUT: "auth_last_logout",
    SESSION_STARTED: "auth_session_started",
  },
  REDIRECTS: {
    LOGIN: "/login",
  },
  LOGS: {
    SESSION_FAIL: "Session validation failed:",
    LOGOUT_FAIL: "Logout failed:",
  }
};

/* -------------------------------------------------------------------------- */
/*                               Helper Functions                             */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves the last global logout timestamp.
 */
const getLastLogoutTimestamp = () => {
  const timestamp = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.LAST_LOGOUT);
  return timestamp ? parseInt(timestamp, 10) : 0;
};

/**
 * Determines if the current session was started before the last global logout.
 */
const isSessionStale = () => {
  const lastLogout = getLastLogoutTimestamp();
  const sessionStarted = sessionStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.SESSION_STARTED);

  if (!sessionStarted) return true;
  return parseInt(sessionStarted, 10) < lastLogout;
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(() => isSessionStale());

  /* ---------------------------------------------------------------------- */
  /*                             Computed UI                                */
  /* ---------------------------------------------------------------------- */

  /**
   * Memoized context value to prevent unnecessary re-renders of the entire 
   * component tree when parent components re-render.
   */
  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setIsAuthenticated,
    logout: () => handleLogout(),
  }), [user, isAuthenticated, isLoading]);

  /* ---------------------------------------------------------------------- */
  /*                                Actions                                 */
  /* ---------------------------------------------------------------------- */

  /**
   * Validates the current session against the backend API.
   */
  const checkAuth = useCallback(async (forceLoading = false) => {
    if (forceLoading) setIsLoading(true);

    try {
      const response = await getMe();

      if (response?.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        sessionStorage.setItem(
          AUTH_CONFIG.STORAGE_KEYS.SESSION_STARTED,
          Date.now().toString()
        );
      } else {
        throw new Error("Invalid session response");
      }
    } catch (error) {
      console.warn(AUTH_CONFIG.LOGS.SESSION_FAIL, error.message);
      setUser(null);
      setIsAuthenticated(false);
      sessionStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.SESSION_STARTED);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handles user logout, clears storage, and forces a redirect.
   */
  const handleLogout = useCallback(async () => {
    setIsLoading(true);

    try {
      await logoutUser();
    } catch (error) {
      console.error(AUTH_CONFIG.LOGS.LOGOUT_FAIL, error);
    } finally {
      const logoutTime = Date.now().toString();

      // Clear Auth-Specific markers
      sessionStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.SESSION_STARTED);

      // Clear global storage (preserving logout marker)
      localStorage.clear();
      sessionStorage.clear();

      // Set the sync marker after clearing
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.LAST_LOGOUT, logoutTime);

      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);

      // Hard redirect to clear any residual memory state
      window.location.href = AUTH_CONFIG.REDIRECTS.LOGIN;
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                              Side Effects                              */
  /* ---------------------------------------------------------------------- */

  /**
   * Event Listener Handlers
   */
  const handlePopState = useCallback(() => checkAuth(true), [checkAuth]);

  const handlePageShow = useCallback((event) => {
    if (event.persisted) checkAuth(true);
  }, [checkAuth]);

  const handlePageHide = useCallback(() => setIsLoading(true), []);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") checkAuth(false);
  }, [checkAuth]);

  const handleUnauthorized = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.SESSION_STARTED);
  }, []);

  /**
   * Synchronization Listeners (BFcache, Tab Focus, and Global Events)
   */
  useEffect(() => {
    checkAuth(true);

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [
    checkAuth,
    handlePopState,
    handlePageShow,
    handlePageHide,
    handleVisibilityChange,
    handleUnauthorized
  ]);

  /* ---------------------------------------------------------------------- */
  /*                                 Return                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * Consumes the AuthContext with built-in safety check.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};