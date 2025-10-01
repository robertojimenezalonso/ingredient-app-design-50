import { useState, useEffect } from 'react';
import { Recipe, CategoryType } from '@/types/recipe';
import { useOptimizedRecipes } from './useOptimizedRecipes';

// Wrapper hook que mantiene compatibilidad con el código existente
// pero usa el nuevo hook optimizado internamente
export const useRecipes = () => {
  const { recipes, isLoading, getRecipesByCategory: getOptimizedRecipesByCategory, getRecipeById } = useOptimizedRecipes();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadFavoritesFromStorage();
  }, []);

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
    if (category === 'favorites') {
      const favoriteRecipes = recipes.filter(recipe => favorites.includes(recipe.id));
      return limit ? favoriteRecipes.slice(0, limit) : favoriteRecipes;
    }
    return getOptimizedRecipesByCategory(category, limit);
  };

  return {
    recipes,
    favorites,
    isLoading,
    toggleFavorite,
    getRecipesByCategory,
    getRecipeById,
    refetch: () => {}, // React Query maneja el refetch automáticamente
  };
};
