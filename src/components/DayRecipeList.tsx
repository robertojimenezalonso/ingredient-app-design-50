import { useState, useEffect } from 'react';
import { Recipe } from '@/types/recipe';
import { RecipeGridCard } from '@/components/RecipeGridCard';
import { useRecipeBank } from '@/hooks/useRecipeBank';
import { format, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

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
    if (!isLoading && recipes.length > 0 && isToday(selectedDate)) {
      // Only generate recipes for today
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
    } else if (!isToday(selectedDate)) {
      setDayRecipes([]);
      onRecipesChange?.([]);
    }
  }, [selectedDate, recipes, isLoading, convertToRecipe, onRecipesChange]);

  const handleGeneratePlan = () => {
    if (!isLoading && recipes.length > 0) {
      // Generate recipes for future dates
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const dayIndex = parseInt(dateString.replace(/-/g, '')) % recipes.length;
      
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
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show recipes for today, generate button for future dates
  if (isToday(selectedDate)) {
    return (
      <div className="space-y-4 px-4">
        {dayRecipes.map((recipe, index) => (
          <RecipeGridCard
            key={`${recipe.id}-${index}`}
            recipe={recipe}
            mealType={recipe.mealTypeLabel}
            isFirstCard={index === 0}
            onClick={() => onRecipeClick(recipe)}
            onAdd={() => onAddRecipe(recipe)}
          />
        ))}
      </div>
    );
  }

  // Show generate button for future dates or generated recipes
  return (
    <div className="px-4 py-8">
      {dayRecipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Button 
            onClick={handleGeneratePlan}
            className="w-full max-w-md py-6 text-lg"
          >
            Generar plan
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {dayRecipes.map((recipe, index) => (
            <RecipeGridCard
              key={`${recipe.id}-${index}`}
              recipe={recipe}
              mealType={recipe.mealTypeLabel}
              isFirstCard={index === 0}
              onClick={() => onRecipeClick(recipe)}
              onAdd={() => onAddRecipe(recipe)}
            />
          ))}
        </div>
      )}
    </div>
  );
};