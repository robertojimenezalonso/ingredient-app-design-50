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

  // Generar el plan de comidas
  const mealPlan = config.selectedDates && config.selectedMeals 
    ? config.selectedDates.map(dateStr => {
        const date = new Date(dateStr + 'T12:00:00');
        const dayMeals = config.selectedMeals!.map(meal => {
          const categoryKey = mealCategoryMap[meal];
          if (!categoryKey) return null;
          
          const categoryRecipes = getRecipesByCategory(categoryKey, 10);
          const selectedRecipe = categoryRecipes[0];
          
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
      })
    : [];

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

    // Observer para detectar cuando el título de cada sección está a la altura del tabulador
    const observerOptions = {
      rootMargin: '-170px 0px -100% 0px',
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