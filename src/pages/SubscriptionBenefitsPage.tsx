import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useUserConfig } from "@/contexts/UserConfigContext";
import { useRecipeBank } from "@/hooks/useRecipeBank";
import { useGlobalIngredients } from "@/hooks/useGlobalIngredients";
import { useCart } from "@/hooks/useCart";

const SubscriptionBenefitsPage = () => {
  const navigate = useNavigate();
  const { updateConfig, config } = useUserConfig();
  const { getRecipesForPlan, convertToRecipe } = useRecipeBank();
  const { initializeIngredients } = useGlobalIngredients();
  const { addToCart } = useCart();
  const [progress, setProgress] = useState(1);
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false, false, false]);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
  
  const items = ['Supermercados', 'Ingredientes', 'Nutrición', 'Recetas', 'Precios'];
  const loadingMessages = ['Buscando supermercados…', 'Descargando ingredientes…', 'Información nutricional…', 'Preparando recetas…', 'Comparando precios…'];

  const saveCurrentPlanningSession = () => {
    console.log('SubscriptionBenefitsPage: Saving current planning session as list...');
    
    // Get the generated recipes from localStorage
    const savedAiRecipes = localStorage.getItem('aiGeneratedRecipes');
    if (!savedAiRecipes) {
      console.log('SubscriptionBenefitsPage: No AI recipes found, skipping save');
      return;
    }
    
    try {
      const recipes = JSON.parse(savedAiRecipes);
      if (recipes.length === 0) {
        console.log('SubscriptionBenefitsPage: Empty recipes array, skipping save');
        return;
      }
      
      // Create the new list with current config
      const newList = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: 'Mi Lista',
        dates: config.selectedDates || [],
        servings: config.servingsPerRecipe || 2,
        meals: config.selectedMeals || [],
        recipes: recipes,
        createdAt: new Date().toISOString(),
        estimatedPrice: calculateEstimatedPrice(recipes.length * 3),
        recipeImages: recipes.slice(0, 3).map(recipe => recipe.image).filter(Boolean)
      };
      
      console.log('SubscriptionBenefitsPage: Creating new list:', {
        id: newList.id,
        name: newList.name,
        dates: newList.dates,
        recipesCount: newList.recipes.length,
        recipeImages: newList.recipeImages?.length || 0
      });
      
      // Load existing lists and add new one
      const existingLists = JSON.parse(localStorage.getItem('savedShoppingLists') || '[]');
      const updatedLists = [newList, ...existingLists.slice(0, 9)];
      
      localStorage.setItem('savedShoppingLists', JSON.stringify(updatedLists));
      console.log('SubscriptionBenefitsPage: List saved to localStorage, total lists:', updatedLists.length);
      
      // Trigger event to update Index page
      window.dispatchEvent(new CustomEvent('listsUpdated'));
      console.log('SubscriptionBenefitsPage: listsUpdated event dispatched');
    } catch (error) {
      console.error('SubscriptionBenefitsPage: Error saving planning session:', error);
    }
  };

  const calculateEstimatedPrice = (ingredientsCount: number) => {
    const basePrice = ingredientsCount * 1.2;
    const servingsMultiplier = config.servingsPerRecipe || 2;
    const daysMultiplier = config.selectedDates?.length || 1;
    
    return +(basePrice * servingsMultiplier * daysMultiplier).toFixed(2);
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

  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = src;
    });
  };

  const generateRecipesInBackground = async (params: any) => {
    try {
      console.log('SubscriptionBenefitsPage: Loading recipes from recipe bank...');
      
      // Use recipe bank to get recipes for the selected plan
      const recipePlan = getRecipesForPlan(
        params.selectedDates,
        params.selectedMeals,
        params.people
      );
      
      // Flatten recipes from the plan
      const recipes = [];
      for (const day of Object.keys(recipePlan)) {
        for (const meal of Object.keys(recipePlan[day])) {
          recipes.push(...recipePlan[day][meal]);
        }
      }
      
      console.log('SubscriptionBenefitsPage: Loaded recipes from bank:', recipes.length);
      
      // Initialize ingredients and add to cart
      if (recipes.length > 0) {
        initializeIngredients(recipes);
        
        recipes.forEach(recipe => {
          console.log('SubscriptionBenefitsPage: Processing recipe for cart:', recipe.title);
          console.log('SubscriptionBenefitsPage: Recipe ingredients check:', recipe.ingredients ? recipe.ingredients.length : 'NO INGREDIENTS');
          
          if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
            const selectedIngredients = recipe.ingredients.map(ing => ing.id);
            addToCart(recipe, recipe.servings, selectedIngredients);
          } else {
            console.warn('SubscriptionBenefitsPage: Recipe missing ingredients, skipping cart addition:', recipe.title);
          }
        });

        // Store recipes in localStorage for compatibility
        console.log('SubscriptionBenefitsPage: About to store recipes in localStorage');
        console.log('SubscriptionBenefitsPage: Recipes to store:', recipes.length);
        recipes.forEach((recipe, index) => {
          console.log(`SubscriptionBenefitsPage: Recipe ${index + 1}:`, {
            title: recipe.title,
            hasIngredients: !!(recipe.ingredients && Array.isArray(recipe.ingredients)),
            ingredientsCount: recipe.ingredients ? recipe.ingredients.length : 0,
            image: recipe.image
          });
        });
        
        localStorage.setItem('aiGeneratedRecipes', JSON.stringify(recipes));
        console.log('SubscriptionBenefitsPage: Stored recipes in localStorage');
        
        // IMMEDIATELY save as list when recipes are ready
        console.log('SubscriptionBenefitsPage: Immediately calling saveCurrentPlanningSession after recipe generation...');
        setTimeout(() => {
          saveCurrentPlanningSession();
        }, 100); // Small delay to ensure localStorage is committed
        
        // Preload all recipe images from Supabase
        console.log('🔄 Preloading recipe images from Supabase...');
        const preloadPromises = recipes
          .filter(recipe => recipe.image && recipe.image.includes('supabase.co'))
          .map(recipe => preloadImage(recipe.image));
        
        try {
          await Promise.all(preloadPromises);
          console.log('✅ All recipe images successfully preloaded');
        } catch (error) {
          console.warn('Some images failed to preload, but continuing...', error);
        }
        
        // Mark images as preloaded in localStorage
        localStorage.setItem('recipeImagesPreloaded', 'true');
        console.log('SubscriptionBenefitsPage: Recipe generation and storage complete');
      } else {
        console.log('SubscriptionBenefitsPage: No recipes generated');
      }
    } catch (error) {
      console.error('Error loading recipes from recipe bank:', error);
    }
  };

  useEffect(() => {
    // Check if we should load recipes from recipe bank
    const pendingGeneration = localStorage.getItem('pendingRecipeGeneration');
    if (pendingGeneration) {
      setIsGeneratingRecipes(true);
      generateRecipesInBackground(JSON.parse(pendingGeneration));
      localStorage.removeItem('pendingRecipeGeneration');
    }

    const startTime = Date.now();
    const duration = isGeneratingRecipes ? 3000 : 2000; // Shorter duration since no AI generation
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const ratio = elapsed / duration;
      
      if (ratio >= 1) {
        setProgress(100);
        // Mark as having a planning session when complete
        updateConfig({ hasPlanningSession: true });
        console.log('SubscriptionBenefitsPage: Progress complete, calling saveCurrentPlanningSession...');
        // Save current planning session before navigating
        saveCurrentPlanningSession();
        // Navigate to milista after reaching 100%
        setTimeout(() => {
          console.log('SubscriptionBenefitsPage: Navigating to /milista');
          navigate('/milista');
        }, 500);
        return;
      }
      
      // Progressive slowdown: fast start, very slow last 15%
      let newProgress;
      if (ratio > 0.85) {
        // Much slower progression for the last 15% (85%-100%)
        const lastPhaseRatio = (ratio - 0.85) / 0.15;
        const slowedRatio = Math.pow(lastPhaseRatio, 4); // Much slower with power of 4
        newProgress = 85 + (15 * slowedRatio);
      } else if (ratio > 0.7) {
        // Medium slow for 70%-85%
        const midPhaseRatio = (ratio - 0.7) / 0.15;
        const slowedRatio = Math.pow(midPhaseRatio, 1.5);
        newProgress = 70 + (15 * slowedRatio);
      } else {
        // Fast progression for first 70%
        newProgress = ratio * 70 / 0.7;
      }
      
      setProgress(Math.min(100, Math.max(1, newProgress)));
      
      // Check items progressively based on progress
      const itemThresholds = [20, 40, 60, 80, 95];
      const newCheckedItems = itemThresholds.map(threshold => newProgress >= threshold);
      setCheckedItems(newCheckedItems);
      
      requestAnimationFrame(updateProgress);
    };
    
    requestAnimationFrame(updateProgress);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Progress percentage */}
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold text-foreground mb-4">
          {Math.floor(progress)}%
        </h1>
        <h2 className="text-xl font-medium text-foreground mb-8">
          Estamos preparando<br />todo para ti
        </h2>
        
        {/* Progress bar */}
        <div className="w-80 h-2 bg-muted rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-gradient-to-r from-orange-400 via-red-500 to-rose-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-muted-foreground text-base mb-12">
          {(() => {
            const currentItemIndex = checkedItems.findIndex((checked, index) => !checked && index < checkedItems.length);
            if (currentItemIndex === -1) return loadingMessages[loadingMessages.length - 1];
            return loadingMessages[currentItemIndex] || loadingMessages[0];
          })()}
        </p>
      </div>

      {/* Configuration items */}
      <div className="bg-foreground rounded-2xl p-6 w-full max-w-sm">
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item} className="flex items-center justify-between">
              <span className="text-background text-base">• {item}</span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                checkedItems[index] 
                  ? 'border-background bg-background' 
                  : 'border-background/30'
              }`}>
                {checkedItems[index] && (
                  <Check className="h-4 w-4 text-foreground" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBenefitsPage;