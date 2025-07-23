export interface Recipe {
  id: string;
  title: string;
  image: string;
  calories: number;
  time: number;
  category: string;
  servings: number;
  macros: {
    carbs: number;
    protein: number;
    fat: number;
  };
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
}

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  selected: boolean;
}

export interface CartItem {
  recipe: Recipe;
  servings: number;
  selectedIngredients: string[];
}

export type CategoryType = 
  | "trending" 
  | "breakfast" 
  | "lunch" 
  | "dinner" 
  | "appetizer" 
  | "snacks" 
  | "desserts" 
  | "favorites";

export const CATEGORIES: Record<CategoryType, string> = {
  trending: "Lo que está de moda",
  breakfast: "Desayuno",
  lunch: "Almuerzo", 
  dinner: "Cena",
  appetizer: "Aperitivo",
  snacks: "Tentempié",
  desserts: "Postres",
  favorites: "Favoritos"
};