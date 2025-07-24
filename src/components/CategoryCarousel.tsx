
import { ChevronRight } from 'lucide-react';
import { Recipe, CategoryType, CATEGORIES } from '@/types/recipe';
import { RecipeCard } from './RecipeCard';
import { Card, CardContent } from './ui/card';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { useRecipes } from '@/hooks/useRecipes';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CategoryCarouselProps {
  category: CategoryType;
  recipes: Recipe[];
  onAddRecipe: (recipe: Recipe) => void;
  onRecipeClick: (recipe: Recipe) => void;
  onViewAll: (category: CategoryType) => void;
}

const mealCategoryMap: Record<string, CategoryType> = {
  'Desayuno': 'breakfast',
  'Almuerzo': 'lunch', 
  'Cena': 'dinner',
  'Tentempié': 'snacks'
};

export const CategoryCarousel = ({ 
  category, 
  recipes, 
  onAddRecipe, 
  onRecipeClick, 
  onViewAll 
}: CategoryCarouselProps) => {
  const { config } = useUserConfig();
  const { getRecipesByCategory } = useRecipes();
  
  // Si no hay configuración, no mostrar nada
  if (!config.selectedDates || !config.selectedMeals || 
      config.selectedDates.length === 0 || config.selectedMeals.length === 0) {
    return null;
  }

  // Generar el plan de comidas
  const mealPlan = config.selectedDates.map(dateStr => {
    const date = new Date(dateStr + 'T12:00:00'); // Agregar hora del mediodía para evitar problemas de zona horaria
    const dayMeals = config.selectedMeals!.map(meal => {
      const categoryKey = mealCategoryMap[meal];
      if (!categoryKey) return null;
      
      // Obtener recetas de esta categoría y tomar solo una
      const categoryRecipes = getRecipesByCategory(categoryKey, 10);
      const selectedRecipe = categoryRecipes[0]; // Solo una receta por comida
      
      return {
        meal,
        recipe: selectedRecipe
      };
    }).filter(Boolean);
    
    return {
      date,
      dateStr,
      meals: dayMeals
    };
  });

  return (
    <div className="mb-4">
      <div className="flex items-center gap-1 px-4 mb-4">
        <h2 className="text-lg font-semibold">Tu planificación semanal</h2>
      </div>
      
      <div className="px-4 space-y-6">
        {mealPlan.map(({ date, dateStr, meals }) => (
          <div key={dateStr} className="space-y-3">
            {/* Fecha del día */}
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium text-foreground">
                {format(date, "EEEE d 'de' MMMM", { locale: es })}
              </h3>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            
            {/* Comidas del día */}
            <div className="space-y-3">
              {meals.map(({ meal, recipe }) => (
                <div key={`${dateStr}-${meal}`} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground px-2">
                    {meal}
                  </h4>
                  {recipe && (
                    <RecipeCard
                      recipe={recipe}
                      onAdd={onAddRecipe}
                      onClick={onRecipeClick}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
