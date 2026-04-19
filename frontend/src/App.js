import React from "react";
import "@/App.css";
import "leaflet/dist/leaflet.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Toaster } from "@/components/ui/sonner";
import DashboardPage from "@/pages/DashboardPage";
import ChatPage from "@/pages/ChatPage";
import CostEstimatorPage from "@/pages/CostEstimatorPage";
import HospitalsPage from "@/pages/HospitalsPage";
import SchemesPage from "@/pages/SchemesPage";
import EmergencyPage from "@/pages/EmergencyPage";
import RecordsPage from "@/pages/RecordsPage";
import DiagnosePage from "@/pages/DiagnosePage";
import AyurvedaPage from "@/pages/AyurvedaPage";
import FarmerModePage from "@/pages/FarmerModePage";
import WearablePage from "@/pages/WearablePage";
import MapPage from "@/pages/MapPage";
import LoginPage from "@/pages/LoginPage";
import AuthCallback from "@/pages/AuthCallback";

function Router() {
  const location = useLocation();
  // Handle OAuth callback BEFORE normal routing (session_id is in URL fragment).
  if (location.hash?.includes("session_id=")) return <AuthCallback />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/cost" element={<CostEstimatorPage />} />
        <Route path="/hospitals" element={<HospitalsPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/schemes" element={<SchemesPage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/diagnose" element={<DiagnosePage />} />
        <Route path="/ayurveda" element={<AyurvedaPage />} />
        <Route path="/farmer" element={<FarmerModePage />} />
        <Route path="/wearable" element={<WearablePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Router />
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
