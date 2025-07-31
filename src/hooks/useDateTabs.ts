import { useState, useEffect, useRef } from 'react';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { useRecipeBank } from '@/hooks/useRecipeBank';

const mealCategoryMap: Record<string, string> = {
  'Desayuno': 'desayuno',
  'Almuerzo': 'comida', 
  'Cena': 'cena',
  'Tentempié': 'snack',
  'Aperitivo': 'aperitivo',
  'Snack': 'snack',
  'Merienda': 'merienda'
};

export const useDateTabs = () => {
  const { config } = useUserConfig();
  const { getRandomRecipesByCategory, convertToRecipe, isLoading, recipes } = useRecipeBank();
  const [showTabs, setShowTabs] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const lastScrollY = useRef(0);
  const [mealPlan, setMealPlan] = useState<any[]>([]);

  // Generar el plan de comidas cuando las recetas estén cargadas
  useEffect(() => {
    console.log('useDateTabs: useEffect triggered');
    console.log('useDateTabs: config.selectedDates =', config.selectedDates);
    console.log('useDateTabs: config.selectedMeals =', config.selectedMeals);
    console.log('useDateTabs: isLoading =', isLoading);
    console.log('useDateTabs: recipes.length =', recipes.length);
    console.log('useDateTabs: Condition check:', {
      hasSelectedDates: !!config.selectedDates,
      hasSelectedMeals: !!config.selectedMeals,
      notLoading: !isLoading,
      hasRecipes: recipes.length > 0
    });
    
    if (config.selectedDates && config.selectedMeals && !isLoading && recipes.length > 0) {
      console.log('useDateTabs: Generating meal plan...');
      const newMealPlan = config.selectedDates.map(dateStr => {
        const date = new Date(dateStr + 'T12:00:00');
        const dayMeals = config.selectedMeals!.map(meal => {
          const categoryKey = mealCategoryMap[meal];
          if (!categoryKey) return null;
          
          // Obtener una receta aleatoria del banco que no se haya usado
          console.log(`useDateTabs: Getting recipes for ${meal} (${categoryKey})`);
          const bankRecipes = getRandomRecipesByCategory(categoryKey, 1);
          console.log(`useDateTabs: Found ${bankRecipes.length} recipes for ${categoryKey}`);
          if (bankRecipes.length === 0) return null;
          
          // Convertir a formato Recipe
          const recipe = convertToRecipe(bankRecipes[0], config.servingsPerRecipe || 1);
          console.log(`useDateTabs: Converted recipe: ${recipe.title}`);
          
          return {
            meal,
            recipe
          };
        }).filter(Boolean);
        
        return {
          date,
          dateStr,
          meals: dayMeals
        };
      });
      
      console.log('useDateTabs: Generated meal plan:', newMealPlan);
      setMealPlan(newMealPlan);
    } else {
      console.log('useDateTabs: Conditions not met for meal plan generation');
      setMealPlan([]);
    }
  }, [config.selectedDates, config.selectedMeals, isLoading, recipes.length]); // Dependencies importantes

  console.log('useDateTabs: Final mealPlan =', mealPlan);
  console.log('useDateTabs: mealPlan.length =', mealPlan.length);
  useEffect(() => {
    if (mealPlan.length > 0 && !activeTab) {
      setActiveTab(mealPlan[0].dateStr);
    }
  }, [mealPlan, activeTab]);

  useEffect(() => {
    // Encontrar el contenedor con scroll (CategoryCarousel)
    const scrollContainer = document.querySelector('.fixed.overflow-y-auto') as HTMLElement;
    
    const handleScroll = () => {
      const scrollY = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
      console.log('useDateTabs: scrollY =', scrollY);
      
      // Mostrar tabs cuando se hace scroll hacia abajo después de 50px
      if (scrollY > 50) {
        console.log('useDateTabs: Setting showTabs to true');
        setShowTabs(true);
      } else {
        console.log('useDateTabs: Setting showTabs to false');
        setShowTabs(false);
      }
    };

    // Observer para detectar cuando cada sección llega exactamente a la posición de los tabs
    const observerOptions = {
      root: scrollContainer, // Usar el contenedor de scroll como root
      rootMargin: '-170px 0px -70% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      console.log('Observer triggered with entries:', entries.length);
      entries.forEach((entry) => {
        const dateStr = entry.target.getAttribute('data-date');
        console.log(`Section ${dateStr}: isIntersecting=${entry.isIntersecting}, boundingClientRect.top=${entry.boundingClientRect.top}`);
        
        if (entry.isIntersecting) {
          console.log(`Setting active tab to: ${dateStr}`);
          if (dateStr) {
            setActiveTab(dateStr);
          }
        }
      });
    }, observerOptions);

    // Timeout para asegurar que las refs estén disponibles
    const timeoutId = setTimeout(() => {
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observer.observe(ref);
      });
    }, 100);

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    } else {
      document.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      } else {
        document.removeEventListener('scroll', handleScroll);
      }
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [mealPlan]);

  const scrollToDate = (dateStr: string) => {
    const section = sectionRefs.current[dateStr];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return {
    showTabs,
    activeTab,
    mealPlan,
    sectionRefs,
    scrollToDate
  };
};