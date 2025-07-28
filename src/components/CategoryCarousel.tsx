import { useState, useEffect, useRef } from 'react';
import { ChevronRight, Plus, Search, MoreHorizontal } from 'lucide-react';
import { Recipe, CategoryType, CATEGORIES } from '@/types/recipe';
import { RecipeCard } from './RecipeCard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
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
  sectionRefs?: React.MutableRefObject<{
    [key: string]: HTMLDivElement | null;
  }>;
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
  onViewAll,
  sectionRefs
}: CategoryCarouselProps) => {
  const {
    config
  } = useUserConfig();
  const {
    getRecipesByCategory
  } = useRecipes();
  const [activeSwipedRecipe, setActiveSwipedRecipe] = useState<string | null>(null);
  const [deletedRecipes, setDeletedRecipes] = useState<Set<string>>(new Set());

  // Scroll and interaction effects
  useEffect(() => {
    const handleGlobalInteraction = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-recipe-card="true"]') && !target.closest('.absolute.left-0.top-0') && activeSwipedRecipe) {
        setActiveSwipedRecipe(null);
      }
    };
    const handleScroll = () => {
      if (activeSwipedRecipe) {
        setActiveSwipedRecipe(null);
      }
    };
    document.addEventListener('click', handleGlobalInteraction);
    document.addEventListener('touchstart', handleGlobalInteraction);
    document.addEventListener('scroll', handleScroll, {
      passive: true
    });
    return () => {
      document.removeEventListener('click', handleGlobalInteraction);
      document.removeEventListener('touchstart', handleGlobalInteraction);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [activeSwipedRecipe]);

  // Si no hay configuración, no mostrar nada
  if (!config.selectedDates || !config.selectedMeals || config.selectedDates.length === 0 || config.selectedMeals.length === 0) {
    return null;
  }

  // Generar el plan de comidas
  const mealPlan = config.selectedDates.map((dateStr, dayIndex) => {
    const date = new Date(dateStr + 'T12:00:00'); // Agregar hora del mediodía para evitar problemas de zona horaria
    const dayMeals = config.selectedMeals!.map((meal, mealIndex) => {
      const categoryKey = mealCategoryMap[meal];
      if (!categoryKey) return null;

      // Si hay recetas de IA disponibles, buscar la receta específica para esta fecha y comida
      let selectedRecipe;
      if (recipes && recipes.length > 0) {
        // Buscar receta que contenga la fecha y el tipo de comida en su ID
        const mealKeywords = {
          'Desayuno': ['breakfast', 'desayuno'],
          'Almuerzo': ['lunch', 'almuerzo'],
          'Cena': ['dinner', 'cena'],
          'Tentempié': ['snack', 'tentempie']
        };
        
        const keywords = mealKeywords[meal] || [];
        
        // Buscar una receta que contenga tanto la fecha como el tipo de comida
        selectedRecipe = recipes.find(recipe => {
          const recipeId = recipe.id.toLowerCase();
          const hasDate = recipeId.includes(dateStr);
          const hasMeal = keywords.some(keyword => recipeId.includes(keyword));
          return hasDate && hasMeal;
        });

        // Si no se encuentra una receta específica, usar la asignación por índice como fallback
        if (!selectedRecipe) {
          const recipeIndex = dayIndex * config.selectedMeals!.length + mealIndex;
          selectedRecipe = recipes[recipeIndex] || recipes[recipeIndex % recipes.length];
          console.log(`CategoryCarousel: No specific recipe found for ${dateStr}-${meal}, using index ${recipeIndex}: ${selectedRecipe?.title}`);
        } else {
          console.log(`CategoryCarousel: Found specific AI recipe for ${dateStr}-${meal}: ${selectedRecipe.title}`);
        }
      } else {
        // Fallback a recetas de ejemplo si no hay recetas de IA
        const categoryRecipes = getRecipesByCategory(categoryKey, 10);
        selectedRecipe = categoryRecipes[0]; // Solo una receta por comida
        console.log('CategoryCarousel: Using example recipe for', meal, ':', selectedRecipe?.title);
      }
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
  const handleSwipeStateChange = (recipeId: string, isSwiped: boolean) => {
    console.log('Swipe state change:', recipeId, isSwiped ? 'swipeado' : 'normal');
    if (isSwiped) {
      setActiveSwipedRecipe(recipeId);
    } else {
      setActiveSwipedRecipe(null);
    }
  };
  const handleDeleteRecipe = (recipe: Recipe, dateStr: string, meal: string) => {
    const uniqueKey = `${dateStr}-${meal}-${recipe.id}`;
    setDeletedRecipes(prev => new Set([...prev, uniqueKey]));
    setActiveSwipedRecipe(null);
  };
  const handleSubstituteRecipe = (recipe: Recipe, dateStr: string, meal: string) => {
    const uniqueKey = `${dateStr}-${meal}-${recipe.id}`;
    setDeletedRecipes(prev => new Set([...prev, uniqueKey]));
    setActiveSwipedRecipe(null);
    // Aquí puedes implementar la lógica de sustitución
    console.log('Sustituir receta:', recipe.title, 'en', dateStr, meal);
  };
  return <div className="mb-4">
      <div className="fixed left-0 right-0 px-4 space-y-6 bg-white pb-32 overflow-y-auto h-screen z-0" style={{ top: 'calc(env(safe-area-inset-top) + 80px)', paddingTop: '80px' }}>
        {mealPlan.map(({
        date,
        dateStr,
        meals
      }) => <div key={dateStr} className="space-y-2 -mt-12" ref={el => {
        if (sectionRefs?.current) {
          sectionRefs.current[dateStr] = el;
        }
      }} data-date={dateStr}>
            <div className="flex items-center justify-between">
              <h3 className="text-base text-muted-foreground font-semibold">
                {format(date, "eee d", {
              locale: es
            }).toLowerCase()}
              </h3>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-gray-50">
                  <MoreHorizontal size={16} />
                </button>
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-gray-50">
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {meals.filter(({
                recipe,
                meal
              }) => {
                if (!recipe) return false;
                const uniqueKey = `${dateStr}-${meal}-${recipe.id}`;
                return !deletedRecipes.has(uniqueKey);
              }).map(({
                meal,
                recipe
              }) => (
                <Card key={`${dateStr}-${meal}`} className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-border">
                  <CardContent className="px-4 pb-3 pt-3">
                    {recipe && <RecipeCard recipe={recipe} onAdd={onAddRecipe} onClick={onRecipeClick} onDelete={recipe => handleDeleteRecipe(recipe, dateStr, meal)} onSubstitute={recipe => handleSubstituteRecipe(recipe, dateStr, meal)} onSwipeStateChange={handleSwipeStateChange} shouldResetSwipe={activeSwipedRecipe !== null && activeSwipedRecipe !== recipe.id} mealType={meal} />}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>)}
      </div>
      
    </div>;
};