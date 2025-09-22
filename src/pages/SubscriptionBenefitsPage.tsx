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
    // No longer save here - RecipeListPage handles saving automatically
    console.log('Planning session completed - list will be auto-saved by RecipeListPage');
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
          const selectedIngredients = recipe.ingredients.map(ing => ing.id);
          addToCart(recipe, recipe.servings, selectedIngredients);
        });

        // Store recipes in localStorage for compatibility
        localStorage.setItem('aiGeneratedRecipes', JSON.stringify(recipes));
        console.log('SubscriptionBenefitsPage: Stored recipes in localStorage');
        
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
        // Save current planning session before navigating
        saveCurrentPlanningSession();
        // Navigate to milista after reaching 100%
        setTimeout(() => navigate('/milista'), 500);
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