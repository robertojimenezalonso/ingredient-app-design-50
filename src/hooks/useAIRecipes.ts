import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '@/types/recipe';
import { toast } from '@/hooks/use-toast';

interface GenerateRecipeRequest {
  people: number;
  days: string[];
  meals: string[];
  restrictions?: string[];
}

export const useAIRecipes = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRecipe = async (request: GenerateRecipeRequest, showToast: boolean = true): Promise<Recipe | null> => {
    setIsGenerating(true);
    
    try {
      // Generate recipe text
      const { data: recipeData, error: recipeError } = await supabase.functions.invoke(
        'generate-recipe',
        {
          body: request
        }
      );

      if (recipeError) {
        throw new Error(`Error generating recipe: ${recipeError.message}`);
      }

      const recipe = recipeData.recipe;

      // Generate recipe image with retry logic for rate limits
      let imageUrl = 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=500&h=300&fit=crop';
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const { data: imageData, error: imageError } = await supabase.functions.invoke(
            'generate-recipe-image',
            {
              body: { recipeName: recipe.title }
            }
          );

          if (imageError) {
            // If it's a rate limit error, wait and retry
            if (imageError.message.includes('rate_limit_exceeded') || imageError.message.includes('429')) {
              console.log(`Rate limit hit, waiting before retry ${retryCount + 1}/${maxRetries}`);
              await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 15000)); // Wait 15s, 30s, 45s
              retryCount++;
              continue;
            } else {
              console.warn('Error generating image:', imageError.message);
              break;
            }
          } else if (imageData?.imageUrl) {
            imageUrl = imageData.imageUrl;
            break;
          }
        } catch (error) {
          console.warn('Image generation attempt failed:', error);
          retryCount++;
        }
      }

      // Combine recipe with image
      const finalRecipe: Recipe = {
        ...recipe,
        image: imageUrl
      };

      if (showToast) {
        toast({
          title: "Receta generada",
          description: `${recipe.title} ha sido creada con IA`
        });
      }

      return finalRecipe;
    } catch (error) {
      console.error('Error generating AI recipe:', error);
      toast({
        title: "Error",
        description: "No se pudo generar la receta. Intenta de nuevo.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMultipleRecipes = async (request: GenerateRecipeRequest, count: number = 3, showToast: boolean = true): Promise<Recipe[]> => {
    const recipes: Recipe[] = [];
    const generatedTitles = new Set<string>();
    
    console.log(`Starting generation of ${count} recipes`);
    
    // Add variety prompts to ensure different recipes
    const varietyPrompts = [
      "Genera una receta completamente diferente y original",
      "Crea una receta con ingredientes y estilo de cocina únicos", 
      "Diseña una receta innovadora y creativa",
      "Elabora una receta con técnicas culinarias distintas",
      "Inventa una receta con sabores y texturas diferentes"
    ];
    
    for (let i = 0; i < count; i++) {
      console.log(`Generating recipe ${i + 1} of ${count}`);
      try {
        // Add variety and uniqueness to each request
        const enhancedRequest = {
          ...request,
          restrictions: [...(request.restrictions || []), varietyPrompts[i % varietyPrompts.length]]
        };
        
        const recipe = await generateRecipe(enhancedRequest, showToast);
        if (recipe && !generatedTitles.has(recipe.title)) {
          recipes.push(recipe);
          generatedTitles.add(recipe.title);
          console.log(`Successfully generated recipe: ${recipe.title}`);
        } else if (recipe && generatedTitles.has(recipe.title)) {
          console.log(`Skipping duplicate recipe: ${recipe.title}`);
          // Try again with more specific prompt
          const retryRequest = {
            ...request,
            restrictions: [...(request.restrictions || []), `Evita repetir estas recetas: ${Array.from(generatedTitles).join(', ')}`, varietyPrompts[(i + 2) % varietyPrompts.length]]
          };
          const retryRecipe = await generateRecipe(retryRequest, false);
          if (retryRecipe && !generatedTitles.has(retryRecipe.title)) {
            recipes.push(retryRecipe);
            generatedTitles.add(retryRecipe.title);
            console.log(`Successfully generated unique recipe on retry: ${retryRecipe.title}`);
          }
        } else {
          console.error(`Failed to generate recipe ${i + 1} - recipe is null`);
        }
      } catch (error) {
        console.error(`Error generating recipe ${i + 1}:`, error);
        // Continue with the next recipe instead of stopping
      }
    }
    
    // Save recipes to localStorage so they persist across page navigation
    if (recipes.length > 0) {
      localStorage.setItem('aiGeneratedRecipes', JSON.stringify(recipes));
      console.log(`Saved ${recipes.length} AI recipes to localStorage`);
    }
    
    console.log(`Completed generation. Total successful recipes: ${recipes.length} out of ${count} requested`);
    return recipes;
  };

  return {
    generateRecipe,
    generateMultipleRecipes,
    isGenerating
  };
};