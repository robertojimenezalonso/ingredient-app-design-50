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
  const { updateConfig } = useUserConfig();
  const { generateRecipe } = useAIRecipes();
  const { initializeIngredients } = useGlobalIngredients();
  const { addToCart } = useCart();
  const [progress, setProgress] = useState(1);
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false, false, false]);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [recipesReady, setRecipesReady] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  
  const items = ['Supermercados', 'Ingredientes', 'Nutrición', 'Recetas', 'Imágenes'];
  const loadingMessages = ['Buscando supermercados…', 'Descargando ingredientes…', 'Información nutricional…', 'Preparando recetas…', 'Generando imágenes…'];

  const generateRecipesInBackground = async (params: any) => {
    try {
      console.log('SubscriptionBenefitsPage: Starting recipe generation...');
      setIsGeneratingRecipes(true);
      
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
      
      // Generate all recipes in parallel
      const aiRecipes = (await Promise.all(recipePromises)).filter(recipe => recipe !== null);
      
      console.log('SubscriptionBenefitsPage: Recipe text generation completed. Recipes received:', aiRecipes.length);
      setRecipesReady(true);
      
      if (aiRecipes.length > 0) {
        // Start image generation in background
        setIsGeneratingImages(true);
        console.log('SubscriptionBenefitsPage: Starting image generation...');
        
        // Check for existing images
        const recipesWithMissingImages = aiRecipes.filter(recipe => 
          !recipe.image || recipe.image.includes('unsplash.com')
        );
        
        if (recipesWithMissingImages.length > 0) {
          // Generate images for recipes that need them
          try {
            console.log(`Generating images for ${recipesWithMissingImages.length} recipes`);
            
            // Generate images one by one with delays
            for (const recipe of recipesWithMissingImages) {
              try {
                const { data: imageData, error: imageError } = await supabase.functions.invoke(
                  'generate-recipe-image',
                  {
                    body: { recipeName: recipe.title }
                  }
                );

                if (!imageError && imageData?.imageUrl) {
                  recipe.image = imageData.imageUrl;
                  console.log(`Generated image for: ${recipe.title}`);
                } else {
                  console.log(`Using fallback image for: ${recipe.title}`);
                }
                
                // Delay between image generations to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 12000));
              } catch (error) {
                console.warn(`Failed to generate image for ${recipe.title}:`, error);
              }
            }
          } catch (error) {
            console.error('Error during image generation:', error);
          }
        }
        
        console.log('SubscriptionBenefitsPage: Image generation completed');
        setImagesReady(true);
        
        // Initialize ingredients and add to cart
        initializeIngredients(aiRecipes);
        
        aiRecipes.forEach(recipe => {
          const selectedIngredients = recipe.ingredients.map(ing => ing.id);
          addToCart(recipe, recipe.servings, selectedIngredients);
        });

        // Store AI recipes in localStorage
        localStorage.setItem('aiGeneratedRecipes', JSON.stringify(aiRecipes));
        console.log('SubscriptionBenefitsPage: Stored recipes with images in localStorage');
      } else {
        setImagesReady(true); // No recipes means no images needed
      }
      
      setIsGeneratingRecipes(false);
      setIsGeneratingImages(false);
    } catch (error) {
      console.error('Error generating recipes in background:', error);
      setIsGeneratingRecipes(false);
      setIsGeneratingImages(false);
      setRecipesReady(true);
      setImagesReady(true);
    }
  };

  useEffect(() => {
    // Check if we should generate recipes
    const pendingGeneration = localStorage.getItem('pendingRecipeGeneration');
    if (pendingGeneration) {
      generateRecipesInBackground(JSON.parse(pendingGeneration));
      localStorage.removeItem('pendingRecipeGeneration');
    } else {
      // If no generation needed, mark as ready immediately
      setRecipesReady(true);
      setImagesReady(true);
    }
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    
    // Determine if we need to wait for generation
    const shouldWaitForGeneration = isGeneratingRecipes || isGeneratingImages;
    const baseDuration = shouldWaitForGeneration ? 25000 : 3000; // Extended time for generation
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      
      // If we're generating, extend the duration and slow down near the end
      let totalDuration = baseDuration;
      if (shouldWaitForGeneration && !recipesReady) {
        totalDuration = Math.max(baseDuration, elapsed + 5000); // Keep extending if not ready
      } else if (shouldWaitForGeneration && !imagesReady) {
        totalDuration = Math.max(baseDuration, elapsed + 8000); // Extra time for images
      }
      
      const ratio = elapsed / totalDuration;
      
      // Check if everything is ready for navigation
      const allReady = recipesReady && imagesReady;
      
      if (ratio >= 1 && allReady) {
        setProgress(100);
        // Mark as having a planning session when complete
        updateConfig({ hasPlanningSession: true });
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
      
      // Don't go past 95% if we're still generating
      if (shouldWaitForGeneration && !allReady) {
        newProgress = Math.min(95, newProgress);
      }
      
      setProgress(Math.min(100, Math.max(1, newProgress)));
      
      // Check items progressively based on progress and generation status
      const itemThresholds = [15, 30, 50, recipesReady ? 70 : 60, imagesReady ? 90 : 75];
      const newCheckedItems = itemThresholds.map(threshold => newProgress >= threshold);
      setCheckedItems(newCheckedItems);
      
      requestAnimationFrame(updateProgress);
    };
    
    requestAnimationFrame(updateProgress);
  }, [navigate, recipesReady, imagesReady, isGeneratingRecipes, isGeneratingImages]);

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
            if (isGeneratingRecipes && !recipesReady) return 'Preparando recetas…';
            if (isGeneratingImages && !imagesReady) return 'Generando imágenes…';
            
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