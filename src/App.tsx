import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserConfigProvider } from "./contexts/UserConfigContext";
import WelcomePage from "./pages/WelcomePage";
import CalendarSelectionPage from "./pages/CalendarSelectionPage";
import SupermarketSelectionPage from "./pages/SupermarketSelectionPage";
import PriceComparisonPage from "./pages/PriceComparisonPage";
import ServingsSelectionPage from "./pages/ServingsSelectionPage";
import SubscriptionTrialPage from "./pages/SubscriptionTrialPage";
import SubscriptionBenefitsPage from "./pages/SubscriptionBenefitsPage";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import CartPage from "./pages/CartPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserConfigProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/calendar-selection" element={<CalendarSelectionPage />} />
            <Route path="/supermarket-selection" element={<SupermarketSelectionPage />} />
            <Route path="/price-comparison" element={<PriceComparisonPage />} />
            <Route path="/servings-selection" element={<ServingsSelectionPage />} />
            <Route path="/subscription-trial" element={<SubscriptionTrialPage />} />
            <Route path="/subscription-benefits" element={<SubscriptionBenefitsPage />} />
            <Route path="/explore" element={<Index />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/recipe/:id" element={<RecipeDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </UserConfigProvider>
  </QueryClientProvider>
);

export default App;
