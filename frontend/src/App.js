import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
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

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/cost" element={<CostEstimatorPage />} />
            <Route path="/hospitals" element={<HospitalsPage />} />
            <Route path="/schemes" element={<SchemesPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/records" element={<RecordsPage />} />
            <Route path="/diagnose" element={<DiagnosePage />} />
            <Route path="/ayurveda" element={<AyurvedaPage />} />
            <Route path="/farmer" element={<FarmerModePage />} />
          </Routes>
        </Layout>
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </AppProvider>
  );
}
