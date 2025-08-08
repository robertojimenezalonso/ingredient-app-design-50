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
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  const items = ['Supermercados', 'Ingredientes', 'Nutrición', 'Recetas', 'Precios'];
  const loadingMessages = ['Buscando supermercados…', 'Descargando ingredientes…', 'Información nutricional…', 'Preparando recetas…', 'Comparando precios…'];

  const saveCurrentPlanningSession = () => {
    if (config.hasPlanningSession && config.selectedDates?.length) {
      const existingSavedLists = JSON.parse(localStorage.getItem('savedShoppingLists') || '[]');
      
      // Get current AI recipes for images
      const storedAiRecipes = localStorage.getItem('aiGeneratedRecipes');
      const aiRecipes = storedAiRecipes ? JSON.parse(storedAiRecipes) : [];
      const recipeImages = aiRecipes.slice(0, 3).map((recipe: any) => recipe.image || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9');
      
      const newShoppingList = {
        id: Date.now().toString(),
        name: generatePlanName(),
        selectedDates: config.selectedDates,
        servingsPerRecipe: config.servingsPerRecipe || 2,
        estimatedPrice: '15.90',
        createdAt: new Date().toISOString(),
        recipeImages: recipeImages
      };
      
      const updatedLists = [newShoppingList, ...existingSavedLists.slice(0, 9)];
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

  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        console.log(`✅ Image loaded: ${src}`);
        resolve();
      };
      img.onerror = () => {
        console.warn(`❌ Failed to load image: ${src}`);
        reject(new Error(`Failed to load image: ${src}`));
      };
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
      
      console.log('Recipe plan received:', recipePlan);
      
      // Flatten recipes from the plan
      const recipes = [];
      for (const day of Object.keys(recipePlan)) {
        for (const meal of Object.keys(recipePlan[day])) {
          recipes.push(...recipePlan[day][meal]);
        }
      }
      
      console.log('SubscriptionBenefitsPage: Loaded recipes from bank:', recipes.length);
      console.log('Recipe titles:', recipes.map(r => r.title));
      
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
        
        // Preload ALL recipe images and wait for them to complete
        console.log('🔄 Preloading all recipe images...');
        const imagesToLoad = recipes
          .filter(recipe => recipe.image)
          .map(recipe => recipe.image);
        
        console.log(`Found ${imagesToLoad.length} images to preload:`, imagesToLoad);
        
        // Load images one by one to show progress
        let loadedCount = 0;
        for (const imageUrl of imagesToLoad) {
          try {
            await preloadImage(imageUrl);
            loadedCount++;
            console.log(`Progress: ${loadedCount}/${imagesToLoad.length} images loaded`);
          } catch (error) {
            console.warn(`Failed to preload image, but continuing: ${imageUrl}`, error);
            loadedCount++; // Count failed images as "loaded" to continue
          }
        }
        
        console.log('✅ All recipe images preloading completed');
        console.log('Setting imagesLoaded to true');
        setImagesLoaded(true);
        
        // Mark images as preloaded in localStorage
        localStorage.setItem('recipeImagesPreloaded', 'true');
      } else {
        console.log('No recipes found, setting imagesLoaded to true anyway');
        setImagesLoaded(true);
      }
    } catch (error) {
      console.error('Error loading recipes from recipe bank:', error);
      // Even if there's an error, mark as loaded to prevent infinite loading
      console.log('Error occurred, setting imagesLoaded to true anyway');
      setImagesLoaded(true);
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
    const minDuration = 3000; // Minimum 3 seconds to show the loading screen
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const ratio = elapsed / minDuration;
      
      // Only proceed to 100% if images are loaded AND minimum time has passed
      if (ratio >= 1 && imagesLoaded) {
        setProgress(100);
        // Mark as having a planning session when complete
        updateConfig({ hasPlanningSession: true });
        // Save current planning session before navigating
        saveCurrentPlanningSession();
        // Navigate to milista after reaching 100%
        setTimeout(() => navigate('/milista'), 500);
        return;
      }
      
      // Calculate progress based on both time and image loading
      let timeProgress = Math.min(ratio, 1) * 85; // Time contributes up to 85%
      let imageProgress = imagesLoaded ? 15 : 0; // Images contribute final 15%
      let newProgress = timeProgress + imageProgress;
      setProgress(Math.min(100, Math.max(1, newProgress)));
      
      // Check items progressively based on progress
      const itemThresholds = [20, 40, 60, 80, 95];
      const newCheckedItems = itemThresholds.map(threshold => newProgress >= threshold);
      setCheckedItems(newCheckedItems);
      
      requestAnimationFrame(updateProgress);
    };
    
    requestAnimationFrame(updateProgress);
  }, [navigate, imagesLoaded]);

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