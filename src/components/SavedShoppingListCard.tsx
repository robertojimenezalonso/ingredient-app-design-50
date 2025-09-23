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
  
  // Get saved shopping lists from localStorage
  const getSavedLists = () => {
    try {
      const saved = localStorage.getItem('savedShoppingLists');
      if (saved) {
        const lists = JSON.parse(saved);
        // Ensure all lists have recipeImages - add fallback if missing
        return lists.map((list: any) => ({
          ...list,
          recipeImages: list.recipeImages || [
            'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
            'https://images.unsplash.com/photo-1582562124811-c09040d0a901', 
            'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07'
          ]
        }));
      }
      return [];
    } catch {
      return [];
    }
  };
  
  const savedLists = getSavedLists().sort((a: any, b: any) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  console.log('SavedShoppingListCard rendering', {
    selectedIngredientsCount,
    hasPlanningSession: config.hasPlanningSession,
    showSavedConfig,
    savedLists: savedLists.length,
    localStorage: localStorage.getItem('showSavedConfig'),
    selectedDates: config.selectedDates,
    configComplete: config.hasPlanningSession && (config.selectedDates?.length || 0) > 0
  });
  
  // Show if we have saved lists OR if we have a completed planning session OR if the flag is set
  const shouldShow = savedLists.length > 0 || showSavedConfig || (config.hasPlanningSession && (config.selectedDates?.length || 0) > 0);
  
  if (!shouldShow) {
    console.log('SavedShoppingListCard hidden - no saved lists or planning session');
    return null;
  }

  const handleContinueShopping = () => {
    // Clear the flag when user clicks to continue
    localStorage.removeItem('showSavedConfig');
    navigate('/milista');
  };

  const handleListClick = (listId?: string) => {
    // Clear the flag when user clicks to continue
    localStorage.removeItem('showSavedConfig');
    navigate('/milista');
  };

  // If we have saved lists, show them
  if (savedLists.length > 0) {
    return (
      <div className="mx-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Tus últimos planes de compra</h3>
        <div className="space-y-3">
          {savedLists.map((list: any, index: number) => {
            const daysText = list.selectedDates?.length 
              ? `${list.selectedDates.length} día${list.selectedDates.length > 1 ? 's' : ''}`
              : '0 días';
              
            const servingsText = `${list.servingsPerRecipe || 1} ración${(list.servingsPerRecipe || 1) > 1 ? 'es' : ''}`;
            
            console.log('SavedShoppingListCard - List data:', {
              listId: list.id,
              name: list.name,
              hasRecipeImages: !!list.recipeImages,
              recipeImagesCount: list.recipeImages?.length || 0,
              recipeImages: list.recipeImages
            });
            
            return (
              <div 
                key={list.id || index}
                onClick={() => handleListClick(list.id)}
                className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_25px_rgba(0,0,0,0.15)] transition-all cursor-pointer border border-gray-200/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground text-base mb-1">
                      {list.name || `Menú semanal ${index + 1}`}
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
                      <span>Desde {list.estimatedPrice || '12,50'} €</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 relative">
                    {(() => {
                      const fallbackImages = [
                        'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
                        'https://images.unsplash.com/photo-1582562124811-c09040d0a901', 
                        'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07'
                      ];
                      
                      // Determine how many images to show based on actual recipe count
                      const recipeCount = list.recipeImages?.length || 0;
                      const imagesToShow = recipeCount > 0 
                        ? list.recipeImages.slice(0, Math.min(3, recipeCount))
                        : [fallbackImages[0]]; // Show only 1 fallback if no recipes
                      
                      console.log('Images to show for list', list.id, ':', imagesToShow);
                      
                      return imagesToShow.map((imageUrl: string, imgIndex: number) => {
                        const offsetX = imgIndex * 4; // 4px horizontal offset
                        const offsetY = imgIndex * 3; // 3px vertical offset
                        const zIndex = imagesToShow.length - imgIndex; // Higher z-index for images on top
                        
                        return (
                          <img 
                            key={imgIndex}
                            src={imageUrl} 
                            alt={`Receta ${imgIndex + 1}`}
                            className="absolute w-12 h-12 object-cover rounded-lg border-2 border-white shadow-sm"
                            style={{
                              left: `${offsetX}px`,
                              top: `${offsetY}px`,
                              zIndex: zIndex
                            }}
                            onError={(e) => {
                              console.error('Image failed to load:', imageUrl);
                              (e.target as HTMLImageElement).src = fallbackImages[0];
                            }}
                          />
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback to current planning session
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
              Menú semanal mediterráneo
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
              <span>Desde 12,50 €</span>
            </div>
          </div>
          <div className="w-16 h-16 relative">
            <img 
              src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9" 
              alt="Receta 1"
              className="absolute w-12 h-12 object-cover rounded-lg border-2 border-white shadow-sm"
              style={{ left: '0px', top: '0px', zIndex: 3 }}
            />
            <img 
              src="https://images.unsplash.com/photo-1582562124811-c09040d0a901" 
              alt="Receta 2"
              className="absolute w-12 h-12 object-cover rounded-lg border-2 border-white shadow-sm"
              style={{ left: '4px', top: '3px', zIndex: 2 }}
            />
            <img 
              src="https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07" 
              alt="Receta 3"
              className="absolute w-12 h-12 object-cover rounded-lg border-2 border-white shadow-sm"
              style={{ left: '8px', top: '6px', zIndex: 1 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};