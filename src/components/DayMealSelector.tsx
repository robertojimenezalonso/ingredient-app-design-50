import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { useRecipes } from '@/hooks/useRecipes';
import { Recipe } from '@/types/recipe';

interface DayMealSelectorProps {
  dateStr: string;
  currentMeals: string[];
  onMealsChange: (dateStr: string, meals: string[], newRecipes?: Recipe[]) => void;
  onShowDeleteConfirmation: (recipe: Recipe, dateStr: string, meal: string) => void;
  currentRecipes: { [key: string]: Recipe };
}

const ALL_MEAL_OPTIONS = ['Desayuno', 'Almuerzo', 'Cena', 'Aperitivo', 'Snack', 'Merienda'];

export const DayMealSelector = ({ 
  dateStr, 
  currentMeals, 
  onMealsChange, 
  onShowDeleteConfirmation,
  currentRecipes 
}: DayMealSelectorProps) => {
  const { config } = useUserConfig();
  const { getRecipesByCategory } = useRecipes();
  const [selectedMeals, setSelectedMeals] = useState<string[]>(currentMeals);

  const mealCategoryMap: Record<string, string> = {
    'Desayuno': 'breakfast',
    'Almuerzo': 'lunch', 
    'Cena': 'dinner',
    'Aperitivo': 'appetizer',
    'Snack': 'snacks',
    'Merienda': 'snacks'
  };

  const toggleMeal = (meal: string) => {
    const isCurrentlySelected = selectedMeals.includes(meal);
    
    if (isCurrentlySelected) {
      // Deseleccionar - mostrar confirmación de eliminación
      const mealKey = `${dateStr}-${meal}`;
      const recipeToDelete = currentRecipes[mealKey];
      
      if (recipeToDelete) {
        onShowDeleteConfirmation(recipeToDelete, dateStr, meal);
      } else {
        // Si no hay receta, simplemente removemos la comida
        const updatedMeals = selectedMeals.filter(m => m !== meal);
        setSelectedMeals(updatedMeals);
        onMealsChange(dateStr, updatedMeals);
      }
    } else {
      // Seleccionar - generar nueva receta
      const updatedMeals = [...selectedMeals, meal];
      setSelectedMeals(updatedMeals);
      
      // Generar receta de ejemplo para este tipo de comida
      const categoryKey = mealCategoryMap[meal];
      if (categoryKey) {
        const categoryRecipes = getRecipesByCategory(categoryKey as any, 1);
        const newRecipe = categoryRecipes[0];
        
        if (newRecipe) {
          // Crear una nueva receta con ID único para este día y comida
          const uniqueRecipe = {
            ...newRecipe,
            id: `${dateStr}-${meal}-${newRecipe.id}`
          };
          
          onMealsChange(dateStr, updatedMeals, [uniqueRecipe]);
        }
      }
    }
  };

  const mainMeals = ['Desayuno', 'Almuerzo', 'Cena'];
  const additionalMeals = ['Aperitivo', 'Snack', 'Merienda'];

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
      <h4 className="font-semibold text-lg text-neutral-950">Tipos de comida</h4>
      
      <div className="space-y-2">
        {/* Main meals */}
        <div className="flex gap-1 justify-center">
          {mainMeals.map(meal => (
            <Badge
              key={meal}
              variant="outline"
              className={cn(
                "cursor-pointer px-2 py-2 text-sm font-medium rounded-full transition-colors flex-1 text-center justify-center",
                selectedMeals.includes(meal)
                  ? "bg-foreground/15 border-2 border-foreground text-foreground"
                  : "bg-transparent border-2 border-muted text-foreground hover:bg-muted/50"
              )}
              onClick={() => toggleMeal(meal)}
            >
              {meal}
            </Badge>
          ))}
        </div>

        {/* Additional meals */}
        <div className="flex gap-2">
          {additionalMeals.map(meal => (
            <Badge
              key={meal}
              variant="outline"
              className={cn(
                "cursor-pointer px-4 py-2 text-sm font-medium rounded-full transition-colors",
                selectedMeals.includes(meal)
                  ? "bg-foreground/15 border-2 border-foreground text-foreground"
                  : "bg-transparent border-2 border-muted text-foreground hover:bg-muted/50"
              )}
              onClick={() => toggleMeal(meal)}
            >
              {meal}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};