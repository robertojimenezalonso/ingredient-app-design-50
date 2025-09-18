import { useState, useEffect } from 'react';
import { Recipe } from '@/types/recipe';
import { RecipeGridCard } from '@/components/RecipeGridCard';
import { useRecipeBank } from '@/hooks/useRecipeBank';
import { format, addDays, startOfDay, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

interface RecipeWithMeal extends Recipe {
  mealTypeLabel: string;
}

interface DayPlanListProps {
  selectedDate: Date;
  onRecipeClick: (recipe: Recipe) => void;
  onAddRecipe: (recipe: Recipe) => void;
}

interface DayPlan {
  date: Date;
  recipes: RecipeWithMeal[];
  hasGenerated: boolean;
}

const MEAL_TYPES = ['Desayuno', 'Comida', 'Cena'];

export const DayRecipeList = ({
  selectedDate,
  onRecipeClick,
  onAddRecipe
}: DayPlanListProps) => {
  const { recipes, convertToRecipe, isLoading } = useRecipeBank();
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);

  useEffect(() => {
    if (!isLoading && recipes.length > 0) {
      // Generate 7 days starting from today
      const today = startOfDay(new Date());
      const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
      
      const plans: DayPlan[] = days.map(date => ({
        date,
        recipes: isToday(date) ? generateRecipesForDate(date) : [],
        hasGenerated: isToday(date)
      }));
      
      setDayPlans(plans);
    }
  }, [recipes, isLoading]);

  const generateRecipesForDate = (date: Date): RecipeWithMeal[] => {
    if (recipes.length === 0) return [];
    
    const dateString = format(date, 'yyyy-MM-dd');
    const dayIndex = parseInt(dateString.replace(/-/g, '')) % recipes.length;
    
    return MEAL_TYPES.map((mealType, index) => {
      const recipeIndex = (dayIndex + index) % recipes.length;
      const recipe = convertToRecipe(recipes[recipeIndex]);
      return {
        ...recipe,
        category: index === 0 ? 'breakfast' : index === 1 ? 'lunch' : 'dinner',
        mealTypeLabel: mealType
      } as RecipeWithMeal;
    });
  };

  const handleGeneratePlan = (date: Date) => {
    const newRecipes = generateRecipesForDate(date);
    
    setDayPlans(prev => prev.map(plan => 
      plan.date.getTime() === date.getTime() 
        ? { ...plan, recipes: newRecipes, hasGenerated: true }
        : plan
    ));
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Hoy';
    if (isTomorrow(date)) return 'Mañana';
    return format(date, "EEEE d", { locale: es });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F7' }}>
      <div className="space-y-8">
        {dayPlans.map((dayPlan, dayIndex) => (
          <div key={dayIndex} className="space-y-4">
            {/* Day Header */}
            <div className="px-4">
              <h2 className={`text-lg font-medium capitalize ${
                isToday(dayPlan.date) ? 'text-primary' : 'text-foreground'
              }`}>
                {getDateLabel(dayPlan.date)}
              </h2>
            </div>
            
            {/* Recipes or Generate Button */}
            {dayPlan.hasGenerated && dayPlan.recipes.length > 0 ? (
              <div className="mx-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  {dayPlan.recipes.map((recipe, recipeIndex) => (
                    <RecipeGridCard
                      key={`${recipe.id}-${recipeIndex}`}
                      recipe={recipe}
                      mealType={recipe.mealTypeLabel}
                      onClick={() => onRecipeClick(recipe)}
                      onAdd={() => onAddRecipe(recipe)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-4">
                <Button 
                  onClick={() => handleGeneratePlan(dayPlan.date)}
                  className="w-full py-4 text-base"
                  variant="outline"
                >
                  Generar recetas
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};