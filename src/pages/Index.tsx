import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { useGlobalIngredients } from '@/hooks/useGlobalIngredients';
import { useCart } from '@/hooks/useCart';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { AirbnbHeader } from '@/components/AirbnbHeader';
import { CategoryCarousel } from '@/components/CategoryCarousel';
import { IngredientsView } from '@/components/IngredientsView';
import { SavedShoppingListCard } from '@/components/SavedShoppingListCard';
import { useDateTabs } from '@/hooks/useDateTabs';
import { Recipe, CategoryType } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRecipesByCategory } = useRecipes();
  const { addToCart } = useCart();
  const { config, updateConfig } = useUserConfig();
  
  const [selectedFilter, setSelectedFilter] = useState<'receta' | 'ingredientes'>('receta');
  const { showTabs, activeTab: activeTabDate, mealPlan, sectionRefs, scrollToDate } = useDateTabs();
  
  const categories: CategoryType[] = [
    'breakfast', 'lunch', 'dinner', 
    'appetizer', 'snacks', 'desserts', 'favorites'
  ];

  // Load AI recipes from localStorage if available
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);
  const [navigationData, setNavigationData] = useState<{
    canGoPrevious: boolean;
    canGoNext: boolean;
    isGenerating: boolean;
    handlePrevious: () => void;
    handleNext: () => void;
    handleGenerate: () => void;
  } | null>(null);
  
  // Get all recipes for ingredient management - prioritize AI recipes
  const explorationRecipes = aiRecipes.length > 0 ? aiRecipes : categories.flatMap(category => getRecipesByCategory(category, 10));
  const { getGroupedIngredients, getSelectedIngredientsCount, initializeIngredients } = useGlobalIngredients();

  useEffect(() => {
    // Reset chart animation when entering from welcome page
    updateConfig({ shouldAnimateChart: false });
    
    // Clear any old recipe data to ensure fresh load
    const isFromSupabase = localStorage.getItem('recipesFromSupabase');
    const storedAiRecipes = localStorage.getItem('aiGeneratedRecipes');
    
    if (storedAiRecipes && isFromSupabase) {
      try {
        const parsedRecipes = JSON.parse(storedAiRecipes);
        setAiRecipes(parsedRecipes);
        console.log('Loaded', parsedRecipes.length, 'AI recipes from Supabase via localStorage');
        
        // Clear the flag to prevent confusion pero mantener las recetas
        localStorage.removeItem('recipesFromSupabase');
        
        // Force re-initialization of ingredients to ensure they're properly set
        if (parsedRecipes.length > 0) {
          setTimeout(() => {
            initializeIngredients(parsedRecipes);
          }, 100);
        }
      } catch (error) {
        console.error('Error parsing stored AI recipes:', error);
        // Clear corrupted data
        localStorage.removeItem('aiGeneratedRecipes');
        localStorage.removeItem('recipesFromSupabase');
      }
    } else if (storedAiRecipes) {
      // Hay recetas pero no están marcadas como de Supabase, usar con precaución
      try {
        const parsedRecipes = JSON.parse(storedAiRecipes);
        setAiRecipes(parsedRecipes);
        console.log('Loaded', parsedRecipes.length, 'AI recipes from localStorage (legacy)');
      } catch (error) {
        console.error('Error parsing stored AI recipes:', error);
        localStorage.removeItem('aiGeneratedRecipes');
      }
    } else {
      // If no valid recipes, clear any stale data
      console.log('No valid recipes found, clearing stale data');
      setAiRecipes([]);
      localStorage.removeItem('aiGeneratedRecipes');
    }
  }, [updateConfig, initializeIngredients]);

  // Initialize ingredients when recipes load (separate effect to avoid dependencies issues)
  useEffect(() => {
    if (explorationRecipes.length > 0) {
      initializeIngredients(explorationRecipes);
    }
  }, [explorationRecipes.length, initializeIngredients]);
  
  const handleRecipesChange = (newRecipes: Recipe[]) => {
    setAiRecipes(newRecipes);
    // Store in localStorage for persistence
    localStorage.setItem('aiGeneratedRecipes', JSON.stringify(newRecipes));
    // Re-initialize ingredients for the new recipes to update price calculation
    initializeIngredients(newRecipes);
    console.log('Updated AI recipes:', newRecipes.length, 'recipes');
  };

  // Calculate selected ingredients count with memoization
  const selectedIngredientsCount = useMemo(() => {
    return getSelectedIngredientsCount(explorationRecipes);
  }, [getSelectedIngredientsCount, explorationRecipes]);

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


  const handleSearchInSupermarket = () => {
    if (selectedIngredientsCount > 0) {
      // Save current planning session before navigating
      saveCurrentPlanningSession();
      navigate('/milista');
    } else {
      toast({
        title: "Buscar en supermercado",
        description: "Función próximamente disponible"
      });
    }
  };

  const saveCurrentPlanningSession = () => {
    if (config.hasPlanningSession && config.selectedDates?.length) {
      const existingSavedLists = JSON.parse(localStorage.getItem('savedShoppingLists') || '[]');
      
      // Get first 3 recipe images from current AI recipes
      const recipeImages = explorationRecipes.slice(0, 3).map(recipe => recipe.image || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9');
      
      // Create a new shopping list object
      const newShoppingList = {
        id: Date.now().toString(),
        name: generatePlanName(),
        selectedDates: config.selectedDates,
        servingsPerRecipe: config.servingsPerRecipe || 2,
        estimatedPrice: calculateEstimatedPrice(),
        createdAt: new Date().toISOString(),
        ingredients: explorationRecipes.flatMap(recipe => recipe.ingredients),
        recipes: explorationRecipes,
        recipeImages: recipeImages // Store recipe images
      };
      
      // Add to beginning of array (most recent first)
      const updatedLists = [newShoppingList, ...existingSavedLists.slice(0, 9)]; // Keep max 10 lists
      
      localStorage.setItem('savedShoppingLists', JSON.stringify(updatedLists));
      console.log('Saved new shopping list:', newShoppingList);
    }
  };

  const generatePlanName = () => {
    const themes = [
      'Menú semanal mediterráneo',
      'Comidas saludables',
      'Menú familiar',
      'Cocina tradicional',
      'Menú vegetariano',
      'Comidas rápidas'
    ];
    return themes[Math.floor(Math.random() * themes.length)];
  };

  const calculateEstimatedPrice = () => {
    const basePrice = selectedIngredientsCount * 1.2;
    const servingsMultiplier = config.servingsPerRecipe || 2;
    const daysMultiplier = config.selectedDates?.length || 1;
    
    const estimatedPrice = (basePrice * servingsMultiplier * daysMultiplier).toFixed(2);
    return estimatedPrice;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AirbnbHeader 
        showTabs={showTabs}
        activeTab={activeTabDate}
        mealPlan={mealPlan}
        onTabChange={scrollToDate}
        onFilterChange={setSelectedFilter}
        navigationData={navigationData}
      />
      
      <div style={{ paddingTop: '120px' }}>
        <SavedShoppingListCard />
        
        {selectedFilter === 'receta' ? (
          /* All recipes mixed together */
          <CategoryCarousel
            category="trending"
            recipes={explorationRecipes}
            onAddRecipe={handleAddRecipe}
            onRecipeClick={handleRecipeClick}
            onViewAll={handleViewAll}
            sectionRefs={sectionRefs}
            onRecipesChange={handleRecipesChange}
            onNavigationDataChange={setNavigationData}
          />
        ) : (
          <IngredientsView recipes={explorationRecipes} />
        )}
      </div>

      {/* Floating Button - Always visible */}
      <div className="fixed bottom-4 left-4 right-4 z-40">
        <button 
          onClick={handleSearchInSupermarket}
          className="w-full bg-black text-white py-4 px-6 rounded-2xl font-medium text-base shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 mb-4"
        >
          <Search className="h-5 w-5" />
          {selectedIngredientsCount > 0 ? 'Continuar con Mi lista' : 'Buscar súper'} · Lista ({selectedIngredientsCount})
        </button>
      </div>
    </div>
  );
};

export default Index;
