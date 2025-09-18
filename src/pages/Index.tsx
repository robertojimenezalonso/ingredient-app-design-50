import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';
import { HorizontalCalendar } from '@/components/HorizontalCalendar';
import { DayRecipeList } from '@/components/DayRecipeList';
import { BottomNav } from '@/components/BottomNav';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleRecipeClick = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleAddRecipe = (recipe: Recipe) => {
    toast({
      title: "Receta añadida",
      description: `${recipe.title} añadida a favoritos`
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Horizontal Calendar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <HorizontalCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          className="py-4"
        />
      </div>
      
      {/* Day Recipe List */}
      <div className="pb-6">
        <DayRecipeList
          selectedDate={selectedDate}
          onRecipeClick={handleRecipeClick}
          onAddRecipe={handleAddRecipe}
        />
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Index;