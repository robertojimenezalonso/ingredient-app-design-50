import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useUserConfig } from "@/contexts/UserConfigContext";
import { useAIRecipes } from "@/hooks/useAIRecipes";
import { useGlobalIngredients } from "@/hooks/useGlobalIngredients";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";

const SubscriptionBenefitsPage = () => {
  const navigate = useNavigate();
  const { updateConfig, config } = useUserConfig();
  const { generateRecipe } = useAIRecipes();
  const { initializeIngredients } = useGlobalIngredients();
  const { addToCart } = useCart();
  const [progress, setProgress] = useState(1);
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false, false, false]);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
  
  const items = ['Supermercados', 'Ingredientes', 'Nutrición', 'Recetas', 'Precios'];
  const loadingMessages = ['Buscando supermercados…', 'Descargando ingredientes…', 'Información nutricional…', 'Preparando recetas…', 'Comparando precios…'];

  const saveCurrentPlanningSession = () => {
    if (config.hasPlanningSession && config.selectedDates?.length) {
      const existingSavedLists = JSON.parse(localStorage.getItem('savedShoppingLists') || '[]');
      
      const newShoppingList = {
        id: Date.now().toString(),
        name: generatePlanName(),
        selectedDates: config.selectedDates,
        servingsPerRecipe: config.servingsPerRecipe || 2,
        estimatedPrice: '15.90',
        createdAt: new Date().toISOString()
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

  const generateRecipesInBackground = async (params: any) => {
    try {
      console.log('SubscriptionBenefitsPage: Starting recipe generation...');
      
      // Generate specific recipes for each day-meal combination
      const recipePromises = [];
      for (const date of params.selectedDates) {
        for (const meal of params.selectedMeals) {
          console.log(`Generating recipe for ${date} - ${meal}`);
          recipePromises.push(
            generateRecipe({
              people: params.people,
              days: [date],
              meals: [meal],
              restrictions: params.restrictions
            }, false) // Don't show toasts during generation
          );
        }
      }
      
      // Generate all recipes in parallel (but images will be generated sequentially)
      const aiRecipes = (await Promise.all(recipePromises)).filter(recipe => recipe !== null);
      
      console.log('SubscriptionBenefitsPage: AI generation completed. Recipes received:', aiRecipes.length);
      
      // Initialize ingredients and add to cart
      if (aiRecipes.length > 0) {
        initializeIngredients(aiRecipes);
        
        aiRecipes.forEach(recipe => {
          const selectedIngredients = recipe.ingredients.map(ing => ing.id);
          addToCart(recipe, recipe.servings, selectedIngredients);
        });

        // Store AI recipes in localStorage immediately (with fallback images)
        localStorage.setItem('aiGeneratedRecipes', JSON.stringify(aiRecipes));
        console.log('SubscriptionBenefitsPage: Stored recipes in localStorage');
        
        // Generate images for recipes one by one to respect rate limits
        console.log('Starting sequential image generation to respect OpenAI rate limits...');
        for (let i = 0; i < aiRecipes.length; i++) {
          const recipe = aiRecipes[i];
          try {
            console.log(`Generating image ${i + 1}/${aiRecipes.length} for: ${recipe.title}`);
            
            // Wait 15 seconds between each image request to respect rate limits
            if (i > 0) {
              console.log('Waiting 15 seconds before next image generation...');
              await new Promise(resolve => setTimeout(resolve, 15000));
            }
            
            // Generate image for this specific recipe
            const { data: imageData, error: imageError } = await supabase.functions.invoke(
              'generate-recipe-image',
              { body: { recipeName: recipe.title } }
            );
            
            if (!imageError && imageData?.imageUrl) {
              recipe.image = imageData.imageUrl;
              console.log(`✅ Successfully generated image for: ${recipe.title}`);
            } else {
              console.log(`⚠️ Using fallback image for: ${recipe.title}`, imageError?.message);
            }
            
            // Update localStorage with the new image
            localStorage.setItem('aiGeneratedRecipes', JSON.stringify(aiRecipes));
            
          } catch (error) {
            console.warn(`Failed to generate image for ${recipe.title}:`, error);
          }
        }
        
        console.log('✅ Image generation completed for all recipes');
      }
    } catch (error) {
      console.error('Error generating recipes in background:', error);
    }
  };

  useEffect(() => {
    // Check if we should generate recipes
    const pendingGeneration = localStorage.getItem('pendingRecipeGeneration');
    if (pendingGeneration) {
      setIsGeneratingRecipes(true);
      generateRecipesInBackground(JSON.parse(pendingGeneration));
      localStorage.removeItem('pendingRecipeGeneration');
    }

    const startTime = Date.now();
    const duration = isGeneratingRecipes ? 15000 : 2000; // Longer duration if generating recipes
    
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