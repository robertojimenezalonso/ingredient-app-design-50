
import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserConfigProvider } from "./contexts/UserConfigContext";
import { BottomNav } from "@/components/BottomNav";
import InitialWelcomePage from "./pages/InitialWelcomePage";
import RecipeListPage from "./pages/RecipeListPage";
import SearchOffersPage from "./pages/SearchOffersPage";
import CalendarSelectionPage from "./pages/CalendarSelectionPage";
import PeopleAndDietPage from "./pages/PeopleAndDietPage";
import SubscriptionBenefitsPage from "./pages/SubscriptionBenefitsPage";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import CartPage from "./pages/CartPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import SupermarketDetailPage from "./pages/SupermarketDetailPage";
import { CambioRecetaPage } from "./pages/CambioRecetaPage";
import RecipeBankAdminPage from "./pages/RecipeBankAdminPage";
import { DailySummaryPage } from "./pages/DailySummaryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [activeTab, setActiveTab] = useState<'explore' | 'lists' | 'profile'>('explore');

  const handleTabChange = (tab: 'explore' | 'lists' | 'profile') => {
    setActiveTab(tab);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <UserConfigProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background pb-20">
              <Routes>
                <Route path="/bienvenida" element={<InitialWelcomePage />} />
                <Route path="/" element={<Index />} />
                <Route path="/calendar-selection" element={<CalendarSelectionPage />} />
                <Route path="/people-and-diet" element={<PeopleAndDietPage />} />
                <Route path="/subscription-benefits" element={<SubscriptionBenefitsPage />} />
                <Route path="/milista" element={<RecipeListPage />} />
                <Route path="/search-offers" element={<SearchOffersPage />} />
                <Route path="/supermarket/:supermarket" element={<SupermarketDetailPage />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                <Route path="/recipe/:id" element={<RecipeDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/cambioReceta" element={<CambioRecetaPage />} />
                <Route path="/recipe-bank-admin" element={<RecipeBankAdminPage />} />
                <Route path="/recipe-table" element={<DailySummaryPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </UserConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
