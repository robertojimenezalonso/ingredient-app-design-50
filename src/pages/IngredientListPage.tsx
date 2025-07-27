import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Calendar, Users } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { useGlobalIngredients } from '@/hooks/useGlobalIngredients';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { AirbnbHeader } from '@/components/AirbnbHeader';
import { IngredientsView } from '@/components/IngredientsView';
import { useDateTabs } from '@/hooks/useDateTabs';
import { CategoryType } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';

const IngredientListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRecipesByCategory } = useRecipes();
  const { config } = useUserConfig();
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
    getSelectedIngredientsCount,
    initializeIngredients,
    selectedIngredientIds
  } = useGlobalIngredients();
  
  // Initialize ingredients when recipes load
  useEffect(() => {
    if (recommendedRecipes.length > 0) {
      initializeIngredients(recommendedRecipes);
    }
  }, [recommendedRecipes.length, initializeIngredients]);
  
  // Calculate selected ingredients count - use useState for reactivity
  const [selectedIngredientsCount, setSelectedIngredientsCount] = useState(0);
  
  // Update count when selection changes
  useEffect(() => {
    console.log('IngredientListPage useEffect triggered - selectedIngredientIds size:', selectedIngredientIds.size);
    const count = getSelectedIngredientsCount(recommendedRecipes);
    console.log('IngredientListPage: Updated count:', count, 'from', recommendedRecipes.length, 'recipes');
    setSelectedIngredientsCount(count);
  }, [selectedIngredientIds.size, recommendedRecipes, getSelectedIngredientsCount]);

  const handleFilterChange = (filter: 'receta' | 'ingredientes') => {
    if (filter === 'receta') {
      navigate('/milista');
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
        showTabs={false} /* No tabs in ingredients view */
        activeTab={activeTabDate}
        mealPlan={mealPlan}
        onTabChange={scrollToDate}
        onFilterChange={handleFilterChange}
        currentFilter="ingredientes"
      />
      
      <div className="bg-white" style={{ paddingTop: '180px' }}>
        <IngredientsView recipes={recommendedRecipes} />
      </div>

      {/* Floating Button - Always visible */}
      <div className="fixed bottom-4 left-4 right-4 z-40">
        <button 
          onClick={handleSearchInSupermarket}
          className="w-full bg-black text-white py-4 px-6 rounded-2xl font-medium text-base shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 mb-4"
        >
          <Search className="h-5 w-5" />
          Buscar súper · Ingredientes ({selectedIngredientsCount || 0})
        </button>
      </div>
    </div>
  );
};

export default IngredientListPage;