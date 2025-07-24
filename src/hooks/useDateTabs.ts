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
      const scrollDirection = scrollY > lastScrollY.current ? 'down' : 'up';
      lastScrollY.current = scrollY;
      
      // Mostrar tabs cuando se hace scroll hacia arriba y hay movimiento
      if (scrollDirection === 'up' && scrollY > 100) {
        setShowTabs(true);
      } else if (scrollY <= 100) {
        setShowTabs(false);
      }
    };

    const observerOptions = {
      rootMargin: '-20% 0px -20% 0px',
      threshold: 0.1
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