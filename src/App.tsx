import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useBlockCheck } from "@/hooks/useBlockCheck";
import { AccountDeletedDialog } from "@/components/AccountDeletedDialog";
import { supabase } from "@/integrations/supabase/client";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Movie from "./pages/Movie";
import Admin from "./pages/Admin";
import Browse from "./pages/Browse";
import Genres from "./pages/Genres";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

// Inner app component that uses block check
function AppContent() {
  const { isBlocked, blockReason, isChecking } = useBlockCheck();

  const handleBlockedClose = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/movie/:id" element={<Movie />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/genres" element={<Genres />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>

      <AccountDeletedDialog
        open={isBlocked && !isChecking}
        reason={blockReason || undefined}
        onClose={handleBlockedClose}
      />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
