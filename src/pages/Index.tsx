import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';
import { DayRecipeList } from '@/components/DayRecipeList';
import { TopHeader } from '@/components/TopHeader';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentDayRecipes, setCurrentDayRecipes] = useState<any[]>([]);
  const [planIndex, setPlanIndex] = useState(0);
  const [savedPlans, setSavedPlans] = useState<any[][]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);

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

  const handleTotalPriceChange = (total: number) => {
    setTotalPrice(total);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F7' }}>
      {/* Top Header */}
      <TopHeader selectedDate={selectedDate} totalPrice={totalPrice} />
      
      {/* Vertical Calendar and Recipes */}
      <div>
        <DayRecipeList
          selectedDate={selectedDate}
          onRecipeClick={handleRecipeClick}
          onAddRecipe={handleAddRecipe}
          onTotalPriceChange={handleTotalPriceChange}
        />
      </div>
      
    </div>
  );
};

export default Index;