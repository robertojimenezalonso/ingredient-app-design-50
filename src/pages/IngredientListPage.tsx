import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Calendar, Users } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { useGlobalIngredients } from '@/hooks/useGlobalIngredients';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { AirbnbHeader } from '@/components/AirbnbHeader';
import { IngredientsView } from '@/components/IngredientsView';
import { FloatingButton } from '@/components/FloatingButton';
import { useDateTabs } from '@/hooks/useDateTabs';
import { CategoryType, Recipe } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';

const IngredientListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRecipesByCategory } = useRecipes();
  const { config } = useUserConfig();
  const { showTabs, activeTab: activeTabDate, mealPlan, sectionRefs, scrollToDate } = useDateTabs();
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);

  // Load AI recipes from localStorage when component mounts
  useEffect(() => {
    console.log('IngredientListPage: Component mounted, checking localStorage...');
    const savedAiRecipes = localStorage.getItem('aiGeneratedRecipes');
    console.log('IngredientListPage: localStorage result:', savedAiRecipes ? 'Data found' : 'No data found');
    
    if (savedAiRecipes) {
      try {
        const parsedRecipes = JSON.parse(savedAiRecipes);
        console.log('IngredientListPage: Successfully parsed AI recipes:', parsedRecipes.length, 'recipes');
        console.log('IngredientListPage: Recipe titles:', parsedRecipes.map(r => r.title));
        setAiRecipes(parsedRecipes);
      } catch (error) {
        console.error('IngredientListPage: Error parsing AI recipes from localStorage:', error);
      }
    } else {
      console.log('IngredientListPage: No AI recipes found in localStorage');
    }
  }, []);
  
  const categories: CategoryType[] = [
    'breakfast', 'lunch', 'dinner', 
    'appetizer', 'snacks', 'desserts', 'favorites'
  ];

  // Get recipes from the meal plan - these are the recommended recipes
  const mealPlanRecipes = mealPlan.flatMap(day => 
    day.meals.map(meal => meal.recipe).filter(Boolean)
  );
  
  // Use AI recipes if available, otherwise fall back to meal plan or example recipes
  const recommendedRecipes = aiRecipes.length > 0 
    ? aiRecipes 
    : mealPlanRecipes.length > 0 
      ? mealPlanRecipes 
      : categories.flatMap(category => getRecipesByCategory(category, 3));

  console.log('IngredientListPage: Current recipes state:', {
    aiRecipesCount: aiRecipes.length,
    aiRecipesTitles: aiRecipes.map(r => r.title),
    recommendedRecipesCount: recommendedRecipes.length,
    showingAI: aiRecipes.length > 0
  });

  const { 
    getSelectedIngredientsCount,
    initializeIngredients,
    selectedIngredientIds
  } = useGlobalIngredients();
  
  // Initialize ingredients when recipes load
  useEffect(() => {
    if (recommendedRecipes.length > 0) {
      console.log('IngredientListPage: Initializing ingredients with', recommendedRecipes.length, 'recipes');
      initializeIngredients(recommendedRecipes);
    }
  }, [recommendedRecipes.length, initializeIngredients]);
  
  // Calculate selected ingredients count reactively when selection changes
  const selectedIngredientsCount = useMemo(() => {
    const count = getSelectedIngredientsCount(recommendedRecipes);
    console.log('IngredientListPage: selectedIngredientsCount updated:', count);
    return count;
  }, [getSelectedIngredientsCount, recommendedRecipes, selectedIngredientIds.length]);

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
      
      <div className="bg-white" style={{ paddingTop: '180px', paddingBottom: '80px' }}>
        <IngredientsView recipes={recommendedRecipes} />
      </div>

      <FloatingButton 
        onClick={handleSearchInSupermarket}
        selectedCount={selectedIngredientsCount}
      />
    </div>
  );
};

export default IngredientListPage;