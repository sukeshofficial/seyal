import { Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardPage from "./app/dashboard/page";
import "./App.css";

function App() {
  return (
    <div className="p-6">
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
        </Routes>
      </TooltipProvider>
    </div>
  );
}

export default App;
