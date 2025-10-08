import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Search, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRecipes } from '@/hooks/useRecipes';
import { useGlobalIngredients } from '@/hooks/useGlobalIngredients';
import { useCart } from '@/hooks/useCart';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import { AirbnbHeader } from '@/components/AirbnbHeader';
import { CategoryCarousel } from '@/components/CategoryCarousel';
import { FloatingButton } from '@/components/FloatingButton';
import { useDateTabs } from '@/hooks/useDateTabs';
import { Recipe, CategoryType } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';

const RecipeListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { listId } = useParams();
  
  console.log('RecipeListPage: Component mounted/updated with listId:', listId);
  console.log('RecipeListPage: Current URL:', window.location.href);
  const { toast } = useToast();
  const { getRecipesByCategory } = useRecipes();
  const { addToCart } = useCart();
  const { config } = useUserConfig();
  const { user } = useAuth();
  const { getListById, saveList, lists } = useShoppingLists();
  const { showTabs, activeTab: activeTabDate, mealPlan, sectionRefs, scrollToDate } = useDateTabs();
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);
  const [hasAutoSaved, setHasAutoSaved] = useState(false);

  // Load AI recipes from localStorage or specific list
  useEffect(() => {
    const loadRecipes = async () => {
      console.log('RecipeListPage: Loading recipes, listId:', listId);
      
      if (listId) {
        // Loading a specific saved list - ONLY use that list's data
        console.log('RecipeListPage: About to call getListById with:', listId);
        try {
          console.log('RecipeListPage: Calling getListById...');
          const savedList = await getListById(listId);
          console.log('RecipeListPage: getListById returned:', savedList);
          
          if (savedList && savedList.recipes && savedList.recipes.length > 0) {
            console.log('RecipeListPage: Loading specific list from DB:', savedList.name, 'with recipes:', savedList.recipes.length);
            setAiRecipes(savedList.recipes);
            // For saved lists, ONLY use the saved data - don't fallback to localStorage
            return;
          } else {
            console.log('RecipeListPage: No recipes found in saved list or list not found');
            // If saved list has no recipes or doesn't exist, redirect to home
            navigate('/');
            return;
          }
        } catch (error) {
          console.error('RecipeListPage: Error loading specific list:', error);
          navigate('/');
          return;
        }
      } else {
        // Loading current state for new list creation (no listId)
        console.log('RecipeListPage: Loading current AI recipes from localStorage...');
        const savedAiRecipes = localStorage.getItem('aiGeneratedRecipes');
        console.log('RecipeListPage: localStorage result:', savedAiRecipes ? 'Data found' : 'No data found');
        
        if (savedAiRecipes) {
          try {
            const parsedRecipes = JSON.parse(savedAiRecipes);
            console.log('RecipeListPage: Successfully parsed AI recipes:', parsedRecipes.length, 'recipes');
            setAiRecipes(parsedRecipes);
            setHasAutoSaved(false);
          } catch (error) {
            console.error('RecipeListPage: Error parsing AI recipes from localStorage:', error);
            setAiRecipes([]);
          }
        } else {
          console.log('RecipeListPage: No recipes found in localStorage');
          setAiRecipes([]);
        }
      }
    };

    loadRecipes();
  }, [listId, getListById, navigate]);


  // Handle recipe replacement when coming from change mode
  useEffect(() => {
    const replaceRecipe = location.state?.replaceRecipe;
    if (replaceRecipe) {
      const { originalId, newRecipe } = replaceRecipe;
      
      // Update AI recipes in state
      setAiRecipes(prevRecipes => 
        prevRecipes.map(recipe => 
          recipe.id === originalId ? newRecipe : recipe
        )
      );
      
      // Update localStorage
      const savedAiRecipes = localStorage.getItem('aiGeneratedRecipes');
      if (savedAiRecipes) {
        try {
          const parsedRecipes = JSON.parse(savedAiRecipes);
          const updatedRecipes = parsedRecipes.map((recipe: Recipe) => 
            recipe.id === originalId ? newRecipe : recipe
          );
          localStorage.setItem('aiGeneratedRecipes', JSON.stringify(updatedRecipes));
        } catch (error) {
          console.error('Error updating recipes in localStorage:', error);
        }
      }
      
      // Clear the state to prevent repeated replacements
      navigate('/milista', { replace: true, state: {} });
    }
  }, [location.state, navigate]);
  
  
  const categories: CategoryType[] = [
    'breakfast', 'lunch', 'dinner', 
    'appetizer', 'snacks', 'desserts', 'favorites'
  ];

  // Get recipes from the meal plan - these are the recommended recipes
  const mealPlanRecipes = mealPlan.flatMap(day => 
    day.meals.map(meal => meal.recipe).filter(Boolean)
  );
  
  console.log('RecipeListPage: Meal plan debug:', {
    mealPlanLength: mealPlan.length,
    mealPlan: mealPlan.map(day => ({
      dateStr: day.dateStr,
      mealsCount: day.meals.length,
      meals: day.meals.map(meal => ({
        meal: meal.meal,
        hasRecipe: !!meal.recipe,
        recipeTitle: meal.recipe?.title,
        recipeImage: meal.recipe?.image
      }))
    })),
    extractedRecipesCount: mealPlanRecipes.length,
    extractedRecipesTitles: mealPlanRecipes.map(r => r.title)
  });
  
  // Show AI recipes first, fallback to meal plan recipes, then empty
  const recommendedRecipes = aiRecipes.length > 0 ? aiRecipes : mealPlanRecipes;

  console.log('RecipeListPage: Current recipes state:', {
    aiRecipesCount: aiRecipes.length,
    aiRecipesTitles: aiRecipes.map(r => r.title),
    recommendedRecipesCount: recommendedRecipes.length,
    showingAI: aiRecipes.length > 0
  });

  // Calculate estimated price based on ingredients and settings
  const calculateEstimatedPrice = (ingredientsCount: number) => {
    const basePrice = ingredientsCount * 1.2;
    const servingsMultiplier = config.servingsPerRecipe || 2;
    const daysMultiplier = config.selectedDates?.length || 1;
    
    return +(basePrice * servingsMultiplier * daysMultiplier).toFixed(2);
  };

  // Auto-save new lists to database
  useEffect(() => {
    const autoSaveList = async () => {
      console.log('RecipeListPage: Auto-save effect running');
      
      // Skip if already saved, viewing a specific list, or user not authenticated
      if (hasAutoSaved || listId || !user) {
        console.log('RecipeListPage: Skipping auto-save:', { hasAutoSaved, listId, hasUser: !!user });
        return;
      }
      
      // Skip if there are already saved lists (to avoid creating duplicates)
      if (lists.length > 0) {
        console.log('RecipeListPage: Skipping auto-save - user already has saved lists');
        setHasAutoSaved(true); // Prevent future auto-save attempts
        return;
      }
      
      // Check if we have config with dates (minimum requirement for a list)
      if (!config?.selectedDates?.length) {
        console.log('RecipeListPage: No config or selected dates, skipping auto-save');
        return;
      }
      
      // Get recipes to save - prioritize aiRecipes, fallback to meal plan
      let recipesToSave = [];
      
      if (aiRecipes.length > 0) {
        recipesToSave = aiRecipes;
        console.log('RecipeListPage: Using AI recipes for saving:', recipesToSave.length);
      } else if (mealPlanRecipes.length > 0) {
        recipesToSave = mealPlanRecipes;
        console.log('RecipeListPage: Using meal plan recipes for saving:', recipesToSave.length);
      } else {
        console.log('RecipeListPage: No recipes available for saving');
        return;
      }
      
      // Save to database
      try {
        console.log('RecipeListPage: Saving new list to database...');
        await saveList({
          name: 'Mi Lista',
          dates: config.selectedDates || [],
          servings: config.servingsPerRecipe || 2,
          meals: config.selectedMeals || [],
          recipes: recipesToSave,
          estimated_price: calculateEstimatedPrice(recipesToSave.length * 3)
        });
        
        setHasAutoSaved(true);
        console.log('RecipeListPage: List saved successfully to database');
        
        // Clean up localStorage after successful save
        localStorage.removeItem('aiGeneratedRecipes');
        localStorage.removeItem('pendingRecipeGeneration');
        
      } catch (error) {
        console.error('RecipeListPage: Error saving list to database:', error);
        toast({
          title: "Error",
          description: "No se pudo guardar la lista automáticamente",
          variant: "destructive"
        });
      }
    };

    // Delay auto-save to ensure recipes are loaded
    const timeoutId = setTimeout(autoSaveList, 2000);
    return () => clearTimeout(timeoutId);
  }, [aiRecipes.length, mealPlanRecipes.length, config?.selectedDates, config?.servingsPerRecipe, config?.selectedMeals, hasAutoSaved, listId, user, saveList]);

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
  const [totalPrice, setTotalPrice] = useState(64.76); // Default price
  
  // Update count and price when selection changes
  useEffect(() => {
    console.log('RecipeListPage useEffect triggered - selectedIngredientIds length:', selectedIngredientIds.length);
    const count = getSelectedIngredientsCount(recommendedRecipes);
    console.log('RecipeListPage: Updated count:', count, 'from', recommendedRecipes.length, 'recipes');
    setSelectedIngredientsCount(count);
    
    // Calculate and update price
    const price = calculateEstimatedPrice(count);
    setTotalPrice(price);
    console.log('RecipeListPage: Updated price:', price);
  }, [selectedIngredientIds.join(','), recommendedRecipes.length, getSelectedIngredientsCount, config.servingsPerRecipe, config.selectedDates?.length]);

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
    // Navigation removed as ingredients page no longer exists
  };

  const handleSearchOffers = async () => {
    console.log('RecipeListPage: handleSearchOffers called with:', {
      listId,
      aiRecipesLength: aiRecipes.length,
      recommendedRecipesLength: recommendedRecipes.length,
      hasUser: !!user
    });
    
    // Auto-save the list if we have recipes and no listId (new list)
    if (!listId && recommendedRecipes.length > 0 && user) {
      try {
        const listData = {
          name: 'Mi Lista',
          dates: mealPlan.map(day => day.dateStr),
          servings: config?.servingsPerRecipe || 2,
          meals: mealPlan.flatMap(day => day.meals.map(meal => meal.meal)),
          recipes: recommendedRecipes, // Use recommendedRecipes instead of aiRecipes
          estimated_price: totalPrice
        };

        console.log('RecipeListPage: About to save list with data:', listData);
        await saveList(listData);
        
        toast({
          title: "Lista guardada",
          description: "Tu lista se ha guardado automáticamente"
        });
        
        console.log('RecipeListPage: List saved successfully');
      } catch (error) {
        console.error('RecipeListPage: Auto-save failed:', error);
        toast({
          title: "Error",
          description: "No se pudo guardar la lista",
          variant: "destructive"
        });
      }
    } else {
      console.log('RecipeListPage: Skipping auto-save:', {
        reason: !listId ? 'no listId' : listId ? 'has listId' : 'unknown',
        hasRecipes: recommendedRecipes.length > 0,
        hasUser: !!user
      });
    }
    navigate('/search-offers');
  };

  const handleSaveList = async () => {
    console.log('RecipeListPage: handleSaveList called with:', {
      recommendedRecipesLength: recommendedRecipes.length,
      hasUser: !!user
    });

    if (recommendedRecipes.length > 0 && user) {
      try {
        const listData = {
          name: 'Mi Lista',
          dates: mealPlan.map(day => day.dateStr),
          servings: config?.servingsPerRecipe || 2,
          meals: mealPlan.flatMap(day => day.meals.map(meal => meal.meal)),
          recipes: recommendedRecipes,
          estimated_price: totalPrice
        };

        console.log('RecipeListPage: About to save list manually with data:', listData);
        const result = await saveList(listData);
        
        toast({
          title: "Lista guardada",
          description: "Tu lista se ha guardado exitosamente"
        });
        
        console.log('RecipeListPage: List saved successfully, result:', result);
        
        // Navigate to the saved list
        if (result?.id) {
          navigate(`/milista/${result.id}`);
        }
      } catch (error) {
        console.error('RecipeListPage: Manual save failed:', error);
        toast({
          title: "Error",
          description: "No se pudo guardar la lista",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteList = async () => {
    if (!listId || !user) return;
    
    try {
      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', listId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Lista eliminada",
        description: "La lista se ha eliminado exitosamente"
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error deleting list:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la lista",
        variant: "destructive"
      });
    }
  };

  const daysText = config.selectedDates?.length 
    ? `${config.selectedDates.length} día${config.selectedDates.length > 1 ? 's' : ''}`
    : '0 días';
    
  const servingsText = `${config.servingsPerRecipe || 1} ración${(config.servingsPerRecipe || 1) > 1 ? 'es' : ''}`;

  console.log('RecipeListPage: Rendering with:', {
    recommendedRecipesCount: recommendedRecipes.length,
    hasRecipes: recommendedRecipes.length > 0
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>
        <div>
          <h1 className="text-lg font-semibold">Mi lista de la compra</h1>
          <p className="text-sm text-muted-foreground">
            {daysText} · {servingsText} por receta
          </p>
        </div>
      </div>

      {/* Loading States */}
      {recommendedRecipes.length === 0 && !listId && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando recetas...</p>
          </div>
        </div>
      )}

      {recommendedRecipes.length === 0 && listId && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-muted-foreground">No se encontraron recetas en esta lista</p>
          </div>
        </div>
      )}

      {/* Recipe Content */}
      {recommendedRecipes.length > 0 && (
        <div className="px-4 py-6">
          <CategoryCarousel
            category="trending"
            recipes={recommendedRecipes}
            onAddRecipe={handleAddRecipe}
            onRecipeClick={handleRecipeClick}
            onViewAll={handleViewAll}
            sectionRefs={sectionRefs}
          />
        </div>
      )}

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button 
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={handleSearchOffers}
        >
          <Search className="h-5 w-5 mr-2" />
          Ingredientes desde {totalPrice.toFixed(2)} €
        </Button>
      </div>
    </div>
  );
};

export default RecipeListPage;
