import { useState, useEffect, useRef } from 'react';
import { ChevronRight, Plus, Search, MoreHorizontal, X } from 'lucide-react';
import { Recipe, CategoryType, CATEGORIES } from '@/types/recipe';
import { RecipeCard } from './RecipeCard';
import { MacroDonutChart } from './MacroDonutChart';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
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
  'Aperitivo': 'snacks',
  'Snack': 'snacks',
  'Merienda': 'snacks'
};

const ALL_MEAL_TYPES = ['Desayuno', 'Almuerzo', 'Cena', 'Aperitivo', 'Snack', 'Merienda'];

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
  const [dailyMeals, setDailyMeals] = useState<Record<string, string[]>>({});
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    dateStr: string;
    mealType: string;
  }>({ isOpen: false, dateStr: '', mealType: '' });

  // Initialize daily meals from user config
  useEffect(() => {
    if (config.selectedDates && config.selectedMeals) {
      const initialDailyMeals: Record<string, string[]> = {};
      config.selectedDates.forEach(dateStr => {
        initialDailyMeals[dateStr] = [...config.selectedMeals!];
      });
      setDailyMeals(initialDailyMeals);
    }
  }, [config.selectedDates, config.selectedMeals]);

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
    const dayMeals = config.selectedMeals!.map((meal, mealIndex) => {
      const categoryKey = mealCategoryMap[meal];
      if (!categoryKey) return null;

      // Si hay recetas de IA disponibles, buscar la receta específica para esta fecha y comida
      let selectedRecipe;
      if (currentRecipes && currentRecipes.length > 0) {
        // Buscar receta que contenga la fecha y el tipo de comida en su ID
        const mealKeywords = {
          'Desayuno': ['breakfast', 'desayuno'],
          'Almuerzo': ['lunch', 'almuerzo'],
          'Cena': ['dinner', 'cena'],
          'Tentempié': ['snack', 'tentempie']
        };
        const keywords = mealKeywords[meal] || [];

        // Buscar una receta que contenga tanto la fecha como el tipo de comida
        selectedRecipe = currentRecipes.find(recipe => {
          const recipeId = recipe.id.toLowerCase();
          const hasDate = recipeId.includes(dateStr);
          const hasMeal = keywords.some(keyword => recipeId.includes(keyword));
          return hasDate && hasMeal;
        });

        // Si no se encuentra una receta específica, usar la asignación por índice como fallback
        if (!selectedRecipe) {
          const recipeIndex = dayIndex * config.selectedMeals!.length + mealIndex;
          selectedRecipe = currentRecipes[recipeIndex] || currentRecipes[recipeIndex % currentRecipes.length];
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

  const handleMealToggle = (dateStr: string, mealType: string) => {
    const currentMeals = dailyMeals[dateStr] || [];
    
    if (currentMeals.includes(mealType)) {
      // Si la comida está seleccionada, mostrar popup de confirmación
      setConfirmDelete({
        isOpen: true,
        dateStr,
        mealType
      });
    } else {
      // Si no está seleccionada, añadirla y generar una nueva receta
      setDailyMeals(prev => ({
        ...prev,
        [dateStr]: [...currentMeals, mealType]
      }));
      
      // Generar una nueva receta para esta comida
      // Por ahora usamos una receta de ejemplo, en el futuro se conectará con IA
      const categoryKey = mealCategoryMap[mealType];
      if (categoryKey) {
        const categoryRecipes = getRecipesByCategory(categoryKey, 10);
        const newRecipe = categoryRecipes[Math.floor(Math.random() * categoryRecipes.length)];
        console.log(`Generated new recipe for ${mealType} on ${dateStr}:`, newRecipe?.title);
      }
    }
  };

  const confirmDeleteMeal = () => {
    const { dateStr, mealType } = confirmDelete;
    setDailyMeals(prev => ({
      ...prev,
      [dateStr]: prev[dateStr]?.filter(meal => meal !== mealType) || []
    }));
    setConfirmDelete({ isOpen: false, dateStr: '', mealType: '' });
  };

  const cancelDeleteMeal = () => {
    setConfirmDelete({ isOpen: false, dateStr: '', mealType: '' });
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
                    console.log('Añadir receta para', dateStr);
                  }}
                >
                  <Plus size={20} />
                </button>
              </div>
              
              {expandedDays.has(dateStr) && (
                <div className="mt-4 space-y-4" style={{ backgroundColor: '#F6F6F6' }}>
                  <div className="flex flex-wrap gap-2">
                    {ALL_MEAL_TYPES.map((mealType) => {
                      const isSelected = dailyMeals[dateStr]?.includes(mealType) || false;
                      return (
                        <Badge
                          key={mealType}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer transition-colors ${
                            isSelected 
                              ? "bg-black text-white hover:bg-gray-800" 
                              : "bg-white text-black border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => handleMealToggle(dateStr, mealType)}
                        >
                          {mealType}
                        </Badge>
                      );
                    })}
                  </div>
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
            const isSelectedMeal = dailyMeals[dateStr]?.includes(meal) || false;
            return !deletedRecipes.has(uniqueKey) && isSelectedMeal;
          }).map(({
            meal,
            recipe
          }) => recipe && <RecipeCard key={`${dateStr}-${meal}`} recipe={recipe} onAdd={onAddRecipe} onClick={onRecipeClick} onDelete={recipe => handleDeleteRecipe(recipe, dateStr, meal)} onSubstitute={recipe => handleSubstituteRecipe(recipe, dateStr, meal)} onSwipeStateChange={handleSwipeStateChange} shouldResetSwipe={activeSwipedRecipe !== null && activeSwipedRecipe !== recipe.id} mealType={meal} />)}
            </div>
          </div>)}
      </div>
      
      {/* Popup de confirmación */}
      <AlertDialog open={confirmDelete.isOpen} onOpenChange={cancelDeleteMeal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar comida</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar la receta de {confirmDelete.mealType} para este día?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteMeal}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMeal}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};