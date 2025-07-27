import { useState, useEffect, useCallback } from 'react';
import { Recipe, Ingredient } from '@/types/recipe';

export interface GroupedIngredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  recipes: string[];
  totalAmount: number;
  isSelected: boolean;
  displayAmount: string;
  recipeCount: number;
  allIds: string[]; // All ingredient IDs that share this name
}

/**
 * Simple global hook to manage ingredient selection state.
 * Each ingredient has a unique ID, and we track which IDs are selected.
 */
export const useGlobalIngredients = () => {
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('global-selected-ingredients');
    if (saved) {
      setSelectedIngredientIds(JSON.parse(saved));
    }
  }, []);

  // Initialize ingredients from recipes (select all by default)
  const initializeIngredients = useCallback((recipes: Recipe[]) => {
    const allIngredientIds: string[] = [];
    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        allIngredientIds.push(ingredient.id);
      });
    });
    
    // Select all ingredients by default (only if we have no selection yet)
    setSelectedIngredientIds(current => {
      if (current.length === 0) {
        localStorage.setItem('global-selected-ingredients', JSON.stringify(allIngredientIds));
        return allIngredientIds;
      }
      return current;
    });
  }, []);

  // Toggle individual ingredient by ID
  const toggleIngredientById = useCallback((ingredientId: string) => {
    setSelectedIngredientIds(current => {
      const newSelection = current.includes(ingredientId)
        ? current.filter(id => id !== ingredientId)
        : [...current, ingredientId];
      
      localStorage.setItem('global-selected-ingredients', JSON.stringify(newSelection));
      return newSelection;
    });
  }, []);

  // Toggle all ingredients with the same name
  const toggleIngredientByName = useCallback((recipes: Recipe[], ingredientName: string) => {
    // Find all ingredient IDs with this name across all recipes
    const relatedIds = recipes
      .flatMap(recipe => recipe.ingredients)
      .filter(ingredient => ingredient.name === ingredientName)
      .map(ingredient => ingredient.id);

    setSelectedIngredientIds(current => {
      // If any are selected, deselect all. Otherwise, select all.
      const anySelected = relatedIds.some(id => current.includes(id));
      
      let newSelection: string[];
      if (anySelected) {
        // Remove all related IDs
        newSelection = current.filter(id => !relatedIds.includes(id));
      } else {
        // Add all related IDs that aren't already selected
        newSelection = [...current, ...relatedIds.filter(id => !current.includes(id))];
      }
      
      localStorage.setItem('global-selected-ingredients', JSON.stringify(newSelection));
      console.log('toggleIngredientByName:', ingredientName, 'newSelection length:', newSelection.length);
      return newSelection;
    });
  }, []);

  // Get grouped ingredients from recipes (for ingredients list view)
  const getGroupedIngredients = useCallback((recipes: Recipe[]): GroupedIngredient[] => {
    const grouped: Record<string, {
      id: string;
      name: string;
      amount: string;
      unit: string;
      recipes: string[];
      totalAmount: number;
      allIds: string[];
    }> = {};

    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        const key = ingredient.name;
        const amount = parseFloat(ingredient.amount) || 0;

        if (grouped[key]) {
          grouped[key].recipes.push(recipe.title);
          // Always add to total regardless of selection status
          grouped[key].totalAmount += amount;
          grouped[key].allIds.push(ingredient.id);
        } else {
          grouped[key] = {
            id: ingredient.id,
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
            recipes: [recipe.title],
            // Always add to total regardless of selection status
            totalAmount: amount,
            allIds: [ingredient.id]
          };
        }
      });
    });

    return Object.values(grouped).map(item => ({
      ...item,
      displayAmount: item.totalAmount > 0 ? `${item.totalAmount} ${item.unit}` : `0 ${item.unit}`,
      recipeCount: item.recipes.length,
      // Un ingrediente está seleccionado si TODOS sus IDs están seleccionados
      isSelected: item.allIds.every(id => selectedIngredientIds.includes(id))
    }));
  }, [selectedIngredientIds]);

  // Get total count of selected ingredients (unique by name)
  const getSelectedIngredientsCount = useCallback((recipes: Recipe[]) => {
    const grouped = getGroupedIngredients(recipes);
    const selectedCount = grouped.filter(ingredient => ingredient.isSelected).length;
    console.log('getSelectedIngredientsCount:', selectedCount, 'from grouped:', grouped.map(g => ({ name: g.name, isSelected: g.isSelected })));
    return selectedCount;
  }, [getGroupedIngredients]);

  // Check if ingredient is selected
  const isIngredientSelected = useCallback((ingredientId: string) => {
    return selectedIngredientIds.includes(ingredientId);
  }, [selectedIngredientIds]);

  // Get selected ingredients for a specific recipe
  const getSelectedIngredientsForRecipe = useCallback((recipe: Recipe) => {
    return recipe.ingredients.filter(ingredient => 
      selectedIngredientIds.includes(ingredient.id)
    ).map(ingredient => ingredient.id);
  }, [selectedIngredientIds]);

  return {
    selectedIngredientIds,
    initializeIngredients,
    toggleIngredientByName,
    toggleIngredientById,
    getGroupedIngredients,
    getSelectedIngredientsCount,
    isIngredientSelected,
    getSelectedIngredientsForRecipe
  };
};