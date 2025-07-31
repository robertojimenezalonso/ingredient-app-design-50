import { useState, useEffect, useRef } from 'react';
import { ChevronRight, Plus, Minus, Search, MoreHorizontal } from 'lucide-react';
import { Recipe, CategoryType, CATEGORIES } from '@/types/recipe';
import { RecipeCard } from './RecipeCard';
import { MacroDonutChart } from './MacroDonutChart';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { useRecipes } from '@/hooks/useRecipes';
import { DayMealSelector } from './DayMealSelector';
import { DeleteRecipeDialog } from './DeleteRecipeDialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
interface CategoryCarouselProps {
  category: CategoryType;
  recipes: Recipe[];
  onAddRecipe: (recipe: Recipe) => void;
  onRecipeClick: (recipe: Recipe) => void;
  onViewAll: (category: CategoryType) => void;
  onRecipesChange?: (recipes: Recipe[]) => void;
  onNavigationDataChange?: (data: {
    canGoPrevious: boolean;
    canGoNext: boolean;
    isGenerating: boolean;
    handlePrevious: () => void;
    handleNext: () => void;
    handleGenerate: () => void;
  } | null) => void;
  sectionRefs?: React.MutableRefObject<{
    [key: string]: HTMLDivElement | null;
  }>;
}
const mealCategoryMap: Record<string, CategoryType> = {
  'Desayuno': 'breakfast',
  'Almuerzo': 'lunch',
  'Cena': 'dinner',
  'Tentempié': 'snacks',
  'Aperitivo': 'appetizer',
  'Snack': 'snacks',
  'Merienda': 'snacks'
};

const MACRO_COLORS = {
  protein: '#DE6968',
  carbs: '#DE9A69', 
  fat: '#6998DD'
};

const MACRO_ICONS = {
  protein: '/lovable-uploads/967d027e-2a1d-40b3-b300-c73dbb88963a.png',
  carbs: '/lovable-uploads/26934026-f2f8-4901-a7ba-e4e0c8ac36e1.png',
  fat: '/lovable-uploads/7f516dd8-5753-49bd-9b5d-aa5c0bfeedd1.png'
};
export const CategoryCarousel = ({
  category,
  recipes,
  onAddRecipe,
  onRecipeClick,
  onViewAll,
  onRecipesChange,
  onNavigationDataChange,
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
  const [currentRecipes, setCurrentRecipes] = useState<Recipe[]>(recipes);
  const [navigationData, setNavigationData] = useState<{
    canGoPrevious: boolean;
    canGoNext: boolean;
    isGenerating: boolean;
    handlePrevious: () => void;
    handleNext: () => void;
    handleGenerate: () => void;
  } | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [dayMealsConfig, setDayMealsConfig] = useState<{[dateStr: string]: string[]}>(() => {
    // Initialize with the global selected meals for all dates
    const initialConfig: {[dateStr: string]: string[]} = {};
    config.selectedDates?.forEach(dateStr => {
      initialConfig[dateStr] = [...(config.selectedMeals || [])];
    });
    return initialConfig;
  });
  const [dayRecipes, setDayRecipes] = useState<{[key: string]: Recipe}>({});
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    recipe: Recipe | null;
    dateStr: string;
    mealType: string;
  }>({
    isOpen: false,
    recipe: null,
    dateStr: '',
    mealType: ''
  });

  // Update current recipes when prop changes
  useEffect(() => {
    setCurrentRecipes(recipes);
  }, [recipes]);
  const handleRecipesChange = (newRecipes: Recipe[]) => {
    setCurrentRecipes(newRecipes);
    // Clear deleted recipes when new recipes are generated
    setDeletedRecipes(new Set());
    // Notify parent component about the recipe change
    if (onRecipesChange) {
      onRecipesChange(newRecipes);
    }
  };

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
    
    // Use day-specific meals if available, otherwise fall back to global config
    const dayMeals = dayMealsConfig[dateStr] || config.selectedMeals!;
    
    const mealsForDay = dayMeals.map((meal, mealIndex) => {
      const categoryKey = mealCategoryMap[meal];
      if (!categoryKey) return null;

      // First check for day-specific recipes
      const dayRecipeKey = `${dateStr}-${meal}`;
      if (dayRecipes[dayRecipeKey]) {
        console.log(`CategoryCarousel: Using day-specific recipe for ${dateStr}-${meal}: ${dayRecipes[dayRecipeKey].title}`);
        return {
          meal,
          recipe: dayRecipes[dayRecipeKey]
        };
      }

      // Si hay recetas pasadas como props (desde useDateTabs/base de datos), usar esas
      let selectedRecipe;
      if (currentRecipes && currentRecipes.length > 0) {
        // Calcular el índice de la receta basado en día y comida
        const recipeIndex = dayIndex * config.selectedMeals!.length + mealIndex;
        selectedRecipe = currentRecipes[recipeIndex % currentRecipes.length];
        console.log(`CategoryCarousel: Using database recipe for ${dateStr}-${meal}: ${selectedRecipe?.title}`);
      } else {
        // Fallback a recetas de ejemplo si no hay recetas de la base de datos
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
      meals: mealsForDay
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

  const handleToggleDay = (dateStr: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr);
      } else {
        newSet.add(dateStr);
      }
      return newSet;
    });
  };

  const handleDayMealsChange = (dateStr: string, meals: string[], newRecipes?: Recipe[]) => {
    setDayMealsConfig(prev => ({
      ...prev,
      [dateStr]: meals
    }));

    if (newRecipes) {
      const newDayRecipes = { ...dayRecipes };
      newRecipes.forEach(recipe => {
        const mealType = recipe.id.split('-')[1]; // Extract meal type from ID
        const key = `${dateStr}-${mealType}`;
        newDayRecipes[key] = recipe;
      });
      setDayRecipes(newDayRecipes);
      
      // NO modificar currentRecipes global - solo mantener las recetas específicas del día
    }
  };

  const handleShowDeleteConfirmation = (recipe: Recipe, dateStr: string, meal: string) => {
    setDeleteDialog({
      isOpen: true,
      recipe,
      dateStr,
      mealType: meal
    });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.recipe && deleteDialog.dateStr && deleteDialog.mealType) {
      // Update day meals config to remove the meal type
      const currentDayMeals = dayMealsConfig[deleteDialog.dateStr] || config.selectedMeals || [];
      const updatedMeals = currentDayMeals.filter(meal => meal !== deleteDialog.mealType);
      setDayMealsConfig(prev => ({
        ...prev,
        [deleteDialog.dateStr]: updatedMeals
      }));

      // Remove from dayRecipes (pero no añadir a deletedRecipes permanentemente)
      const key = `${deleteDialog.dateStr}-${deleteDialog.mealType}`;
      setDayRecipes(prev => {
        const newDayRecipes = { ...prev };
        delete newDayRecipes[key];
        return newDayRecipes;
      });
    }

    setDeleteDialog({
      isOpen: false,
      recipe: null,
      dateStr: '',
      mealType: ''
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      recipe: null,
      dateStr: '',
      mealType: ''
    });
  };
  // Calcular todas las recetas visibles para el gráfico de macros
  const allVisibleRecipes = mealPlan.flatMap(day => day.meals.filter(({
    recipe,
    meal
  }) => {
    if (!recipe) return false;
    const uniqueKey = `${day.dateStr}-${meal}-${recipe.id}`;
    return !deletedRecipes.has(uniqueKey);
  }).map(({
    recipe
  }) => recipe)).filter(Boolean) as Recipe[];
  return <div className="mb-4">
      <div className="px-4 space-y-6 pb-40 -mt-[76px]" style={{
      backgroundColor: 'white'
    }}>
        <MacroDonutChart recipes={allVisibleRecipes} shouldAnimate={config.shouldAnimateChart} onRecipesChange={handleRecipesChange} onNavigationDataChange={data => {
        setNavigationData(data);
        if (onNavigationDataChange) {
          onNavigationDataChange(data);
        }
      }} />
        {mealPlan.map(({
        date,
        dateStr,
        meals
      }, index) => <div key={dateStr} className="space-y-2 -mt-12" ref={el => {
        if (sectionRefs?.current) {
          sectionRefs.current[dateStr] = el;
        }
      }} data-date={dateStr}>
            <Card 
              className="border-none px-3 py-2 mb-3 cursor-pointer" 
              style={{ backgroundColor: '#F6F6F6' }}
              onClick={() => handleToggleDay(dateStr)}
            >
              <div className="flex items-center justify-between" style={{
            backgroundColor: '#F6F6F6'
          }}>
                <h3 className="text-sm text-black capitalize font-semibold underline underline-offset-4">
                  {format(date, "eee. d", {
                locale: es
              }).toLowerCase()}
                </h3>
                <button 
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleDay(dateStr);
                  }}
                >
                  {expandedDays.has(dateStr) ? <Minus size={20} /> : <Plus size={20} />}
                </button>
              </div>
              
              {expandedDays.has(dateStr) && (
                <div className="mt-4 pt-3 border-t border-gray-300">
                  <DayMealSelector
                    dateStr={dateStr}
                    currentMeals={dayMealsConfig[dateStr] || config.selectedMeals || []}
                    onMealsChange={handleDayMealsChange}
                    onShowDeleteConfirmation={handleShowDeleteConfirmation}
                    currentRecipes={(() => {
                      const recipesMap: { [key: string]: Recipe } = {};
                      meals.forEach(({ meal, recipe }) => {
                        if (recipe) {
                          recipesMap[`${dateStr}-${meal}`] = recipe;
                        }
                      });
                      // Add any recipes from dayRecipes that might be new
                      Object.entries(dayRecipes).forEach(([key, recipe]) => {
                        if (key.startsWith(dateStr)) {
                          recipesMap[key] = recipe;
                        }
                      });
                      return recipesMap;
                    })()}
                  />
                </div>
              )}
            </Card>
            {(() => {
              const dayRecipes = meals.filter(({
                recipe,
                meal
              }) => {
                if (!recipe) return false;
                const uniqueKey = `${dateStr}-${meal}-${recipe.id}`;
                return !deletedRecipes.has(uniqueKey);
              }).map(({
                recipe
              }) => recipe);
              const totalCalories = dayRecipes.reduce((sum, recipe) => sum + recipe.calories, 0);
              const totalProtein = dayRecipes.reduce((sum, recipe) => sum + recipe.macros.protein, 0);
              const totalCarbs = dayRecipes.reduce((sum, recipe) => sum + recipe.macros.carbs, 0);
              const totalFat = dayRecipes.reduce((sum, recipe) => sum + recipe.macros.fat, 0);
              return null;
            })()}
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
          }) => recipe && <RecipeCard key={`${dateStr}-${meal}`} recipe={recipe} onAdd={onAddRecipe} onClick={onRecipeClick} onDelete={recipe => handleDeleteRecipe(recipe, dateStr, meal)} onSubstitute={recipe => handleSubstituteRecipe(recipe, dateStr, meal)} onSwipeStateChange={handleSwipeStateChange} shouldResetSwipe={activeSwipedRecipe !== null && activeSwipedRecipe !== recipe.id} mealType={meal} />)}
            </div>
          </div>)}
      </div>
      
      {/* Delete Recipe Dialog */}
      <DeleteRecipeDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        recipe={deleteDialog.recipe}
        dateStr={deleteDialog.dateStr}
        mealType={deleteDialog.mealType}
      />
    </div>;
};