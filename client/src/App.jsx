import { Routes, Route } from "react-router-dom";
import DashboardPage from "./app/dashboard/page";
import "./App.css";

function App() {
  return (
    <div className="p-6">
      <Routes>
        <Route path="/" element={<DashboardPage />} />
      </Routes>
    </div>
  );
}

export default App;
