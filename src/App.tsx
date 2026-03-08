import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Login from "@/pages/Login";
import AppLayout from "@/components/layout/AppLayout";

const queryClient = new QueryClient();

function AuthGate() {
  const { currentUser } = useApp();
  return currentUser ? <AppLayout /> : <Login />;
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppProvider>
          <AuthGate />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
