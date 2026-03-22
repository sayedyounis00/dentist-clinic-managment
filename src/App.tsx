import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Login from "@/pages/Login";
import ClinicSetup from "@/pages/ClinicSetup";
import DoctorRegistration from "@/pages/DoctorRegistration";
import AppLayout from "@/components/layout/AppLayout";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function AuthGate() {
  const { clinicId, clinicName, setClinic, currentUser, loading, hasDoctor } = useApp();

  if (!clinicId) {
    return <ClinicSetup onClinicCreated={(id, name) => setClinic(id, name)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasDoctor) {
    return (
      <DoctorRegistration
        clinicId={clinicId}
        clinicName={clinicName}
        onDoctorCreated={() => window.location.reload()}
      />
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  return <AppLayout />;
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
