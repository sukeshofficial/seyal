import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

const DashboardPage = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <div className="app-container">
      <ErrorBoundary>
        <TooltipProvider>
          <Suspense fallback={<div className="loading-fallback">Loading...</div>}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
