import { useState, useEffect } from 'react';
import { Recipe } from '@/types/recipe';
import { RecipeGridCard } from '@/components/RecipeGridCard';
import { useRecipeBank } from '@/hooks/useRecipeBank';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RecipeWithMeal extends Recipe {
  mealTypeLabel: string;
}

interface DayRecipeListProps {
  selectedDate: Date;
  onRecipeClick: (recipe: Recipe) => void;
  onAddRecipe: (recipe: Recipe) => void;
  onRecipesChange?: (recipes: RecipeWithMeal[]) => void;
}

const MEAL_TYPES = ['Desayuno', 'Comida', 'Cena'];

export const DayRecipeList = ({
  selectedDate,
  onRecipeClick,
  onAddRecipe,
  onRecipesChange
}: DayRecipeListProps) => {
  const { recipes, convertToRecipe, isLoading } = useRecipeBank();
  const [dayRecipes, setDayRecipes] = useState<RecipeWithMeal[]>([]);

  useEffect(() => {
    if (!isLoading && recipes.length > 0) {
      // Generate deterministic recipes for this specific date
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const dayIndex = parseInt(dateString.replace(/-/g, '')) % recipes.length;
      
      // Select 3 recipes for breakfast, lunch, and dinner
      const selectedRecipes: RecipeWithMeal[] = MEAL_TYPES.map((mealType, index) => {
        const recipeIndex = (dayIndex + index) % recipes.length;
        const recipe = convertToRecipe(recipes[recipeIndex]);
        return {
          ...recipe,
          category: index === 0 ? 'breakfast' : index === 1 ? 'lunch' : 'dinner',
          mealTypeLabel: mealType
        } as RecipeWithMeal;
      });
      
      setDayRecipes(selectedRecipes);
      onRecipesChange?.(selectedRecipes);
    }
  }, [selectedDate, recipes, isLoading, convertToRecipe, onRecipesChange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4">
      {dayRecipes.map((recipe, index) => (
        <RecipeGridCard
          key={`${recipe.id}-${index}`}
          recipe={recipe}
          mealType={recipe.mealTypeLabel}
          onClick={() => onRecipeClick(recipe)}
          onAdd={() => onAddRecipe(recipe)}
        />
      ))}
    </div>
  );
};