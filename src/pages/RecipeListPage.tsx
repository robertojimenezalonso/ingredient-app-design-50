import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Search, ArrowLeft, Calendar, Users } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { useGlobalIngredients } from '@/hooks/useGlobalIngredients';
import { useCart } from '@/hooks/useCart';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { useAuth } from '@/hooks/useAuth';
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
  const { toast } = useToast();
  const { getRecipesByCategory } = useRecipes();
  const { addToCart } = useCart();
  const { config } = useUserConfig();
  const { user } = useAuth();
  const { getListById, saveList } = useShoppingLists();
  const { showTabs, activeTab: activeTabDate, mealPlan, sectionRefs, scrollToDate } = useDateTabs();
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);

  // Load AI recipes from localStorage or specific list
  useEffect(() => {
    const loadRecipes = async () => {
      console.log('RecipeListPage: Loading recipes, listId:', listId);
      
      if (listId) {
        // Load specific saved list from database
        try {
          const savedList = await getListById(listId);
          if (savedList && savedList.recipes) {
            console.log('RecipeListPage: Loading specific list from DB:', savedList.name, 'with recipes:', savedList.recipes.length);
            setAiRecipes(savedList.recipes);
            return;
          }
        } catch (error) {
          console.error('RecipeListPage: Error loading specific list:', error);
        }
        console.log('RecipeListPage: Specific list not found in DB, falling back to current recipes');
      }
      
      // Check if there's a recently saved list ID
      const lastSavedListId = localStorage.getItem('lastSavedListId');
      if (lastSavedListId && !listId) {
        console.log('RecipeListPage: Found recently saved list, loading:', lastSavedListId);
        try {
          const savedList = await getListById(lastSavedListId);
          if (savedList && savedList.recipes) {
            console.log('RecipeListPage: Loading recently saved list:', savedList.name, 'with recipes:', savedList.recipes.length);
            setAiRecipes(savedList.recipes);
            // Clear the saved list ID after loading
            localStorage.removeItem('lastSavedListId');
            return;
          }
        } catch (error) {
          console.error('RecipeListPage: Error loading recently saved list:', error);
        }
      }
      
      // Load current AI recipes from localStorage (for fallback)
      console.log('RecipeListPage: Loading current AI recipes from localStorage...');
      const savedAiRecipes = localStorage.getItem('aiGeneratedRecipes');
      console.log('RecipeListPage: localStorage result:', savedAiRecipes ? 'Data found' : 'No data found');
      
      if (savedAiRecipes) {
        try {
          const parsedRecipes = JSON.parse(savedAiRecipes);
          console.log('RecipeListPage: Successfully parsed AI recipes:', parsedRecipes.length, 'recipes');
          setAiRecipes(parsedRecipes);
        } catch (error) {
          console.error('RecipeListPage: Error parsing AI recipes from localStorage:', error);
        }
      }
    };

    loadRecipes();
  }, [listId, getListById, user])


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

  // Calculate estimated price based on ingredients and settings
  const calculateEstimatedPrice = (ingredientsCount: number) => {
    const basePrice = ingredientsCount * 1.2;
    const servingsMultiplier = config.servingsPerRecipe || 2;
    const daysMultiplier = config.selectedDates?.length || 1;
    
    return +(basePrice * servingsMultiplier * daysMultiplier).toFixed(2);
  };

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
