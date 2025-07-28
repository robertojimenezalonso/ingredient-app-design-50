import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Calendar, Users } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useUserConfig } from '@/contexts/UserConfigContext';

export const SavedShoppingListCard = () => {
  console.log('SavedShoppingListCard ALWAYS renders');
  const navigate = useNavigate();
  const { getTotalIngredients } = useCart();
  const { config } = useUserConfig();
  
  const selectedIngredientsCount = getTotalIngredients();
  const showSavedConfig = localStorage.getItem('showSavedConfig') === 'true';
  
  console.log('SavedShoppingListCard rendering', {
    selectedIngredientsCount,
    hasPlanningSession: config.hasPlanningSession,
    showSavedConfig,
    localStorage: localStorage.getItem('showSavedConfig'),
    selectedDates: config.selectedDates,
    configComplete: config.hasPlanningSession && (config.selectedDates?.length || 0) > 0
  });
  
  // Show if we have a completed planning session OR if the flag is set
  const shouldShow = showSavedConfig || (config.hasPlanningSession && (config.selectedDates?.length || 0) > 0);
  
  if (!shouldShow) {
    console.log('SavedShoppingListCard hidden - no planning session or flag');
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
      <h3 className="text-lg font-semibold text-foreground mb-3">Tus últimos planes de compra</h3>
      <div 
        onClick={handleContinueShopping}
        className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_25px_rgba(0,0,0,0.15)] transition-all cursor-pointer border border-gray-200/50"
      >
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground text-base mb-1">
              Lista de la semana del 20-26 enero
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
          <div className="w-24 h-16 flex gap-1 overflow-hidden rounded-xl">
            <img 
              src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9" 
              alt="Receta 1"
              className="w-8 h-16 object-cover rounded-sm"
            />
            <img 
              src="https://images.unsplash.com/photo-1582562124811-c09040d0a901" 
              alt="Receta 2"
              className="w-8 h-16 object-cover rounded-sm"
            />
            <img 
              src="https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07" 
              alt="Receta 3"
              className="w-8 h-16 object-cover rounded-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};