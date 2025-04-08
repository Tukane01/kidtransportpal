
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseAuthProvider } from "./context/SupabaseAuthContext";
import { AuthProvider } from "./context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import { RideProvider } from "@/context/RideContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import AuthWrapper from "./components/AuthWrapper";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <SupabaseAuthProvider>
          <AuthProvider>
            <UIProvider>
              <RideProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Layout />} />
                  <Route path="/auth" element={<AuthWrapper />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </RideProvider>
            </UIProvider>
          </AuthProvider>
        </SupabaseAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
