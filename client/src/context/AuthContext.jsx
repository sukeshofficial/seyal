import React, { createContext, useContext, useState, useEffect } from "react";
import { getMe, logoutUser } from "@/services/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // 1. Synchronous check for logout sync (prevents flash of stale content)
    const getLastLogout = () => {
        const timestamp = localStorage.getItem("auth_last_logout");
        return timestamp ? parseInt(timestamp, 10) : 0;
    };

    // Initialize with a check: if we were restored from history after a logout, start in Loading
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Default to loading if we don't have a session marker OR if a global logout happened
    const [isLoading, setIsLoading] = useState(() => {
        const lastLogout = getLastLogout();
        const sessionStarted = sessionStorage.getItem("auth_session_started");

        // If the session was started before the last global logout, we MUST re-validate immediately.
        if (sessionStarted && parseInt(sessionStarted, 10) < lastLogout) {
            return true;
        }
        return true; // Always start in loading for production-grade security
    });

    // Robust re-validation logic
    const checkAuth = async (forceLoading = false) => {
        if (forceLoading) setIsLoading(true);
        try {
            const response = await getMe();
            if (response.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                // Mark when this successful session sync happened
                sessionStorage.setItem("auth_session_started", Date.now().toString());
            } else {
                throw new Error("No session");
            }
        } catch (error) {
            console.warn("Session validation failed:", error.message);
            setUser(null);
            setIsAuthenticated(false);
            sessionStorage.removeItem("auth_session_started");
        } finally {
            setIsLoading(false);
        }
    };

    // Deep synchronization listeners
    useEffect(() => {
        // Initial check
        checkAuth(true);

        // 1. Handle browser back/forward (popstate)
        const handlePopState = () => {
            checkAuth(true); // Always force loading on history change
        };

        // 2. BFcache restoration (pageshow)
        const handlePageShow = (event) => {
            if (event.persisted) {
                checkAuth(true);
            }
        };

        // 3. Pre-emptive cache poisoning (pagehide)
        const handlePageHide = () => {
            // When navigating away, we pre-emptively set state to loading.
            // If the browser snapshots the page now, it will be restored in a loading state.
            setIsLoading(true);
        };

        // 4. Tab focus sync (visibilitychange)
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                checkAuth(false); // Silent sync on focus
            }
        };

        // 5. Handle global unauthorized events from API
        const handleUnauthorized = () => {
            setUser(null);
            setIsAuthenticated(false);
            sessionStorage.removeItem("auth_session_started");
        };

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
    }, []);

    const logout = async () => {
        setIsLoading(true);
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            // Global Logout Sync Marker
            const now = Date.now().toString();
            localStorage.setItem("auth_last_logout", now);
            sessionStorage.removeItem("auth_session_started");

            // Reset state
            setUser(null);
            setIsAuthenticated(false);

            // Clear storage
            localStorage.clear();
            sessionStorage.clear();

            // Re-set the logout marker after clear
            localStorage.setItem("auth_last_logout", now);

            setIsLoading(false);
            window.location.href = "/login"; // Hard redirect
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                setUser,
                setIsAuthenticated,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
