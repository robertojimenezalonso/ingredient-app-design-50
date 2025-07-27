import { useState, useEffect, useRef } from 'react';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { useRecipes } from '@/hooks/useRecipes';

const mealCategoryMap: Record<string, any> = {
  'Desayuno': 'breakfast',
  'Almuerzo': 'lunch', 
  'Cena': 'dinner',
  'Tentempié': 'snacks'
};

export const useDateTabs = () => {
  const { config } = useUserConfig();
  const { getRecipesByCategory } = useRecipes();
  const [showTabs, setShowTabs] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const lastScrollY = useRef(0);

  // Función para crear una copia de receta con IDs únicos
  const cloneRecipeWithUniqueIds = (originalRecipe: any, dayIndex: number, mealIndex: number) => {
    if (!originalRecipe) return null;
    
    const uniqueRecipeId = `${originalRecipe.id}-day${dayIndex}-meal${mealIndex}`;
    
    return {
      ...originalRecipe,
      id: uniqueRecipeId,
      ingredients: originalRecipe.ingredients.map((ingredient: any, ingIndex: number) => ({
        ...ingredient,
        id: `${ingredient.id}-day${dayIndex}-meal${mealIndex}-ing${ingIndex}`
      }))
    };
  };

  // Generar el plan de comidas
  const mealPlan = config.selectedDates && config.selectedMeals 
    ? config.selectedDates.map((dateStr, dayIndex) => {
        const date = new Date(dateStr + 'T12:00:00');
        const dayMeals = config.selectedMeals!.map((meal, mealIndex) => {
          const categoryKey = mealCategoryMap[meal];
          if (!categoryKey) return null;
          
          const categoryRecipes = getRecipesByCategory(categoryKey, 10);
          const originalRecipe = categoryRecipes[0];
          const uniqueRecipe = cloneRecipeWithUniqueIds(originalRecipe, dayIndex, mealIndex);
          
          return {
            meal,
            recipe: uniqueRecipe
          };
        }).filter(Boolean);
        
        return {
          date,
          dateStr,
          meals: dayMeals
        };
      })
    : [];

  // Inicializar el primer tab como activo
  useEffect(() => {
    if (mealPlan.length > 0 && !activeTab) {
      setActiveTab(mealPlan[0].dateStr);
    }
  }, [mealPlan, activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Mostrar tabs cuando se hace scroll hacia abajo después de 50px
      if (scrollY > 50) {
        setShowTabs(true);
      } else {
        setShowTabs(false);
      }
    };

    // Observer para detectar cuando cada sección llega exactamente a la posición de los tabs
    const observerOptions = {
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

    document.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      document.removeEventListener('scroll', handleScroll);
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