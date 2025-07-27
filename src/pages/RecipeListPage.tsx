import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Calendar, Users, Sparkles } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { useGlobalIngredients } from '@/hooks/useGlobalIngredients';
import { useCart } from '@/hooks/useCart';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { useAIRecipes } from '@/hooks/useAIRecipes';
import { AirbnbHeader } from '@/components/AirbnbHeader';
import { CategoryCarousel } from '@/components/CategoryCarousel';
import { useDateTabs } from '@/hooks/useDateTabs';
import { Recipe, CategoryType } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const RecipeListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRecipesByCategory } = useRecipes();
  const { addToCart } = useCart();
  const { config } = useUserConfig();
  const { generateMultipleRecipes, isGenerating } = useAIRecipes();
  const { showTabs, activeTab: activeTabDate, mealPlan, sectionRefs, scrollToDate } = useDateTabs();
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);
  
  const categories: CategoryType[] = [
    'breakfast', 'lunch', 'dinner', 
    'appetizer', 'snacks', 'desserts', 'favorites'
  ];

  // Get recipes from the meal plan - these are the recommended recipes
  const mealPlanRecipes = mealPlan.flatMap(day => 
    day.meals.map(meal => meal.recipe).filter(Boolean)
  );
  
  // Combine AI recipes with meal plan or default recipes
  const defaultRecipes = mealPlanRecipes.length > 0 
    ? mealPlanRecipes 
    : categories.flatMap(category => getRecipesByCategory(category, 3));
  
  const recommendedRecipes = [...aiRecipes, ...defaultRecipes];

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
    console.log('RecipeListPage useEffect triggered - selectedIngredientIds length:', selectedIngredientIds.length);
    const count = getSelectedIngredientsCount(recommendedRecipes);
    console.log('RecipeListPage: Updated count:', count, 'from', recommendedRecipes.length, 'recipes');
    setSelectedIngredientsCount(count);
  }, [selectedIngredientIds.join(','), recommendedRecipes, getSelectedIngredientsCount]);

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

  const handleFilterChange = (filter: 'receta' | 'ingredientes') => {
    if (filter === 'ingredientes') {
      navigate('/ingredientes');
    }
  };

  const handleGenerateAIRecipes = async () => {
    if (!config.selectedDates || !config.selectedMeals || !config.servingsPerRecipe) {
      toast({
        title: "Información incompleta",
        description: "Asegúrate de haber completado la configuración desde el calendario y personas."
      });
      return;
    }

    const recipes = await generateMultipleRecipes({
      people: config.servingsPerRecipe,
      days: config.selectedDates,
      meals: config.selectedMeals,
      restrictions: [] // TODO: Add diet restrictions from user config
    }, 6);

    setAiRecipes(recipes);
    
    // Add AI recipes to cart automatically
    recipes.forEach(recipe => {
      const selectedIngredients = recipe.ingredients.map(ing => ing.id);
      addToCart(recipe, recipe.servings, selectedIngredients);
    });
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
        showTabs={showTabs}
        activeTab={activeTabDate}
        mealPlan={mealPlan}
        onTabChange={scrollToDate}
        onFilterChange={handleFilterChange}
        currentFilter="receta"
      />
      
      <div className="bg-white" style={{ paddingTop: '180px' }}>
        {/* AI Recipe Generation Button */}
        {aiRecipes.length === 0 && config.hasPlanningSession && (
          <div className="px-4 pb-6">
            <Button 
              onClick={handleGenerateAIRecipes}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-primary to-primary/80 text-white"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {isGenerating ? 'Generando recetas con IA...' : 'Generar recetas personalizadas con IA'}
            </Button>
          </div>
        )}

        <CategoryCarousel
          category="trending"
          recipes={recommendedRecipes}
          onAddRecipe={handleAddRecipe}
          onRecipeClick={handleRecipeClick}
          onViewAll={handleViewAll}
          sectionRefs={sectionRefs}
        />
      </div>

    </div>
  );
};

export default RecipeListPage;