// Este hook ahora es un wrapper del hook optimizado para mantener compatibilidad
// El código existente puede seguir usando useRecipeBank
import { useOptimizedRecipes } from './useOptimizedRecipes';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export const useRecipeBank = () => {
  const optimizedRecipes = useOptimizedRecipes();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRecipeBank = async (category?: string) => {
    try {
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-recipe-bank', {
        body: { category }
      });
      
      if (error) throw error;

      console.log('Recipe bank generation result:', data);
      return data;
    } catch (error) {
      console.error('Error generating recipe bank:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  // Adaptador para mantener compatibilidad con la API anterior
  const getRecipesByCategory = (category: string) => {
    const categoryMap: { [key: string]: any } = {
      'desayuno': 'breakfast',
      'comida': 'lunch',
      'cena': 'dinner',
      'aperitivo': 'appetizer',
      'snack': 'snacks'
    };
    
    const mappedCategory = categoryMap[category] || category;
    return optimizedRecipes.recipes.filter(r => r.category === mappedCategory);
  };

  const getRandomRecipesByCategory = (category: string, count: number = 1) => {
    const recipes = getRecipesByCategory(category);
    const shuffled = [...recipes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  return {
    recipes: optimizedRecipes.recipes,
    isLoading: optimizedRecipes.isLoading,
    isGenerating,
    loadRecipes: () => {}, // React Query maneja esto automáticamente
    generateRecipeBank,
    getRecipesByCategory,
    getRandomRecipesByCategory,
    convertToRecipe: (recipe: any, servings: number) => {
      // Si ya es una receta, ajustar servings
      return {
        ...recipe,
        servings,
        calories: Math.round(recipe.calories * (servings / recipe.servings)),
        macros: {
          carbs: Math.round(recipe.macros.carbs * (servings / recipe.servings)),
          protein: Math.round(recipe.macros.protein * (servings / recipe.servings)),
          fat: Math.round(recipe.macros.fat * (servings / recipe.servings)),
        }
      };
    },
    getRecipesForPlan: optimizedRecipes.getRecipesForPlan
  };
};
