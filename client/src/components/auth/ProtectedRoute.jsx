import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * Protected Route
 * Redirects to /login if not authenticated
 */
const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-50/50 dark:bg-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-zinc-900 dark:text-zinc-50" />
                    <p className="text-sm font-medium text-zinc-500 animate-pulse">
                        Verifying session...
                    </p>
                </div>
            </div>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
