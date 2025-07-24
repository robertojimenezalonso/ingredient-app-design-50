import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { cn } from '@/lib/utils';
const PeopleAndDietPage = () => {
  const navigate = useNavigate();
  const {
    updateConfig
  } = useUserConfig();
  const [peopleCount, setPeopleCount] = useState({
    adultos: 0
  });
  const [showAllOptions, setShowAllOptions] = useState(false);
  const allDietOptions = ['Objetivos', 'Dieta', 'Alergias/Intolerancias', 'Calorías', 'Cantidades', 'Macros', 'Nutrientes', 'Ingredientes Bio'];
  const additionalOptions = allDietOptions.slice(3);
  const handlePersonChange = (type: keyof typeof peopleCount, delta: number) => {
    setPeopleCount(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + delta)
    }));
  };
  const handleGeneratePlan = () => {
    updateConfig({
      servingsPerRecipe: peopleCount.adultos
    });
    navigate('/subscription-benefits');
  };
  const totalPeople = peopleCount.adultos;
  const canContinue = totalPeople > 0;
  return <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background with WelcomePage content - blurred */}
      <div className="absolute inset-0 bg-sky-200 flex flex-col items-center justify-center p-4">
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
      <div className="relative z-10 min-h-screen flex flex-col pb-24">
        {/* Header with back button and progress */}
        <div className="flex items-center p-4">
          <button onClick={() => navigate('/calendar-selection')} className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm mr-4">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          
          <div className="flex-1 mx-4">
            <Progress value={75} className="h-1" />
          </div>
        </div>

        {/* People Selection Container */}
        <div className="px-4 mb-4">
          <Card className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border-0">
            <CardHeader className="pb-3 px-4">
              <CardTitle className="text-2xl font-bold text-foreground">¿Quién?</CardTitle>
              <p className="text-muted-foreground">Para cuantos vas a cocinar</p>
            </CardHeader>

            <CardContent className="px-4 pb-4">
              <div className="space-y-0">
                {/* Adults */}
                <div>
                  <div className="flex items-center justify-between py-4">
                    <span className="text-muted-foreground font-normal">Personas</span>
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
          <Card className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border-0">
            <CardHeader className="pb-3 px-4">
              <CardTitle className="text-2xl font-bold text-foreground">Nutrición</CardTitle>
            </CardHeader>

            <CardContent className="px-4 pb-4">
              <div className="space-y-0">
                {allDietOptions.slice(0, 3).map((option, index) => (
                  <div key={option}>
                    <div className="flex items-center justify-between py-4">
                      <span className="text-muted-foreground font-normal">{option}</span>
                      <span className="text-foreground cursor-pointer hover:text-primary transition-colors">
                        Añadir
                      </span>
                    </div>
                    {index < 2 && <div className="border-b border-muted" />}
                  </div>
                ))}
                
                <div className="border-b border-muted" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center justify-between py-4 cursor-pointer">
                      <span className="text-muted-foreground cursor-pointer hover:text-primary transition-colors text-left font-normal">
                        Más opciones
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 bg-background border border-border shadow-lg z-50">
                    {additionalOptions.map((option) => (
                      <DropdownMenuItem key={option} className="flex items-center justify-between">
                        <span className="text-muted-foreground font-normal">{option}</span>
                        <span className="text-foreground cursor-pointer hover:text-primary transition-colors">
                          Añadir
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer with Generate Plan Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm">
          <div className="flex justify-center">
            <Button onClick={handleGeneratePlan} disabled={!canContinue} className="w-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-100 disabled:bg-[#81838B] disabled:text-white rounded-lg py-4 h-auto text-lg font-semibold">
              Generar Plan
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
export default PeopleAndDietPage;