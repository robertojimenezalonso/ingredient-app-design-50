import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Calendar, Users } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { useGlobalIngredients } from '@/hooks/useGlobalIngredients';
import { useCart } from '@/hooks/useCart';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { AirbnbHeader } from '@/components/AirbnbHeader';
import { CategoryCarousel } from '@/components/CategoryCarousel';
import { IngredientsView } from '@/components/IngredientsView';
import { useDateTabs } from '@/hooks/useDateTabs';

import { Recipe, CategoryType } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRecipesByCategory } = useRecipes();
  const { addToCart, cart } = useCart();
  const { config } = useUserConfig();
  const [activeTab, setActiveTab] = useState<'explore' | 'cart' | 'recipes' | 'profile'>('explore');
  const [selectedFilter, setSelectedFilter] = useState<'receta' | 'ingredientes'>('receta');
  const { showTabs, activeTab: activeTabDate, mealPlan, sectionRefs, scrollToDate } = useDateTabs();
  
  const categories: CategoryType[] = [
    'breakfast', 'lunch', 'dinner', 
    'appetizer', 'snacks', 'desserts', 'favorites'
  ];

  // Get recipes from the meal plan - these are the recommended recipes
  const mealPlanRecipes = mealPlan.flatMap(day => 
    day.meals.map(meal => meal.recipe).filter(Boolean)
  );
  
  // If no meal plan, show some default recipes for exploration
  const recommendedRecipes = mealPlanRecipes.length > 0 
    ? mealPlanRecipes 
    : categories.flatMap(category => getRecipesByCategory(category, 3));

  const { 
    getGroupedIngredients, 
    getSelectedIngredientsCount,
    initializeIngredients 
  } = useGlobalIngredients();
  
  // Initialize ingredients when recipes load
  useEffect(() => {
    if (recommendedRecipes.length > 0) {
      initializeIngredients(recommendedRecipes);
    }
  }, [recommendedRecipes.length, initializeIngredients]);
  
  // Calculate selected ingredients count with memoization
  const selectedIngredientsCount = useMemo(() => {
    return getSelectedIngredientsCount(recommendedRecipes);
  }, [getSelectedIngredientsCount, recommendedRecipes]);

  const handleAddRecipe = (recipe: Recipe) => {
    const selectedIngredients = recipe.ingredients.map(ing => ing.id);
    addToCart(recipe, recipe.servings, selectedIngredients);
    toast({
      title: "Receta añadida",
      description: `${recipe.title} añadida a favoritos`
    });
  };

  const handleRecipeClick = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleViewAll = (category: CategoryType) => {
    navigate(`/category/${category}`);
  };

  const handleTabChange = (tab: 'explore' | 'cart' | 'recipes' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'profile') {
      navigate('/profile');
    } else if (tab === 'cart') {
      navigate('/cart');
    }
  };

  const handleSearchInSupermarket = () => {
    toast({
      title: "Buscar en supermercado",
      description: "Función próximamente disponible"
    });
  };

  const daysText = config.selectedDates?.length 
    ? `${config.selectedDates.length} día${config.selectedDates.length > 1 ? 's' : ''}`
    : '0 días';
    
  const servingsText = `${config.servingsPerRecipe || 1} ración${(config.servingsPerRecipe || 1) > 1 ? 'es' : ''}`;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with back button */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200/50">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => {
              console.log('Setting showSavedConfig flag and navigating to /');
              // Set flag to show saved configuration when returning to Explorer
              localStorage.setItem('showSavedConfig', 'true');
              navigate('/');
            }}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-foreground">Mi lista de la compra</h1>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="h-4 w-4" />
              <span>{daysText}</span>
              <span>•</span>
              <Users className="h-4 w-4" />
              <span>{servingsText}</span>
            </div>
          </div>
          
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      <AirbnbHeader 
        showTabs={showTabs && selectedFilter === 'receta'}
        activeTab={activeTabDate}
        mealPlan={mealPlan}
        onTabChange={scrollToDate}
        onFilterChange={setSelectedFilter}
        currentFilter={selectedFilter}
      />
      
      <div className="bg-white" style={{ paddingTop: '180px' }}>
        {selectedFilter === 'receta' ? (
          /* Show recommended recipes from meal plan */
          <CategoryCarousel
            category="trending"
            recipes={recommendedRecipes}
            onAddRecipe={handleAddRecipe}
            onRecipeClick={handleRecipeClick}
            onViewAll={handleViewAll}
            sectionRefs={sectionRefs}
          />
        ) : (
          <IngredientsView recipes={recommendedRecipes} />
        )}
      </div>

      {/* Floating Button - Always visible */}
      <div className="fixed bottom-4 left-4 right-4 z-40">
        <button 
          onClick={handleSearchInSupermarket}
          className="w-full bg-black text-white py-4 px-6 rounded-2xl font-medium text-base shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 mb-4"
        >
          <Search className="h-5 w-5" />
          Buscar súper · Ingredientes ({selectedIngredientsCount})
        </button>
      </div>

    </div>
  );
};
export default WelcomePage;