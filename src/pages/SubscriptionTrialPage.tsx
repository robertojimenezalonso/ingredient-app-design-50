
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Unlock, Bell, CreditCard, Check, Star, Zap, Target, Shield, Sparkles, Lightbulb, TrendingUp, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
const SubscriptionTrialPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [showMoreBenefits, setShowMoreBenefits] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true); // Start with shadow visible

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      // Check if user is at the bottom (with 10px tolerance)
      const atBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsAtBottom(atBottom);
    };

    // Check initial state immediately
    const checkInitialState = () => {
      handleScroll();
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(checkInitialState, 100);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [showMoreBenefits]); // Re-check when content changes

  const handleBack = () => {
    navigate('/servings-selection');
  };
  const handleStartTrial = () => {
    navigate('/subscription-benefits');
  };
  return <div className="min-h-screen bg-background">
      <div className={`p-4 ${showMoreBenefits ? 'pb-80' : 'pb-64'}`}>
        <div className="flex items-center mb-8">
          <button onClick={handleBack} className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 mr-4">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">
            Simplifica tu compra en el supermercado
          </h1>
        </div>
        {/* Timeline */}
          <div className="mb-4">
            <div className="relative">
              
              {/* Benefits list */}
              <div className="space-y-4 mt-8">
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground mr-3 mt-1 flex-shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <p className="text-muted-foreground">Recetas generadas en base a los ingredientes y precios de tu súper</p>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground mr-3 mt-1 flex-shrink-0">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <p className="text-muted-foreground">Comparador de precios entre supermercados</p>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground mr-3 mt-1 flex-shrink-0">
                    <Target className="h-4 w-4" />
                  </div>
                  <p className="text-muted-foreground">Recetas personalizadas según tus preferencias y necesidades nutricionales</p>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground mr-3 mt-1 flex-shrink-0">
                    <Shield className="h-4 w-4" />
                  </div>
                  <p className="text-muted-foreground">Optimización de ingredientes para reducir desperdicio</p>
                </div>

                {/* Expandable section */}
                {!showMoreBenefits && <div className="flex justify-end">
                    <button onClick={() => setShowMoreBenefits(!showMoreBenefits)} className="flex items-center text-muted-foreground hover:text-muted-foreground/80 transition-colors py-2">
                      <span className="text-sm font-medium">y mucho más</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>}
                  
                {showMoreBenefits && <div className="space-y-4 mt-2 animate-fade-in">
                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground mr-3 mt-1 flex-shrink-0">
                        <Zap className="h-4 w-4" />
                      </div>
                      <p className="text-muted-foreground">Detección automática de ofertas y promociones</p>
                    </div>

                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground mr-3 mt-1 flex-shrink-0">
                        <Lightbulb className="h-4 w-4" />
                      </div>
                      <p className="text-muted-foreground">Sugerencias de sustituciones de ingredientes</p>
                    </div>

                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground mr-3 mt-1 flex-shrink-0">
                        <Star className="h-4 w-4" />
                      </div>
                      <p className="text-muted-foreground">Transformamos cualquier receta que traigas o inventes en una lista de la compra optimizada</p>
                    </div>
                  </div>}
              </div>
            </div>
          </div>


        {/* Bottom button */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-muted" style={{
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
          <div className="p-4 pb-10">
            {/* Special offer banner - only show for yearly plan */}

            {/* Pricing options */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className={`border-2 rounded-2xl p-4 cursor-pointer transition-colors ${selectedPlan === 'monthly' ? 'border-foreground bg-muted/20' : 'border-muted'}`} onClick={() => setSelectedPlan('monthly')}>
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h3 className="text-base font-medium text-foreground mb-1">Mensual</h3>
                    <p className="text-lg font-bold text-foreground">9,99 € <span className="text-xs font-normal">/mes</span></p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'monthly' ? 'border-foreground bg-foreground' : 'border-muted-foreground'}`}>
                    {selectedPlan === 'monthly' && <Check className="h-4 w-4 text-background" />}
                  </div>
                </div>
              </div>

              <div className={`border-2 rounded-2xl p-4 cursor-pointer transition-colors relative ${selectedPlan === 'yearly' ? 'border-foreground bg-muted/20' : 'border-muted'}`} onClick={() => setSelectedPlan('yearly')}>
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-foreground text-background px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                  3 días gratis
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h3 className="text-base font-medium text-foreground mb-1">Anual</h3>
                    <p className="text-lg font-bold text-foreground">2,91 € <span className="text-xs font-normal">/mes</span></p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'yearly' ? 'border-foreground bg-foreground' : 'border-muted-foreground'}`}>
                    {selectedPlan === 'yearly' && <Check className="h-4 w-4 text-background" />}
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleStartTrial} className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-lg py-4 h-auto text-lg font-semibold">{selectedPlan === 'monthly' ? 'Seleccionar plan' : 'Prueba gratis de 3 días'}</Button>
            <p className="text-sm text-muted-foreground text-center mt-3">
              3 días gratis, luego 34,99 € por año (2,91 €/mes)
            </p>
          </div>
        </div>
      </div>
    </div>;
};
export default SubscriptionTrialPage;
