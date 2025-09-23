import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Search, ArrowLeft, Calendar, Users } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { useGlobalIngredients } from '@/hooks/useGlobalIngredients';
import { useCart } from '@/hooks/useCart';
import { useUserConfig } from '@/contexts/UserConfigContext';
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
  const { toast } = useToast();
  const { getRecipesByCategory } = useRecipes();
  const { addToCart } = useCart();
  const { config } = useUserConfig();
  const { showTabs, activeTab: activeTabDate, mealPlan, sectionRefs, scrollToDate } = useDateTabs();
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);

  // Load AI recipes from localStorage when component mounts
  useEffect(() => {
    console.log('RecipeListPage: Component mounted, checking for listId:', listId);
    
    if (listId) {
      // Load specific saved list
      const savedLists = localStorage.getItem('savedShoppingLists');
      if (savedLists) {
        try {
          const parsedLists = JSON.parse(savedLists);
          const targetList = parsedLists.find(list => list.id === listId);
          if (targetList && targetList.recipes) {
            console.log('RecipeListPage: Loading specific list:', targetList.name, 'with recipes:', targetList.recipes.length);
            setAiRecipes(targetList.recipes);
            return;
          }
        } catch (error) {
          console.error('RecipeListPage: Error loading specific list:', error);
        }
      }
      console.log('RecipeListPage: Specific list not found, falling back to current recipes');
    }
    
    // Load current AI recipes from localStorage
    console.log('RecipeListPage: Loading current AI recipes...');
    const savedAiRecipes = localStorage.getItem('aiGeneratedRecipes');
    console.log('RecipeListPage: localStorage result:', savedAiRecipes ? 'Data found' : 'No data found');
    
    if (savedAiRecipes) {
      console.log('RecipeListPage: Raw localStorage data length:', savedAiRecipes.length);
      try {
        const parsedRecipes = JSON.parse(savedAiRecipes);
        console.log('RecipeListPage: Successfully parsed AI recipes:', parsedRecipes.length, 'recipes');
        console.log('RecipeListPage: Recipe titles:', parsedRecipes.map(r => r.title));
        setAiRecipes(parsedRecipes);
        console.log('RecipeListPage: AI recipes state updated');
        
        // Keep recipes in localStorage for future visits - don't remove them
      } catch (error) {
        console.error('RecipeListPage: Error parsing AI recipes from localStorage:', error);
      }
    } else {
      console.log('RecipeListPage: No AI recipes found in localStorage');
    }
  }, [listId]); // Run when component mounts or listId changes

  // Auto-save configuration when user navigates to this page
  useEffect(() => {
    console.log('RecipeListPage: Auto-save effect running');
    
    // Skip auto-save if viewing a specific saved list
    if (listId) {
      console.log('RecipeListPage: Viewing specific list, skipping auto-save');
      return;
    }
    
    // Check if we have config with dates (minimum requirement for a list)
    if (!config?.selectedDates?.length) {
      console.log('RecipeListPage: No config or selected dates, skipping auto-save');
      return;
    }
    
    // Create a simple timeout to ensure page is fully loaded
    const saveTimeout = setTimeout(() => {
      console.log('RecipeListPage: Timeout reached, proceeding with save check...');
      
      // Get current recipes from various sources
      let currentRecipes = [];
      
      console.log('RecipeListPage: Checking recipe sources...');
      console.log('RecipeListPage: aiRecipes.length:', aiRecipes.length);
      console.log('RecipeListPage: mealPlanRecipes.length:', mealPlanRecipes.length);
      
      // First try AI recipes from state
      if (aiRecipes.length > 0) {
        currentRecipes = aiRecipes;
        console.log('RecipeListPage: Using AI recipes from state:', currentRecipes.length);
      } else {
        // Try to get from localStorage
        const savedAiRecipes = localStorage.getItem('aiGeneratedRecipes');
        if (savedAiRecipes) {
          try {
            currentRecipes = JSON.parse(savedAiRecipes);
            console.log('RecipeListPage: Using AI recipes from localStorage:', currentRecipes.length);
          } catch (error) {
            console.error('RecipeListPage: Error parsing AI recipes:', error);
          }
        }
      }
      
      // If no AI recipes, use meal plan recipes as fallback for saving
      if (currentRecipes.length === 0 && mealPlanRecipes.length > 0) {
        currentRecipes = mealPlanRecipes;
        console.log('RecipeListPage: Using meal plan recipes for saving:', currentRecipes.length);
        console.log('RecipeListPage: Meal plan recipes:', mealPlanRecipes.map(r => ({ title: r.title, image: r.image })));
      }
      
      // If still no recipes, create a basic list entry anyway
      if (currentRecipes.length === 0) {
        console.log('RecipeListPage: No recipes found, creating basic list entry');
        currentRecipes = [];
      }
      
      const newList = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: 'Mi Lista',
        dates: config.selectedDates || [],
        servings: config.servingsPerRecipe || 2,
        meals: config.selectedMeals || [],
        recipes: currentRecipes,
        createdAt: new Date().toISOString(),
        estimatedPrice: calculateEstimatedPrice(currentRecipes.length * 3)
      };
      
      console.log('RecipeListPage: Creating new list:', {
        id: newList.id,
        name: newList.name,
        dates: newList.dates,
        recipesCount: newList.recipes.length
      });
      
      // Load existing lists and add new one
      const existingLists = JSON.parse(localStorage.getItem('savedShoppingLists') || '[]');
      const updatedLists = [newList, ...existingLists.slice(0, 9)];
      
      localStorage.setItem('savedShoppingLists', JSON.stringify(updatedLists));
      console.log('RecipeListPage: List saved to localStorage, total lists:', updatedLists.length);
      
      // Trigger event to update Index page
      window.dispatchEvent(new CustomEvent('listsUpdated'));
      console.log('RecipeListPage: listsUpdated event dispatched');
    }, 1000); // 1 second delay to ensure everything is loaded
    
    return () => clearTimeout(saveTimeout);
  }, [config?.selectedDates, config?.servingsPerRecipe, config?.selectedMeals, listId]); // Only trigger on config changes

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
  
  // Only show AI recipes if available, no fallback to examples
  const recommendedRecipes = aiRecipes.length > 0 ? aiRecipes : [];

  console.log('RecipeListPage: Current recipes state:', {
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
      initializeIngredients(recommendedRecipes);
    }
  }, [recommendedRecipes.length, initializeIngredients]);
  
  // Calculate selected ingredients count - use useState for reactivity
  const [selectedIngredientsCount, setSelectedIngredientsCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(64.76); // Default price
  
  // Calculate estimated price based on ingredients and settings
  const calculateEstimatedPrice = (ingredientsCount: number) => {
    const basePrice = ingredientsCount * 1.2;
    const servingsMultiplier = config.servingsPerRecipe || 2;
    const daysMultiplier = config.selectedDates?.length || 1;
    
    return +(basePrice * servingsMultiplier * daysMultiplier).toFixed(2);
  };
  
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
  }, [selectedIngredientIds.join(','), recommendedRecipes, getSelectedIngredientsCount, config.servingsPerRecipe, config.selectedDates?.length]);

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

  const handleSearchOffers = () => {
    navigate('/search-offers');
  };

  const daysText = config.selectedDates?.length 
    ? `${config.selectedDates.length} día${config.selectedDates.length > 1 ? 's' : ''}`
    : '0 días';
    
  const servingsText = `${config.servingsPerRecipe || 1} ración${(config.servingsPerRecipe || 1) > 1 ? 'es' : ''}`;

  return (
    <div className="min-h-screen bg-white">

      <AirbnbHeader 
        showTabs={showTabs}
        activeTab={activeTabDate}
        mealPlan={mealPlan}
        onTabChange={scrollToDate}
        onFilterChange={handleFilterChange}
        currentFilter="receta"
      />
      
      <div className="bg-white" style={{ paddingTop: '180px' }}>
        <CategoryCarousel
          category="trending"
          recipes={recommendedRecipes}
          onAddRecipe={handleAddRecipe}
          onRecipeClick={handleRecipeClick}
          onViewAll={handleViewAll}
          sectionRefs={sectionRefs}
        />
      </div>

      <FloatingButton 
        onClick={handleSearchOffers}
        selectedCount={selectedIngredientsCount}
        recipeCount={recommendedRecipes.length}
        totalPrice={totalPrice}
      >
        Buscar mejor oferta
      </FloatingButton>

    </div>
  );
};

export default RecipeListPage;
