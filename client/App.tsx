import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import KYCSubmission from "./pages/KYCSubmission";
import KYCVerification from "./pages/KYCVerification";
import KYCHistory from "./pages/KYCHistory";
import Auth from "./pages/Auth";
import AdminKYC from "./pages/AdminKYC";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import BlockchainExplorer from "./pages/BlockchainExplorer";
import PortalSelector from "./pages/PortalSelector";
import UserAuth from "./pages/UserAuth";
import PrincipalAuth from "./pages/PrincipalAuth";
import BankerAuth from "./pages/BankerAuth";
import ITAuth from "./pages/ITAuth";
import MedicalAuth from "./pages/MedicalAuth";
import GovernmentAuth from "./pages/GovernmentAuth";
import UserDashboard from "./pages/UserDashboard";
import PrincipalDashboard from "./pages/PrincipalDashboard";
import BankerDashboard from "./pages/BankerDashboard";
import ITDashboard from "./pages/ITDashboard";
import MedicalDashboard from "./pages/MedicalDashboard";
import GovernmentDashboard from "./pages/GovernmentDashboard";
import MyIdentity from "./pages/MyIdentity";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/submit" element={<KYCSubmission />} />
          <Route path="/verify" element={<KYCVerification />} />
          <Route path="/history" element={<KYCHistory />} />
          <Route path="/auth/:mode" element={<Auth />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminKYC />} />
          <Route path="/blockchain-explorer" element={<BlockchainExplorer />} />
          
          <Route path="/portal" element={<PortalSelector />} />
          <Route path="/auth/user" element={<UserAuth />} />
          <Route path="/auth/principal" element={<PrincipalAuth />} />
          <Route path="/auth/banker" element={<BankerAuth />} />
          <Route path="/auth/it" element={<ITAuth />} />
          <Route path="/auth/medical" element={<MedicalAuth />} />
          <Route path="/auth/government" element={<GovernmentAuth />} />

          <Route path="/dashboard/user" element={<ProtectedRoute allowedRole="user"><UserDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/principal" element={<ProtectedRoute allowedRole="principal"><PrincipalDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/banker" element={<ProtectedRoute allowedRole="banker"><BankerDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/it" element={<ProtectedRoute allowedRole="it_officer"><ITDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/medical" element={<ProtectedRoute allowedRole="medical_officer"><MedicalDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/government" element={<ProtectedRoute allowedRole="government_official"><GovernmentDashboard /></ProtectedRoute>} />
          
          <Route path="/my-identity" element={<ProtectedRoute allowedRole="user"><MyIdentity /></ProtectedRoute>} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
