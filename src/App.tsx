import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import AIMentor from "./pages/AIMentor";
import Profile from "./pages/Profile";
import Trade from "./pages/Trade";
import TransactionHistory from "./pages/TransactionHistory"; // Import the new TransactionHistory page
import { SessionContextProvider } from "./contexts/SessionContext";
import AuthGuard from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SessionContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<AuthGuard />}>
              <Route index element={<Dashboard />} /> {/* Default authenticated route */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/ai-mentor" element={<AIMentor />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/trade" element={<Trade />} />
              <Route path="/transactions" element={<TransactionHistory />} /> {/* Add the new TransactionHistory route */}
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SessionContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;