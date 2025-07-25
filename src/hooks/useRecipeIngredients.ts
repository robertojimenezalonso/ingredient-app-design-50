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

  // Start with no ingredients selected by default
  // useEffect(() => {
  //   // Auto-select all ingredients when recipes change
  //   const allIngredientIds = new Set<string>();
  //   recipes.forEach(recipe => {
  //     recipe.ingredients.forEach(ingredient => {
  //       allIngredientIds.add(ingredient.id);
  //     });
  //   });
  //   setSelectedIngredientIds(allIngredientIds);
  // }, [recipes]);

  const toggleIngredientSelection = (ingredientId: string) => {
    const newSelected = new Set(selectedIngredientIds);
    if (newSelected.has(ingredientId)) {
      newSelected.delete(ingredientId);
    } else {
      newSelected.add(ingredientId);
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
    }> = {};

    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        const key = ingredient.name;
        const amount = parseFloat(ingredient.amount) || 0;

        if (grouped[key]) {
          grouped[key].recipes.push(recipe.title);
          grouped[key].totalAmount += amount;
        } else {
          grouped[key] = {
            id: ingredient.id,
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
            recipes: [recipe.title],
            totalAmount: amount,
            isSelected: selectedIngredientIds.has(ingredient.id)
          };
        }
      });
    });

    return Object.values(grouped).map(item => ({
      ...item,
      displayAmount: item.totalAmount > 0 ? `${item.totalAmount} ${item.unit}` : `${item.amount} ${item.unit}`,
      recipeCount: item.recipes.length,
      isSelected: selectedIngredientIds.has(item.id)
    }));
  };

  return {
    selectedIngredientIds,
    toggleIngredientSelection,
    getGroupedIngredients
  };
};