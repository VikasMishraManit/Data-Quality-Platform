import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import RuleManagement from "./pages/RuleManagement";
import RuleExecution from "./pages/RuleExecution";
import Profiling from "./pages/Profiling";
import AssetCatalog from "./pages/AssetCatalog";
import Incidents from "./pages/Incidents";
import LineageExplorer from "./pages/LineageExplorer";
import AnomalyDetection from "./pages/AnomalyDetection";
import CostObservability from "./pages/CostObservability";
import Governance from "./pages/Governance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SidebarProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="rules" element={<RuleManagement />} />
                <Route path="executions" element={<RuleExecution />} />
                <Route path="profiling" element={<Profiling />} />
                <Route path="catalog" element={<AssetCatalog />} />
                <Route path="incidents" element={<Incidents />} />
                <Route path="lineage" element={<LineageExplorer />} />
                <Route path="anomalies" element={<AnomalyDetection />} />
                <Route path="costs" element={<CostObservability />} />
                <Route path="governance" element={<Governance />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
