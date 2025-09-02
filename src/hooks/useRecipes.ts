import { useState, useEffect } from 'react';
import { Recipe, CategoryType } from '@/types/recipe';
import { supabase } from '@/integrations/supabase/client';

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
    loadFavoritesFromStorage();
  }, []);

  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('recipe_bank')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recipes:', error);
        return;
      }

      // Transform Supabase data to Recipe format
      const transformedRecipes: Recipe[] = data.map(recipe => {
        const macronutrients = recipe.macronutrients as any;
        
        // Map Spanish categories to English
        const categoryMap: { [key: string]: CategoryType } = {
          'desayuno': 'breakfast',
          'almuerzo': 'lunch', 
          'comida': 'lunch',
          'cena': 'dinner',
          'aperitivo': 'appetizer',
          'snack': 'snacks',
          'tentempie': 'snacks',
          'postre': 'desserts'
        };
        
        return {
          id: recipe.id,
          title: recipe.title,
          image: recipe.image_url,
          calories: recipe.calories,
          time: recipe.preparation_time,
          category: categoryMap[recipe.category.toLowerCase()] || 'lunch',
          servings: recipe.servings,
          macros: {
            carbs: macronutrients?.carbs?.grams || macronutrients?.carbs || 0,
            protein: macronutrients?.protein?.grams || macronutrients?.protein || 0,
            fat: macronutrients?.fat?.grams || macronutrients?.fat || 0
          },
          ingredients: recipe.ingredients as any[] || [],
          instructions: recipe.instructions || [],
          nutrition: {
            calories: recipe.calories,
            protein: macronutrients?.protein?.grams || macronutrients?.protein || 0,
            carbs: macronutrients?.carbs?.grams || macronutrients?.carbs || 0,
            fat: macronutrients?.fat?.grams || macronutrients?.fat || 0,
            fiber: macronutrients?.fiber?.grams || macronutrients?.fiber || 0,
            sugar: macronutrients?.sugar?.grams || macronutrients?.sugar || 0
          }
        };
      });

      setRecipes(transformedRecipes);
    } catch (error) {
      console.error('Error in fetchRecipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFavoritesFromStorage = () => {
    const savedFavorites = localStorage.getItem('recipe-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  };

  const saveFavoritesToStorage = (newFavorites: string[]) => {
    localStorage.setItem('recipe-favorites', JSON.stringify(newFavorites));
  };

  const toggleFavorite = (recipeId: string) => {
    const newFavorites = favorites.includes(recipeId)
      ? favorites.filter(id => id !== recipeId)
      : [...favorites, recipeId];
    
    setFavorites(newFavorites);
    saveFavoritesToStorage(newFavorites);
  };

  const getRecipesByCategory = (category: CategoryType, limit?: number) => {
    let filteredRecipes = category === 'favorites' 
      ? recipes.filter(recipe => favorites.includes(recipe.id))
      : recipes.filter(recipe => recipe.category === category);
    
    if (limit) {
      filteredRecipes = filteredRecipes.slice(0, limit);
    }
    
    return filteredRecipes;
  };

  const getRecipeById = (id: string) => {
    return recipes.find(recipe => recipe.id === id);
  };

  return {
    recipes,
    favorites,
    isLoading,
    toggleFavorite,
    getRecipesByCategory,
    getRecipeById,
    refetch: fetchRecipes
  };
};