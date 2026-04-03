import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("coursepilot_theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("coursepilot_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className={`app-root ${darkMode ? "theme-dark" : "theme-light"}`}>
      <Toaster
        position="top-right"
        theme={darkMode ? "dark" : "light"}
        expand
        richColors
        gap={8}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage
                  darkMode={darkMode}
                  onToggleDarkMode={() => setDarkMode((prev) => !prev)}
                />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
