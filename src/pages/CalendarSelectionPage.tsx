import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { cn } from '@/lib/utils';
const CalendarSelectionPage = () => {
  const navigate = useNavigate();
  const {
    updateConfig
  } = useUserConfig();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<string[]>(['Desayuno', 'Almuerzo', 'Comida']);
  const [showMoreMeals, setShowMoreMeals] = useState(false);
  const today = new Date();
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(today.getMonth() + 1);
  const additionalMeals = ['Aperitivo', 'Snack', 'Merienda'];
  const handleReset = () => {
    setSelectedDates([]);
  };
  const toggleMeal = (meal: string) => {
    if (selectedMeals.includes(meal)) {
      setSelectedMeals(selectedMeals.filter(m => m !== meal));
    } else {
      setSelectedMeals([...selectedMeals, meal]);
    }
  };
  const handleContinue = () => {
    updateConfig({
      selectedDates: selectedDates.map(d => d.toISOString()),
      selectedMeals
    });
    navigate('/supermarket-selection');
  };
  const canContinue = selectedDates.length > 0 && selectedMeals.length > 0;
  return <div className="fixed inset-0 z-50">
      {/* Background with WelcomePage content - blurred */}
      <div className="absolute inset-0 bg-green-500 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Oliv.ai</h1>
            <p className="text-muted-foreground text-lg text-center font-normal">
              Compara precios en diferentes supermercados y consigue recetas personalizadas al mejor precio.
            </p>
          </div>
          <Button className="w-full bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] text-foreground border-0 py-4 h-auto" variant="outline" disabled>
            <div className="text-center">
              <div className="font-semibold">Empezar a buscar</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Blur overlay */}
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen p-4">
        {/* Header with back button and progress */}
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('/')} className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm mr-4">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          
          <div className="flex-1 mx-4">
            <Progress value={50} className="h-1" />
          </div>
        </div>

        {/* Main Card */}
        <Card className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border-0 mb-6 mx-2">
          <CardHeader className="pb-3 px-4">
            <CardTitle className="text-2xl font-bold text-foreground">¿Cuándo?</CardTitle>
            <p className="text-muted-foreground">
              Selecciona los días que planeas cocinar
            </p>
          </CardHeader>

          <CardContent className="space-y-4 px-4">
            {/* Calendar */}
            <div className="flex justify-center">
              <Calendar 
                selected={selectedDates}
                onSelect={(dates) => {
                  setSelectedDates(dates || []);
                }}
                className="pointer-events-auto"
              />
            </div>

            {/* Meal selection */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">¿Qué comidas planeas?</h3>
              
              <div className="space-y-2">
                {/* Main meals - same line */}
                <div className="flex gap-1">
                  {['Desayuno', 'Almuerzo', 'Comida'].map(meal => 
                    <Badge 
                      key={meal} 
                      variant="outline" 
                      className={cn(
                        "cursor-pointer px-3 py-2 text-sm font-medium rounded-full transition-colors flex-1 text-center",
                        selectedMeals.includes(meal) 
                          ? "bg-muted border-2 border-foreground text-foreground" 
                          : "bg-transparent border-2 border-muted text-foreground hover:bg-muted/50"
                      )} 
                      onClick={() => toggleMeal(meal)}
                    >
                      {meal}
                    </Badge>
                  )}

                  {/* Plus button */}
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer px-2 py-2 text-sm font-medium rounded-full border-2 border-muted text-foreground hover:bg-muted/50 transition-colors flex-shrink-0" 
                    onClick={() => setShowMoreMeals(!showMoreMeals)}
                  >
                    <Plus className="h-4 w-4" />
                  </Badge>
                </div>

                {/* Additional meals - new line */}
                {showMoreMeals && (
                  <div className="flex gap-2">
                    {additionalMeals.map(meal => 
                      <Badge 
                        key={meal} 
                        variant="outline" 
                        className={cn(
                          "cursor-pointer px-4 py-2 text-sm font-medium rounded-full transition-colors",
                          selectedMeals.includes(meal) 
                            ? "bg-muted border-2 border-foreground text-foreground" 
                            : "bg-transparent border-2 border-muted text-foreground hover:bg-muted/50"
                        )} 
                        onClick={() => toggleMeal(meal)}
                      >
                        {meal}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floating Continue Button with Reset */}
        <div className="fixed bottom-6 left-4 right-4 flex items-center gap-4">
          <button 
            onClick={handleReset}
            className="text-foreground underline text-lg font-medium"
          >
            Restablecer
          </button>
          <Button 
            onClick={handleContinue} 
            disabled={!canContinue} 
            className="flex-1 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-100 disabled:bg-[#81838B] disabled:text-white rounded-lg py-4 h-auto text-lg font-semibold backdrop-blur-sm"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>;
};
export default CalendarSelectionPage;