import { useState, useEffect } from 'react';
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
}

export const useRecipeIngredients = (recipes: Recipe[]) => {
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Auto-select all ingredients when recipes change
    const allIngredientIds = new Set<string>();
    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        allIngredientIds.add(ingredient.id);
      });
    });
    setSelectedIngredientIds(allIngredientIds);
  }, [recipes]);

  const toggleIngredientSelection = (ingredientId: string) => {
    // Find all ingredient IDs that share the same name as the clicked ingredient
    const clickedIngredientName = recipes
      .flatMap(recipe => recipe.ingredients)
      .find(ingredient => ingredient.id === ingredientId)?.name;
    
    if (!clickedIngredientName) return;
    
    // Get all ingredient IDs with the same name
    const relatedIds = recipes
      .flatMap(recipe => recipe.ingredients)
      .filter(ingredient => ingredient.name === clickedIngredientName)
      .map(ingredient => ingredient.id);
    
    const newSelected = new Set(selectedIngredientIds);
    
    // If any of the related IDs are selected, deselect all of them
    // Otherwise, select all of them
    const anySelected = relatedIds.some(id => newSelected.has(id));
    
    if (anySelected) {
      relatedIds.forEach(id => newSelected.delete(id));
    } else {
      relatedIds.forEach(id => newSelected.add(id));
    }
    
    setSelectedIngredientIds(newSelected);
  };

  const getGroupedIngredients = (): GroupedIngredient[] => {
    const grouped: Record<string, {
      id: string;
      name: string;
      amount: string;
      unit: string;
      recipes: string[];
      totalAmount: number;
      isSelected: boolean;
      allIds: string[]; // Track all ingredient IDs for this group
    }> = {};

    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        const key = ingredient.name;
        const amount = parseFloat(ingredient.amount) || 0;

        if (grouped[key]) {
          grouped[key].recipes.push(recipe.title);
          grouped[key].totalAmount += amount;
          grouped[key].allIds.push(ingredient.id);
        } else {
          grouped[key] = {
            id: ingredient.id,
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
            recipes: [recipe.title],
            totalAmount: amount,
            isSelected: selectedIngredientIds.has(ingredient.id),
            allIds: [ingredient.id]
          };
        }
      });
    });

    return Object.values(grouped).map(item => ({
      ...item,
      displayAmount: item.totalAmount > 0 ? `${item.totalAmount} ${item.unit}` : `${item.amount} ${item.unit}`,
      recipeCount: item.recipes.length,
      // Check if ANY of the ingredient IDs in this group are selected
      isSelected: item.allIds.some(id => selectedIngredientIds.has(id))
    }));
  };

  return {
    selectedIngredientIds,
    toggleIngredientSelection,
    getGroupedIngredients
  };
};