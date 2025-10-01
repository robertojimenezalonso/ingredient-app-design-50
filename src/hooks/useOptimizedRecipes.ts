import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Recipe, CategoryType } from '@/types/recipe';
import { useMemo } from 'react';

interface RecipeBankRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string;
  preparation_time: number;
  calories: number;
  servings: number;
  ingredients: any;
  instructions: string[];
  macronutrients: any;
}

// Fetch recipes from database with only needed fields
const fetchRecipes = async (): Promise<RecipeBankRow[]> => {
  const { data, error } = await supabase
    .from('recipe_bank')
    .select('id, title, description, category, image_url, preparation_time, calories, servings, ingredients, instructions, macronutrients')
    .order('category', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Transform database row to Recipe format
const transformToRecipe = (row: RecipeBankRow, servings: number = 1): Recipe => {
  const servingMultiplier = servings / row.servings;
  const macros = row.macronutrients as any;
  
  const extractMacroValue = (macroData: any): number => {
    if (typeof macroData === 'number') return macroData;
    if (typeof macroData === 'object' && macroData !== null) {
      return macroData.grams || macroData.value || 0;
    }
    return 0;
  };

  const carbs = extractMacroValue(macros?.carbs);
  const protein = extractMacroValue(macros?.protein);
  const fat = extractMacroValue(macros?.fat);

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
    id: row.id,
    title: row.title,
    image: row.image_url,
    calories: Math.round(row.calories * servingMultiplier),
    time: row.preparation_time,
    category: categoryMap[row.category.toLowerCase()] || 'lunch',
    servings: servings,
    macros: {
      carbs: Math.round(carbs * servingMultiplier),
      protein: Math.round(protein * servingMultiplier),
      fat: Math.round(fat * servingMultiplier),
    },
    ingredients: (row.ingredients as any[] || []).map((ingredient: any) => ({
      id: `${row.id}-${ingredient.name}`,
      name: ingredient.name,
      amount: ingredient.amount,
      unit: ingredient.unit,
      selected: true
    })),
    instructions: row.instructions || [],
    nutrition: {
      calories: Math.round(row.calories * servingMultiplier),
      protein: Math.round(protein * servingMultiplier),
      carbs: Math.round(carbs * servingMultiplier),
      fat: Math.round(fat * servingMultiplier),
      fiber: 0,
      sugar: 0,
    }
  };
};

export const useOptimizedRecipes = () => {
  // Single query with React Query caching
  const { data: recipesData = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  });

  // Memoize transformed recipes
  const recipes = useMemo(() => 
    recipesData.map(row => transformToRecipe(row, row.servings)),
    [recipesData]
  );

  // Memoize category filtering
  const getRecipesByCategory = useMemo(() => 
    (category: CategoryType, limit?: number) => {
      const filtered = recipes.filter(recipe => recipe.category === category);
      return limit ? filtered.slice(0, limit) : filtered;
    },
    [recipes]
  );

  // Get random recipes by category
  const getRandomRecipesByCategory = useMemo(() =>
    (category: string, count: number = 1): Recipe[] => {
      const categoryMap: { [key: string]: CategoryType } = {
        'desayuno': 'breakfast',
        'comida': 'lunch',
        'cena': 'dinner',
        'aperitivo': 'appetizer',
        'snack': 'snacks'
      };
      
      const mappedCategory = categoryMap[category] || 'lunch';
      const categoryRecipes = recipes.filter(r => r.category === mappedCategory);
      const shuffled = [...categoryRecipes].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    },
    [recipes]
  );

  // Get recipes for meal plan
  const getRecipesForPlan = useMemo(() =>
    (days: string[], meals: string[], people: number = 1): { [key: string]: { [key: string]: Recipe[] } } => {
      const plan: { [key: string]: { [key: string]: Recipe[] } } = {};
      
      days.forEach(day => {
        plan[day] = {};
        meals.forEach(meal => {
          const categoryMap: { [key: string]: string } = {
            'Desayuno': 'desayuno',
            'Almuerzo': 'comida',
            'Cena': 'cena',
            'Snack': 'comida',
            'Aperitivo': 'comida',
            'Merienda': 'comida'
          };
          
          const category = categoryMap[meal] || 'comida';
          const randomRecipes = getRandomRecipesByCategory(category, 1);
          
          plan[day][meal] = randomRecipes.map(recipe => ({
            ...recipe,
            servings: people,
            calories: Math.round(recipe.calories * (people / recipe.servings)),
            macros: {
              carbs: Math.round(recipe.macros.carbs * (people / recipe.servings)),
              protein: Math.round(recipe.macros.protein * (people / recipe.servings)),
              fat: Math.round(recipe.macros.fat * (people / recipe.servings)),
            }
          }));
        });
      });
      
      return plan;
    },
    [getRandomRecipesByCategory]
  );

  const getRecipeById = useMemo(() =>
    (id: string): Recipe | undefined => recipes.find(recipe => recipe.id === id),
    [recipes]
  );

  return {
    recipes,
    isLoading,
    getRecipesByCategory,
    getRandomRecipesByCategory,
    getRecipesForPlan,
    getRecipeById,
    refetch: () => {}, // React Query handles refetching
  };
};
