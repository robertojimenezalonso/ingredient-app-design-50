import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserConfigProvider } from "./contexts/UserConfigContext";
import InitialWelcomePage from "./pages/InitialWelcomePage";
import WelcomePage from "./pages/WelcomePage";
import CalendarSelectionPage from "./pages/CalendarSelectionPage";
import PeopleAndDietPage from "./pages/PeopleAndDietPage";
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
            <Route path="/" element={<InitialWelcomePage />} />
            <Route path="/welcome" element={<InitialWelcomePage />} />
            <Route path="/calendar-selection" element={<CalendarSelectionPage />} />
            <Route path="/people-and-diet" element={<PeopleAndDietPage />} />
            <Route path="/subscription-benefits" element={<SubscriptionBenefitsPage />} />
            <Route path="/explore" element={<WelcomePage />} />
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
