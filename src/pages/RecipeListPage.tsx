import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const { toast } = useToast();
  const { getRecipesByCategory } = useRecipes();
  const { addToCart } = useCart();
  const { config } = useUserConfig();
  const { showTabs, activeTab: activeTabDate, mealPlan, sectionRefs, scrollToDate } = useDateTabs();
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);

  // Load AI recipes from localStorage when component mounts
  useEffect(() => {
    console.log('RecipeListPage: Component mounted, checking localStorage...');
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
  }, []);

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
