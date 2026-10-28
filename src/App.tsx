import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useState } from "react";
import Index from "./pages/Index";
import TeamPage from "./pages/TeamPage";
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage";
import ArticlePage from "./pages/ArticlePage";
import NotFound from "./pages/NotFound";
import LoadingScreen from "./components/LoadingScreen";

// O painel (com o editor de texto) só é carregado por quem entra nele.
const PainelPage = lazy(() => import("./pages/painel/PainelPage"));

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {isLoading && <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/equipe" element={<TeamPage />} />
            <Route path="/quem-somos" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route
              path="/blog/painel/*"
              element={
                <Suspense fallback={<div className="min-h-screen bg-muted" />}>
                  <PainelPage />
                </Suspense>
              }
            />
            <Route path="/blog/:slug" element={<ArticlePage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
