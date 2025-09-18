import { useState, useEffect } from 'react';
import { Recipe } from '@/types/recipe';
import { RecipeGridCard } from '@/components/RecipeGridCard';
import { RecipeDrawer } from '@/components/RecipeDrawer';
import { useRecipeBank } from '@/hooks/useRecipeBank';
import { format, addDays, startOfDay, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Check } from 'lucide-react';

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
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedRecipe(null);
  };

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
    if (isToday(date)) return 'hoy';
    if (isTomorrow(date)) return 'mañana';
    return format(date, "EEEE d", { locale: es });
  };

  const generateConsistentPrice = (id: string): number => {
    const hash = id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return (hash % 8 + 4); // Price between 4.00 - 11.99
  };

  const calculateDayTotal = (recipes: RecipeWithMeal[]): string => {
    const total = recipes.reduce((sum, recipe) => {
      return sum + generateConsistentPrice(recipe.id);
    }, 0);
    return total.toFixed(2).replace('.', ',');
  };

  const calculateNutritionTotals = (recipes: RecipeWithMeal[]) => {
    return recipes.reduce((totals, recipe) => {
      const calories = recipe.calories || 0;
      const macros = recipe.macros || { fat: 0, carbs: 0, protein: 0 };
      
      return {
        calories: totals.calories + calories,
        fat: totals.fat + macros.fat,
        carbs: totals.carbs + macros.carbs,
        protein: totals.protein + macros.protein
      };
    }, { calories: 0, fat: 0, carbs: 0, protein: 0 });
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
          <div key={dayIndex} className="space-y-2">
            {/* Day Header */}
            <div className="px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={dayPlan.hasGenerated}
                  disabled={!dayPlan.hasGenerated || dayPlan.recipes.length === 0}
                  className={!dayPlan.hasGenerated || dayPlan.recipes.length === 0 ? "pointer-events-none" : ""}
                />
                <div className="flex flex-col">
                  <h2 className={`text-lg font-semibold ${
                    isToday(dayPlan.date) ? 'text-primary' : 'text-foreground'
                  }`}>
                    {getDateLabel(dayPlan.date)}
                  </h2>
                  {dayPlan.hasGenerated && dayPlan.recipes.length > 0 && (
                    <span className="text-sm text-foreground">
                      {calculateDayTotal(dayPlan.recipes)} € · {dayPlan.recipes.length} recetas, {dayPlan.recipes.reduce((total, recipe) => total + (recipe.servings || 1), 0)} raciones
                    </span>
                  )}
                </div>
              </div>
              {dayPlan.hasGenerated && dayPlan.recipes.length > 0 && (
                <Button 
                  size="sm" 
                  className="rounded-full h-8 w-8 p-0 flex-shrink-0" 
                  style={{ backgroundColor: '#ECEBF1' }}
                  variant="ghost"
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
            
            {/* Recipes or Generate Button */}
            {dayPlan.hasGenerated && dayPlan.recipes.length > 0 ? (
              <div className="mx-4">
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-4">
                    {dayPlan.recipes.map((recipe, recipeIndex) => (
                      <RecipeGridCard
                        key={`${recipe.id}-${recipeIndex}`}
                        recipe={recipe}
                        mealType={recipe.mealTypeLabel}
                        onClick={() => handleRecipeClick(recipe)}
                        onAdd={() => onAddRecipe(recipe)}
                      />
                    ))}
                  </div>
                  
                  {/* Nutrition Summary */}
                  <div className="px-4 pb-4">
                    {/* Title for macros area */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-foreground">Objetivo comer saludable</span>
                      <div className="h-4 w-4 bg-green-600 rounded-full flex items-center justify-center">
                        <Check className="h-2 w-2 text-white" />
                      </div>
                    </div>
                    {(() => {
                      const nutrition = calculateNutritionTotals(dayPlan.recipes);
                      return (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 rounded-lg p-3 bg-white border" style={{ borderColor: '#ECEBF1' }}>
                            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
                              <div className="flex items-center gap-1">
                                <img src="/lovable-uploads/d923963b-f4fc-4381-8216-90ad753ef245.png" alt="calories" className="h-4 w-4" />
                                <span>{nutrition.calories} kcal</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <img src="/lovable-uploads/967d027e-2a1d-40b3-b300-c73dbb88963a.png" alt="protein" className="h-4 w-4" />
                                <span>{Math.round(nutrition.protein)}g</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <img src="/lovable-uploads/26934026-f2f8-4901-a7ba-e4e0c8ac36e1.png" alt="carbs" className="h-4 w-4" />
                                <span>{Math.round(nutrition.carbs)}g</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <img src="/lovable-uploads/7f516dd8-5753-49bd-9b5d-aa5c0bfeedd1.png" alt="fat" className="h-4 w-4" />
                                <span>{Math.round(nutrition.fat)}g</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
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
      
      <RecipeDrawer
        recipe={selectedRecipe}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onAdd={onAddRecipe}
      />
    </div>
  );
};