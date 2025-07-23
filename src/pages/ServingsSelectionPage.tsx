import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserConfig } from '@/contexts/UserConfigContext';
const ServingsSelectionPage = () => {
  const navigate = useNavigate();
  const {
    config,
    updateConfig
  } = useUserConfig();
  const [servings, setServings] = useState(config.servingsPerRecipe);
  const handleContinue = () => {
    updateConfig({
      servingsPerRecipe: servings
    });
    navigate('/subscription-trial');
  };
  const incrementServings = () => {
    if (servings < 10) {
      setServings(servings + 1);
    }
  };
  const decrementServings = () => {
    if (servings > 1) {
      setServings(servings - 1);
    }
  };
  return <div className="min-h-screen bg-background">
      <div className="p-4">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('/price-comparison')} className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 mr-4">
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex-1 mx-4">
            <Progress value={100} className="h-1" />
          </div>
        </div>

        <div className="mb-12">
          <h1 className="text-2xl font-bold text-foreground">
            Elige el número de raciones por receta
          </h1>
          <p className="text-muted-foreground mt-2">Lo usaremos para ajustar el tamaño de las recetas</p>
        </div>

        <div className="flex items-center justify-center mb-12 mt-32">
          <div className="flex items-center gap-4">
            <button onClick={decrementServings} disabled={servings <= 1} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors ${servings <= 1 ? 'border-muted text-muted-foreground' : 'border-muted text-foreground hover:bg-muted'}`}>
              <Minus className="h-5 w-5" />
            </button>

            <div className="text-6xl font-bold text-foreground min-w-[80px] text-center">
              {servings}
            </div>

            <button onClick={incrementServings} disabled={servings >= 10} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors ${servings >= 10 ? 'border-muted text-muted-foreground' : 'border-muted text-foreground hover:bg-muted'}`}>
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="text-center text-muted-foreground">
          
        </div>

        <div className="fixed bottom-10 left-4 right-4">
           <Button onClick={handleContinue} className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-lg py-4 h-auto text-lg font-semibold flex items-center justify-center">
             Siguiente
           </Button>
        </div>
      </div>
    </div>;
};
export default ServingsSelectionPage;