
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Patients from "./pages/Patients";
import Prescriptions from "./pages/Prescriptions";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AuthService from "./api/services/AuthService";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    // Helps persist authentication across page refreshes
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("pharma_auth_token");
        if (token) {
          // If we have a token, set it in the apiClient
          // This allows the user to stay logged in after refresh
          await AuthService.refreshToken();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        AuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pharmacy-600"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes with layout */}
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="patients" element={<Patients />} />
              <Route path="prescriptions" element={<Prescriptions />} />
                          <Route path="orders" element={<Orders />} />
                          <Route path="reports" element={<div>Reports Page</div>} />
                          <Route path="settings" element={<div>Settings Page</div>} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
