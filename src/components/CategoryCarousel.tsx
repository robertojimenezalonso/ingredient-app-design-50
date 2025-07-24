
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
  const [activeSwipedRecipe, setActiveSwipedRecipe] = useState<string | null>(null);
  const [deletedRecipes, setDeletedRecipes] = useState<Set<string>>(new Set());
  const [showTabs, setShowTabs] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Scroll and intersection observer effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowTabs(scrollY > 200);
      
      if (activeSwipedRecipe) {
        setActiveSwipedRecipe(null);
      }
    };

    const observerOptions = {
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const dateStr = entry.target.getAttribute('data-date');
          if (dateStr) {
            setActiveTab(dateStr);
          }
        }
      });
    }, observerOptions);

    // Observe all sections
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    const handleGlobalInteraction = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-recipe-card="true"]') && 
          !target.closest('.absolute.left-0.top-0') && 
          activeSwipedRecipe) {
        setActiveSwipedRecipe(null);
      }
    };

    document.addEventListener('click', handleGlobalInteraction);
    document.addEventListener('touchstart', handleGlobalInteraction);
    document.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      document.removeEventListener('click', handleGlobalInteraction);
      document.removeEventListener('touchstart', handleGlobalInteraction);
      document.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [activeSwipedRecipe]);
  
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

  const scrollToDate = (dateStr: string) => {
    const section = sectionRefs.current[dateStr];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="mb-4">
      {/* Fixed Tabs */}
      {showTabs && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 py-2">
          <div className="px-4">
            <Tabs value={activeTab} onValueChange={scrollToDate}>
              <TabsList className="w-full justify-start overflow-x-auto">
                {mealPlan.map(({ date, dateStr }) => (
                  <TabsTrigger 
                    key={dateStr} 
                    value={dateStr}
                    className="flex-shrink-0 text-sm"
                  >
                    {format(date, "EEE d", { locale: es })}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      )}
      
      <div className="px-4 space-y-6 mt-8">
        {mealPlan.map(({ date, dateStr, meals }) => (
          <div 
            key={dateStr} 
            className="space-y-2"
            ref={(el) => { sectionRefs.current[dateStr] = el; }}
            data-date={dateStr}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-normal text-muted-foreground capitalize">
                {format(date, "EEEE d", { locale: es })}
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
            <Card className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#C3C3C3]">
              <CardContent className="px-4 pb-4 pt-4">
                <div className="space-y-4">
                  {meals
                    .filter(({ recipe, meal }) => {
                      if (!recipe) return false;
                      const uniqueKey = `${dateStr}-${meal}-${recipe.id}`;
                      return !deletedRecipes.has(uniqueKey);
                    })
                    .map(({ meal, recipe }, index, filteredMeals) => (
                    <div key={`${dateStr}-${meal}`}>
                      {recipe && (
                        <RecipeCard
                          recipe={recipe}
                          onAdd={onAddRecipe}
                          onClick={onRecipeClick}
                          onDelete={(recipe) => handleDeleteRecipe(recipe, dateStr, meal)}
                          onSubstitute={(recipe) => handleSubstituteRecipe(recipe, dateStr, meal)}
                          onSwipeStateChange={handleSwipeStateChange}
                          shouldResetSwipe={activeSwipedRecipe !== null && activeSwipedRecipe !== recipe.id}
                          mealType={meal}
                        />
                      )}
                      {index < filteredMeals.length - 1 && (
                        <div className="mt-4 -mx-4">
                          <Separator />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      
      {/* Floating Button */}
      <div className="fixed bottom-4 left-4 right-4 z-40" style={{ bottom: '80px' }}>
        <button className="w-full bg-black text-white py-4 px-6 rounded-2xl font-medium text-base shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 mb-4">
          <Search className="h-5 w-5" />
          Buscar súper · Lista (24)
        </button>
      </div>
    </div>
  );
};
