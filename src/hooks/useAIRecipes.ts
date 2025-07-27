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

  const generateRecipe = async (request: GenerateRecipeRequest): Promise<Recipe | null> => {
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

      // Generate recipe image
      const { data: imageData, error: imageError } = await supabase.functions.invoke(
        'generate-recipe-image',
        {
          body: { recipeName: recipe.title }
        }
      );

      if (imageError) {
        console.warn('Error generating image:', imageError.message);
        // Continue without image if image generation fails
      }

      // Combine recipe with image
      const finalRecipe: Recipe = {
        ...recipe,
        image: imageData?.imageUrl || 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=500&h=300&fit=crop'
      };

      toast({
        title: "Receta generada",
        description: `${recipe.title} ha sido creada con IA`
      });

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

  const generateMultipleRecipes = async (request: GenerateRecipeRequest, count: number = 3): Promise<Recipe[]> => {
    const recipes: Recipe[] = [];
    
    console.log(`Starting generation of ${count} recipes`);
    
    for (let i = 0; i < count; i++) {
      console.log(`Generating recipe ${i + 1} of ${count}`);
      try {
        const recipe = await generateRecipe(request);
        if (recipe) {
          recipes.push(recipe);
          console.log(`Successfully generated recipe: ${recipe.title}`);
        } else {
          console.error(`Failed to generate recipe ${i + 1} - recipe is null`);
        }
      } catch (error) {
        console.error(`Error generating recipe ${i + 1}:`, error);
        // Continue with the next recipe instead of stopping
      }
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