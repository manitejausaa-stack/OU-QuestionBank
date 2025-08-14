import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import PublicHome from "@/pages/public-home";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminLoginPage from "./pages/AdminLoginPage";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin" component={AdminDashboard} /> {/* Admin route is now always present */}
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={PublicHome} />

      ) : (
        <Route path="/" component={PublicHome} />
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}


export default App;
