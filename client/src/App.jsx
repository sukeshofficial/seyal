import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";

const DashboardPage = lazy(() => import("./pages/Dashboard"));
const SignupPage = lazy(() => import("./pages/Signup"));
const LoginPage = lazy(() => import("./pages/Login")); // Assuming it exists or will be built
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <div className="app-container">
      <ErrorBoundary>
        <TooltipProvider>
          <Suspense fallback={<div className="loading-fallback">Loading...</div>}>
            <Routes>
              {/* Private Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<DashboardPage />} />
              </Route>

              {/* Public Routes (Redirect if logged in) */}
              <Route element={<PublicRoute />}>
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
