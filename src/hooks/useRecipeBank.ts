import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '@/types/recipe';
import type { Database } from '@/integrations/supabase/types';

type RecipeBankRow = Database['public']['Tables']['recipe_bank']['Row'];

interface RecipeBankItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  preparation_time: number;
  calories: number;
  servings: number;
  ingredients: Array<{name: string, amount: string, unit: string}>;
  instructions: string[];
  macronutrients: {
    protein: number;
    fat: number;
    carbs: number;
  };
  micronutrients: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export const useRecipeBank = () => {
  const [recipes, setRecipes] = useState<RecipeBankItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadRecipes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('recipe_bank')
        .select('*')
        .order('category', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading recipe bank:', error);
        return;
      }

      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        ingredients: item.ingredients as Array<{name: string, amount: string, unit: string}>,
        macronutrients: item.macronutrients as {
          protein: number;
          fat: number;
          carbs: number;
        },
        micronutrients: item.micronutrients as Record<string, string>
      }));

      setRecipes(transformedData);
    } catch (error) {
      console.error('Error loading recipe bank:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecipeBank = async () => {
    try {
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-recipe-bank');
      
      if (error) {
        throw error;
      }

      console.log('Recipe bank generation result:', data);
      
      // Reload recipes after generation
      await loadRecipes();
      
      return data;
    } catch (error) {
      console.error('Error generating recipe bank:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const getRecipesByCategory = (category: string): RecipeBankItem[] => {
    return recipes.filter(recipe => recipe.category === category);
  };

  const getRandomRecipesByCategory = (category: string, count: number = 1): RecipeBankItem[] => {
    const categoryRecipes = getRecipesByCategory(category);
    const shuffled = [...categoryRecipes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Convert RecipeBankItem to Recipe format for compatibility
  const convertToRecipe = (bankItem: RecipeBankItem, servings: number = 1): Recipe => {
    const servingMultiplier = servings / bankItem.servings;
    
    return {
      id: bankItem.id,
      title: bankItem.title,
      image: bankItem.image_url,
      calories: Math.round(bankItem.calories * servingMultiplier),
      time: bankItem.preparation_time,
      category: bankItem.category,
      servings: servings,
      macros: {
        carbs: Math.round(bankItem.macronutrients.carbs * servingMultiplier),
        protein: Math.round(bankItem.macronutrients.protein * servingMultiplier),
        fat: Math.round(bankItem.macronutrients.fat * servingMultiplier),
      },
      ingredients: bankItem.ingredients.map(ingredient => ({
        id: `${bankItem.id}-${ingredient.name}`,
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit,
        selected: true
      })),
      instructions: bankItem.instructions,
      nutrition: {
        calories: Math.round(bankItem.calories * servingMultiplier),
        protein: Math.round(bankItem.macronutrients.protein * servingMultiplier),
        carbs: Math.round(bankItem.macronutrients.carbs * servingMultiplier),
        fat: Math.round(bankItem.macronutrients.fat * servingMultiplier),
        fiber: 0, // Not available in bank data
        sugar: 0, // Not available in bank data
      }
    };
  };

  const getRecipesForPlan = (
    days: string[], 
    meals: string[], 
    people: number = 1
  ): { [key: string]: { [key: string]: Recipe[] } } => {
    const plan: { [key: string]: { [key: string]: Recipe[] } } = {};
    
    days.forEach(day => {
      plan[day] = {};
      meals.forEach(meal => {
        // Map meal names to categories
        const categoryMap: { [key: string]: string } = {
          'Desayuno': 'desayuno',
          'Almuerzo': 'comida',
          'Cena': 'cena',
          'Snack': 'snack',
          'Aperitivo': 'aperitivo',
          'Merienda': 'merienda'
        };
        
        const category = categoryMap[meal] || meal.toLowerCase();
        const randomRecipes = getRandomRecipesByCategory(category, 1);
        
        plan[day][meal] = randomRecipes.map(recipe => 
          convertToRecipe(recipe, people)
        );
      });
    });
    
    return plan;
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  return {
    recipes,
    isLoading,
    isGenerating,
    loadRecipes,
    generateRecipeBank,
    getRecipesByCategory,
    getRandomRecipesByCategory,
    convertToRecipe,
    getRecipesForPlan
  };
};