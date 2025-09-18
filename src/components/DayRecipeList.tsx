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
}

const MEAL_TYPES = ['Desayuno', 'Comida', 'Cena'];

export const DayRecipeList = ({
  selectedDate,
  onRecipeClick,
  onAddRecipe
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
    }
  }, [selectedDate, recipes, isLoading, convertToRecipe]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4">
      
      <div className="space-y-4">
        {dayRecipes.map((recipe, index) => (
          <div key={`${recipe.id}-${index}`} className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                {recipe.mealTypeLabel}
              </h3>
            </div>
            <RecipeGridCard
              recipe={recipe}
              onClick={() => onRecipeClick(recipe)}
              onAdd={() => onAddRecipe(recipe)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};