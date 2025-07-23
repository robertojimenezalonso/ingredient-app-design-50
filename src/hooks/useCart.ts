import { useState, useEffect } from 'react';
import { CartItem, Recipe } from '@/types/recipe';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('recipe-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('recipe-cart', JSON.stringify(newCart));
  };

  const addToCart = (recipe: Recipe, servings: number, selectedIngredients: string[]) => {
    const existingIndex = cart.findIndex(item => item.recipe.id === recipe.id);
    
    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex] = {
        recipe,
        servings,
        selectedIngredients
      };
      saveCart(newCart);
    } else {
      saveCart([...cart, { recipe, servings, selectedIngredients }]);
    }
  };

  const removeFromCart = (recipeId: string) => {
    const newCart = cart.filter(item => item.recipe.id !== recipeId);
    saveCart(newCart);
  };

  const getTotalIngredients = () => {
    return cart.reduce((total, item) => total + item.selectedIngredients.length, 0);
  };

  const getGroupedIngredients = () => {
    const grouped: Record<string, { name: string; amount: string; unit: string; recipes: string[] }> = {};
    
    cart.forEach(item => {
      item.selectedIngredients.forEach(ingredientId => {
        const ingredient = item.recipe.ingredients.find(ing => ing.id === ingredientId);
        if (ingredient) {
          const key = ingredient.name;
          if (grouped[key]) {
            grouped[key].recipes.push(item.recipe.title);
          } else {
            grouped[key] = {
              name: ingredient.name,
              amount: ingredient.amount,
              unit: ingredient.unit,
              recipes: [item.recipe.title]
            };
          }
        }
      });
    });

    return Object.values(grouped);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    getTotalIngredients,
    getGroupedIngredients
  };
};