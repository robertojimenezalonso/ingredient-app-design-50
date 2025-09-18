import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';
import { HorizontalCalendar } from '@/components/HorizontalCalendar';
import { DayRecipeList } from '@/components/DayRecipeList';
import { FloatingPlanSummary } from '@/components/FloatingPlanSummary';
import { TopHeader } from '@/components/TopHeader';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentDayRecipes, setCurrentDayRecipes] = useState<any[]>([]);
  const [planIndex, setPlanIndex] = useState(0);
  const [savedPlans, setSavedPlans] = useState<any[][]>([]);

  const handleRecipeClick = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleAddRecipe = (recipe: Recipe) => {
    toast({
      title: "Receta añadida",
      description: `${recipe.title} añadida a favoritos`
    });
  };

  const handleRecipesChange = (recipes: any[]) => {
    setCurrentDayRecipes(recipes);
  };

  const handlePersonsChange = (persons: number) => {
    console.log('Personas cambiadas a:', persons);
  };

  const handleSavePlan = () => {
    toast({
      title: "Plan guardado",
      description: "Tu plan de comidas ha sido guardado exitosamente"
    });
  };

  const handleChangePlan = () => {
    // Generate new plan
    const newPlanIndex = planIndex + 1;
    setPlanIndex(newPlanIndex);
    
    // Force regeneration by changing selectedDate slightly and back
    const tempDate = new Date(selectedDate.getTime() + 1000);
    setSelectedDate(tempDate);
    setTimeout(() => setSelectedDate(new Date(selectedDate.getTime())), 100);
    
    toast({
      title: "Nuevo plan generado",
      description: "Se han generado nuevas recetas para el día"
    });
  };

  const handleNavigatePlan = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && planIndex > 0) {
      setPlanIndex(planIndex - 1);
    } else if (direction === 'next') {
      setPlanIndex(planIndex + 1);
    }
    
    // TODO: Implement plan navigation logic
    toast({
      title: `Plan ${direction === 'prev' ? 'anterior' : 'siguiente'}`,
      description: `Navegando al plan ${direction === 'prev' ? planIndex : planIndex + 2}`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <TopHeader />
      
      {/* Horizontal Calendar */}
      <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <HorizontalCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          className="py-4"
        />
      </div>
      
      {/* Day Recipe List */}
      <div className="pb-32">
        <DayRecipeList
          selectedDate={selectedDate}
          onRecipeClick={handleRecipeClick}
          onAddRecipe={handleAddRecipe}
          onRecipesChange={handleRecipesChange}
        />
      </div>
      
      {/* Floating Plan Summary */}
      {currentDayRecipes.length > 0 && (
        <FloatingPlanSummary
          dayRecipes={currentDayRecipes}
          selectedDate={selectedDate}
          onPersonsChange={handlePersonsChange}
          onSavePlan={handleSavePlan}
          onChangePlan={handleChangePlan}
          onNavigatePlan={handleNavigatePlan}
        />
      )}
    </div>
  );
};

export default Index;