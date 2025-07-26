import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Calendar, Users } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useUserConfig } from '@/contexts/UserConfigContext';

export const SavedShoppingListCard = () => {
  const navigate = useNavigate();
  const { getTotalIngredients } = useCart();
  const { config } = useUserConfig();
  
  const selectedIngredientsCount = getTotalIngredients();

  // Only show if there's a saved configuration and we're returning from Mi Lista
  const showSavedConfig = localStorage.getItem('showSavedConfig') === 'true';
  
  // Debug logging
  console.log('SavedShoppingListCard conditions:', {
    selectedIngredientsCount,
    hasPlanningSession: config.hasPlanningSession,
    showSavedConfig,
    config
  });
  
  if (selectedIngredientsCount === 0 || !config.hasPlanningSession || !showSavedConfig) {
    return null;
  }

  const handleContinueShopping = () => {
    // Clear the flag when user clicks to continue
    localStorage.removeItem('showSavedConfig');
    navigate('/milista');
  };

  const daysText = config.selectedDates?.length 
    ? `${config.selectedDates.length} día${config.selectedDates.length > 1 ? 's' : ''}`
    : '0 días';
    
  const servingsText = `${config.servingsPerRecipe || 1} ración${(config.servingsPerRecipe || 1) > 1 ? 'es' : ''}`;

  return (
    <div className="mx-4 mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-3">Tu lista de la compra</h3>
      <div 
        onClick={handleContinueShopping}
        className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_25px_rgba(0,0,0,0.15)] transition-all cursor-pointer border border-gray-200/50"
      >
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground text-base mb-1">
              Sigue configurando tu lista de compra
            </h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span>{daysText}</span>
              <span>•</span>
              <Users className="h-4 w-4" />
              <span>{servingsText}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <ShoppingCart className="h-4 w-4" />
              <span>{selectedIngredientsCount} ingrediente{selectedIngredientsCount > 1 ? 's' : ''} seleccionado{selectedIngredientsCount > 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center">
            <ShoppingCart className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};