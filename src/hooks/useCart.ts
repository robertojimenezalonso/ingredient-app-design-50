import { useState, useEffect } from 'react';
import { CartItem, Recipe } from '@/types/recipe';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedCart = localStorage.getItem('recipe-cart');
    const savedSelected = localStorage.getItem('selected-ingredients');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedSelected) {
      setSelectedIngredientIds(new Set(JSON.parse(savedSelected)));
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('recipe-cart', JSON.stringify(newCart));
    
    // Auto-select all ingredients from new cart
    const allIngredientIds = new Set<string>();
    newCart.forEach(item => {
      item.selectedIngredients.forEach(id => allIngredientIds.add(id));
    });
    setSelectedIngredientIds(allIngredientIds);
    localStorage.setItem('selected-ingredients', JSON.stringify(Array.from(allIngredientIds)));
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

  const toggleIngredientSelection = (ingredientId: string) => {
    const newSelected = new Set(selectedIngredientIds);
    if (newSelected.has(ingredientId)) {
      newSelected.delete(ingredientId);
    } else {
      newSelected.add(ingredientId);
    }
    setSelectedIngredientIds(newSelected);
    localStorage.setItem('selected-ingredients', JSON.stringify(Array.from(newSelected)));
    
    // Update cart items to reflect deselected ingredients
    const updatedCart = cart.map(item => ({
      ...item,
      selectedIngredients: item.selectedIngredients.filter(id => 
        id === ingredientId ? newSelected.has(id) : true
      )
    }));
    
    setCart(updatedCart);
    localStorage.setItem('recipe-cart', JSON.stringify(updatedCart));
  };

  const getGroupedIngredients = () => {
    const grouped: Record<string, { 
      id: string;
      name: string; 
      amount: string; 
      unit: string; 
      recipes: string[];
      totalAmount: number;
      isSelected: boolean;
    }> = {};
    
    cart.forEach(item => {
      item.selectedIngredients.forEach(ingredientId => {
        const ingredient = item.recipe.ingredients.find(ing => ing.id === ingredientId);
        if (ingredient && selectedIngredientIds.has(ingredientId)) {
          const key = ingredient.name;
          const amount = parseFloat(ingredient.amount) || 0;
          
          if (grouped[key]) {
            grouped[key].recipes.push(item.recipe.title);
            grouped[key].totalAmount += amount;
          } else {
            grouped[key] = {
              id: ingredientId,
              name: ingredient.name,
              amount: ingredient.amount,
              unit: ingredient.unit,
              recipes: [item.recipe.title],
              totalAmount: amount,
              isSelected: selectedIngredientIds.has(ingredientId)
            };
          }
        }
      });
    });

    return Object.values(grouped).map(item => ({
      ...item,
      displayAmount: item.totalAmount > 0 ? `${item.totalAmount}${item.unit}` : item.amount,
      recipeCount: item.recipes.length
    }));
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    getTotalIngredients,
    getGroupedIngredients,
    toggleIngredientSelection,
    selectedIngredientIds
  };
};