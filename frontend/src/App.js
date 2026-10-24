import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { getToken } from "./lib/api";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import UsersPage from "./pages/Users";
import Logs from "./pages/Logs";
import Settings from "./pages/Settings";
import Versions from "./pages/Versions";

function RequireAuth({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

function AppToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      position="top-right"
      toastOptions={{
        style: {
          background: "hsl(var(--surface))",
          border: "1px solid hsl(var(--border))",
          color: "hsl(var(--foreground))",
          fontFamily: "Satoshi, sans-serif",
        },
      }}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppToaster />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth><Overview /></RequireAuth>} />
          <Route path="/users" element={<RequireAuth><UsersPage /></RequireAuth>} />
          <Route path="/logs" element={<RequireAuth><Logs /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/versions" element={<RequireAuth><Versions /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
