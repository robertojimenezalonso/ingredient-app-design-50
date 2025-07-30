import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { useCart } from '@/hooks/useCart';
import { useRecipes } from '@/hooks/useRecipes';
import { useAIRecipes } from '@/hooks/useAIRecipes';
import { useGlobalIngredients } from '@/hooks/useGlobalIngredients';
import { useToast } from '@/hooks/use-toast';

import { cn } from '@/lib/utils';
const PeopleAndDietPage = () => {
  const navigate = useNavigate();
  const { config, updateConfig } = useUserConfig();
  const { addToCart } = useCart();
  const { recipes } = useRecipes();
  const { generateRecipe, generateMultipleRecipes, isGenerating } = useAIRecipes();
  const { initializeIngredients } = useGlobalIngredients();
  const { toast } = useToast();
  const [peopleCount, setPeopleCount] = useState({
    adultos: 0
  });
  const [showAllOptions, setShowAllOptions] = useState(false);
  const dietOptions = ['Objetivos', 'Dieta', 'Alergias/Intolerancias', 'Calorías', 'Cantidades', 'Macros', 'Nutrientes', 'Ingredientes Bio'];
  const handlePersonChange = (type: keyof typeof peopleCount, delta: number) => {
    setPeopleCount(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + delta)
    }));
  };
  const handleGeneratePlan = async () => {
    if (!config.selectedDates || !config.selectedMeals || peopleCount.adultos === 0) {
      toast({
        title: "Información incompleta",
        description: "Asegúrate de haber completado la configuración desde el calendario y personas."
      });
      return;
    }

    // Update configuration
    updateConfig({
      servingsPerRecipe: peopleCount.adultos,
      hasPlanningSession: true,
      shouldAnimateChart: true
    });

    // Store generation parameters in localStorage for the benefits page to handle
    const generationParams = {
      people: peopleCount.adultos,
      selectedDates: config.selectedDates,
      selectedMeals: config.selectedMeals,
      restrictions: [] // TODO: Add diet restrictions from user config
    };
    
    localStorage.setItem('pendingRecipeGeneration', JSON.stringify(generationParams));
    
    // Navigate to subscription benefits page which will handle the loading and generation
    navigate('/subscription-benefits');
  };
  const totalPeople = peopleCount.adultos;
  const canContinue = totalPeople > 0;
  return <div className="min-h-screen bg-gray-100 overflow-y-auto">
      {/* Main content */}
      <div className="flex flex-col min-h-screen pb-24">
        {/* Header with back button and progress */}
        <div className="flex items-center p-4">
          <button onClick={() => navigate('/calendar-selection')} className="flex items-center justify-center w-10 h-10 rounded-full bg-white mr-4">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          
          <div className="flex-1 mx-4">
            <Progress value={100} className="h-1" />
          </div>
        </div>

        {/* People Selection Container */}
        <div className="px-4 mb-4">
          <Card className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#C3C3C3]">
            <CardHeader className="pb-3 px-4">
              <CardTitle className="text-2xl font-semibold text-neutral-950">¿Para cuántos?</CardTitle>
            </CardHeader>

            <CardContent className="px-4 pb-4">
              <div className="space-y-0">
                {/* Adults */}
                <div>
                  <div className="flex items-center justify-between py-4">
                    <span className="text-muted-foreground font-normal">Raciones por receta</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => handlePersonChange('adultos', -1)} disabled={peopleCount.adultos === 0} className="flex items-center justify-center w-8 h-8 rounded-full bg-muted disabled:opacity-50">
                        <Minus className="h-4 w-4 text-foreground" />
                      </button>
                      <span className="w-8 text-center text-foreground font-medium">
                        {peopleCount.adultos}
                      </span>
                      <button onClick={() => handlePersonChange('adultos', 1)} className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                        <Plus className="h-4 w-4 text-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Diet Section Container */}
        <div className="px-4 mb-4">
          <Card className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#C3C3C3]">
            <CardHeader className="pb-3 px-4">
              <CardTitle className="text-2xl font-semibold text-neutral-950">Nutrición</CardTitle>
            </CardHeader>

            <CardContent className="px-4 pb-4">
              <div className="space-y-0">
                {(showAllOptions ? dietOptions : dietOptions.slice(0, 3)).map((option, index) => (
                  <div key={option}>
                    <div className="flex items-center justify-between py-4">
                      <span className="text-muted-foreground font-normal">{option}</span>
                      <span className="text-foreground cursor-pointer hover:text-primary transition-colors">
                        Añadir
                      </span>
                    </div>
                    {index < (showAllOptions ? dietOptions.length - 1 : Math.min(2, dietOptions.length - 1)) && <div className="border-b border-muted" />}
                  </div>
                ))}
                
                {!showAllOptions && (
                  <>
                    <div className="border-b border-muted" />
                    <div className="flex items-center justify-between py-4 cursor-pointer" onClick={() => setShowAllOptions(true)}>
                      <span className="text-muted-foreground cursor-pointer hover:text-primary transition-colors text-left font-normal">
                        Más opciones
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </>
                )}
                
                {showAllOptions && (
                  <>
                    <div className="border-b border-muted" />
                    <div className="flex items-center justify-between py-4 cursor-pointer" onClick={() => setShowAllOptions(false)}>
                      <span className="text-muted-foreground cursor-pointer hover:text-primary transition-colors text-left font-normal">
                        Ver menos
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground -rotate-90" />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer with Generate Plan Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4">
          <div className="flex justify-center mb-4">
            <Button 
              onClick={handleGeneratePlan} 
              disabled={!canContinue || isGenerating} 
              className="w-full bg-btnFloating text-btnFloating-foreground hover:bg-btnFloating/90 disabled:opacity-100 disabled:bg-[#81838B] disabled:text-white rounded-lg py-3 h-auto text-base font-semibold"
            >
              <div className="flex items-center justify-center gap-3">
                <span>{isGenerating ? 'Generando recetas con IA...' : 'Generar plan'}</span>
                {isGenerating ? (
                  <Sparkles className="h-5 w-5 animate-pulse" />
                ) : (
                  <img src="/lovable-uploads/a06f3ae9-f80a-48b6-bf55-8c1b736c79f8.png" alt="List icon" className="h-7 w-7" />
                )}
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
export default PeopleAndDietPage;