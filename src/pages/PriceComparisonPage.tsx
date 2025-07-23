import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useUserConfig } from "@/contexts/UserConfigContext";
const PriceComparisonPage = () => {
  const navigate = useNavigate();
  const {
    config
  } = useUserConfig();
  const availableSupermarkets = ["Mercadona", "Carrefour", "Alcampo", "Eroski", "Consum", "BM Supermercados", "Caprabo", "Dia", "Lidl", "Aldi"];
  const generateSupermarketsForStore = (selectedStore: string) => {
    // Use store name as seed for consistent results
    const seed = selectedStore.split('').reduce((a, b) => a + b.charCodeAt(0), 0);

    // Filter out the selected store
    const available = availableSupermarkets.filter(store => store !== selectedStore);

    // Deterministic selection based on seed
    const index1 = seed % available.length;
    const index2 = (seed * 2 + 7) % available.length;
    const finalIndex2 = index2 === index1 ? (index2 + 1) % available.length : index2;

    // Generate even discounts between -4 and -16 (minimum 4%)
    const evenDiscounts = [-4, -6, -8, -10, -12, -14, -16];
    const discount1Index = seed % evenDiscounts.length;
    const discount2Index = (seed * 3 + 5) % evenDiscounts.length;
    const finalDiscount2Index = discount2Index === discount1Index ? (discount2Index + 1) % evenDiscounts.length : discount2Index;
    const discount1 = evenDiscounts[discount1Index];
    const discount2 = evenDiscounts[finalDiscount2Index];

    // Sort discounts with highest discount first (most negative first)
    const sortedDiscounts = [discount1, discount2].sort((a, b) => a - b);
    return [{
      name: available[index1],
      discount: sortedDiscounts[0]
    }, {
      name: available[finalIndex2],
      discount: sortedDiscounts[1]
    }];
  };
  const supermarkets = generateSupermarketsForStore(config.supermarket || "Mercadona");
  const handleNext = () => {
    navigate('/servings-selection');
  };
  const handleBack = () => {
    navigate('/supermarket-selection');
  };
  return <div className="min-h-screen bg-background">
      <div className="p-4">
        <div className="flex items-center mb-8">
          <button onClick={handleBack} className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 mr-4">
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex-1 mx-4">
            <Progress value={75} className="h-1" />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-4">Oliv.ai ayuda a que tomes la mejor decisión</h1>
          
          
          {/* Bottom text */}
          <div className="px-4">
          <div className="bg-muted/30 rounded-2xl p-6 border border-muted/50 -mx-4 px-8 mb-6 animate-fade-in">
            
            
            {/* Tu cesta - Supermercado seleccionado */}
            <div className="bg-primary/10 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{config.supermarket || "Tu supermercado"}</h3>
                  <p className="text-sm text-muted-foreground">14 artículos</p>
                </div>
                <div className="text-xl font-bold text-foreground blur-sm">68,50 €</div>
              </div>
            </div>

            <p className="text-muted-foreground mb-1 text-base">Tu cesta en otros supermercados</p>

            {/* Otros supermercados con descuentos */}
            <div className="space-y-3 mb-6">
              {supermarkets.map(supermarket => <div key={supermarket.name} className="flex items-center justify-between p-3 bg-card rounded-lg border transition-all duration-500 animate-fade-in">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{supermarket.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {supermarket.discount > 0 ? '+' : ''}{supermarket.discount}%
                    </span>
                  </div>
                </div>)}
              
              {/* Ver más - pegado a la derecha */}
              
            </div>
            
            <p className="text-muted-foreground text-center text-base">El 90% de los usuarios de Oliv.ai consiguen ahorrar semanalmente con nuestro comparador de precios</p>
          </div>
          </div>
        </div>

        <style>{`
          @keyframes scale-in {
            from {
              transform: scale(0.8);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes bounce-in {
            from {
              transform: scale(0);
            }
            50% {
              transform: scale(1.2);
            }
            to {
              transform: scale(1);
            }
          }
          
          @keyframes cart-appear {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes badge-bounce {
            from {
              transform: scale(0);
            }
            50% {
              transform: scale(1.3);
            }
            to {
              transform: scale(1);
            }
          }
        `}</style>

        {/* Bottom button */}
        <div className="fixed bottom-10 left-4 right-4">
          <Button onClick={handleNext} className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-lg py-4 h-auto text-lg font-semibold">
            Siguiente
          </Button>
        </div>
      </div>
    </div>;
};
export default PriceComparisonPage;