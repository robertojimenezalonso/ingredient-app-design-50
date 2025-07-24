
import { ChevronRight, Plus } from 'lucide-react';
import { Recipe, CategoryType, CATEGORIES } from '@/types/recipe';
import { RecipeCard } from './RecipeCard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
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
            <div className="flex items-center justify-between">
              <h3 className="text-base font-normal text-muted-foreground">
                {format(date, "EEEE d", { locale: es })}
              </h3>
              <button className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-muted-foreground hover:bg-gray-50">
                <Plus size={16} />
              </button>
            </div>
            <Card className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#C3C3C3]">
              <CardContent className="px-4 pb-4 pt-6">
                <div className="space-y-4">
                  {meals.map(({ meal, recipe }, index) => (
                    <div key={`${dateStr}-${meal}`}>
                      {recipe && (
                        <RecipeCard
                          recipe={recipe}
                          onAdd={onAddRecipe}
                          onClick={onRecipeClick}
                          mealType={meal}
                        />
                      )}
                      {index < meals.length - 1 && (
                        <Separator className="mt-4 -mx-4 mr-0" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};
