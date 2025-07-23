import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserConfig } from '@/contexts/UserConfigContext';
const SupermarketSelectionPage = () => {
  const navigate = useNavigate();
  const {
    config,
    updateConfig
  } = useUserConfig();
  const [selectedSupermarket, setSelectedSupermarket] = useState(config.supermarket);
  const [showAllSupermarkets, setShowAllSupermarkets] = useState(false);
  const supermarkets = ['Mercadona', 'Carrefour', 'Alcampo', 'LIDL', 'DIA', 'Eroski', 'Hipercor', 'Consum', 'Caprabo'];
  const displayedSupermarkets = showAllSupermarkets ? supermarkets : supermarkets.slice(0, 4);
  const handleContinue = () => {
    updateConfig({
      supermarket: selectedSupermarket
    });
    navigate('/price-comparison');
  };
  return <div className="min-h-screen bg-background">
      <div className="p-4">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('/postal-code')} className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 mr-4">
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex-1 mx-4">
            <Progress value={50} className="h-1" />
          </div>
        </div>

        <div className="mb-12">
          <h1 className="text-2xl font-bold text-foreground">
            ¿En qué supermercado te gustaría hacer la compra?
          </h1>
          <p className="text-muted-foreground mt-2">Te mostraremos recetas adaptadas a los productos de tu supermercado</p>
        </div>

        <div className="space-y-3 mb-24">
          {displayedSupermarkets.map(supermarket => <button key={supermarket} onClick={() => setSelectedSupermarket(supermarket)} className={`w-full p-4 rounded-lg transition-all text-left flex items-center justify-between ${selectedSupermarket === supermarket ? 'bg-black text-white' : 'bg-[#F8F8FD] text-foreground'}`}>
              <span className="font-medium">{supermarket}</span>
              {selectedSupermarket === supermarket && <Check className="h-5 w-5 text-white" />}
            </button>)}
          
          {!showAllSupermarkets && <button onClick={() => setShowAllSupermarkets(true)} className="w-full p-4 rounded-lg bg-[#F8F8FD] text-foreground transition-all text-left flex items-center justify-between">
              <span className="font-medium">Otros</span>
            </button>}
        </div>

        <div className="fixed bottom-10 left-4 right-4">
          <Button onClick={handleContinue} disabled={!selectedSupermarket} className="w-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-100 disabled:bg-[#81838B] disabled:text-white rounded-lg py-4 h-auto text-lg font-semibold">
            Siguiente
          </Button>
        </div>
      </div>
    </div>;
};
export default SupermarketSelectionPage;