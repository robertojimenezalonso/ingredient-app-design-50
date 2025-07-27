import { useState, useEffect } from 'react';
import { CartItem, Recipe } from '@/types/recipe';
import { useGlobalIngredients } from './useGlobalIngredients';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { 
    getSelectedIngredientsForRecipe, 
    getGroupedIngredients,
    getSelectedIngredientsCount,
    toggleIngredientByName,
    initializeIngredients
  } = useGlobalIngredients();

  useEffect(() => {
    const savedCart = localStorage.getItem('recipe-cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCart(parsedCart);
      
      // Initialize global ingredients with cart recipes
      const allRecipes = parsedCart.map((item: CartItem) => item.recipe);
      initializeIngredients(allRecipes);
    }
  }, [initializeIngredients]);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('recipe-cart', JSON.stringify(newCart));
  };

  const addToCart = (recipe: Recipe, servings: number, selectedIngredients?: string[]) => {
    const existingIndex = cart.findIndex(item => item.recipe.id === recipe.id);
    
    // Use current selected ingredients if not provided
    const ingredientsToUse = selectedIngredients || getSelectedIngredientsForRecipe(recipe);
    
    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex] = {
        recipe,
        servings,
        selectedIngredients: ingredientsToUse
      };
      saveCart(newCart);
    } else {
      saveCart([...cart, { recipe, servings, selectedIngredients: ingredientsToUse }]);
    }
  };

  const removeFromCart = (recipeId: string) => {
    const newCart = cart.filter(item => item.recipe.id !== recipeId);
    saveCart(newCart);
  };

  const getTotalIngredients = () => {
    const allRecipes = cart.map(item => item.recipe);
    return getSelectedIngredientsCount(allRecipes);
  };

  const toggleIngredientSelection = (ingredientName: string) => {
    const allRecipes = cart.map(item => item.recipe);
    toggleIngredientByName(allRecipes, ingredientName);
  };

  const getGroupedIngredientsFromCart = () => {
    const allRecipes = cart.map(item => item.recipe);
    return getGroupedIngredients(allRecipes);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    getTotalIngredients,
    getGroupedIngredients: getGroupedIngredientsFromCart,
    toggleIngredientSelection
  };
};