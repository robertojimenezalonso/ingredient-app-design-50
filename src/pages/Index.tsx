import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, ArrowRight } from 'lucide-react';
import mercadonaLogo from '@/assets/mercadona-logo-new.png';

const Index = () => {
  const navigate = useNavigate();
  const [savedLists, setSavedLists] = useState<any[]>([]);

  useEffect(() => {
    console.log('Index: Component mounted, checking localStorage...');
    // Load saved lists from localStorage - NO DEFAULT DATA
    const saved = localStorage.getItem('savedShoppingLists');
    console.log('Index: Raw localStorage data:', saved);
    console.log('Index: localStorage keys:', Object.keys(localStorage));
    console.log('Index: localStorage.length:', localStorage.length);
    
    if (saved) {
      try {
        const parsedLists = JSON.parse(saved);
        console.log('Index: Parsed lists successfully:', parsedLists.length, 'lists found');
        console.log('Index: Full lists data:', parsedLists);
        if (parsedLists.length > 0) {
          console.log('Index: First list detailed data:', parsedLists[0]);
        }
        // Sort by creation date (newest first)
        const sortedLists = parsedLists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        console.log('Index: Setting sorted lists to state:', sortedLists.length);
        setSavedLists(sortedLists);
      } catch (error) {
        console.error('Index: Error parsing saved lists:', error);
        setSavedLists([]);
      }
    } else {
      console.log('Index: No data found in localStorage');
      setSavedLists([]);
    }
    
    console.log('Index: Current savedLists state:', savedLists.length, savedLists);
  }, []);

  // Add a function to manually refresh lists
  const refreshLists = () => {
    console.log('Index: Manually refreshing lists...');
    const saved = localStorage.getItem('savedShoppingLists');
    console.log('Index: Manual refresh - Raw localStorage data:', saved);
    if (saved) {
      try {
        const parsedLists = JSON.parse(saved);
        const sortedLists = parsedLists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSavedLists(sortedLists);
        console.log('Index: Lists refreshed, count:', sortedLists.length);
      } catch (error) {
        console.error('Index: Error in manual refresh:', error);
      }
    } else {
      console.log('Index: Manual refresh - No data found');
      setSavedLists([]);
    }
  };

  // Listen for storage changes and custom events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'savedShoppingLists') {
        console.log('Index: Storage changed, refreshing lists...');
        refreshLists();
      }
    };

    const handleListsUpdated = () => {
      console.log('Index: Custom listsUpdated event received, refreshing...');
      refreshLists();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('listsUpdated', handleListsUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('listsUpdated', handleListsUpdated);
    };
  }, []);

  // Debug: Log current state
  useEffect(() => {
    console.log('Index: Current savedLists state:', savedLists.length, savedLists);
    savedLists.forEach((list, index) => {
      console.log(`Index: List ${index}:`, {
        id: list.id,
        name: list.name,
        hasRecipes: !!(list.recipes && list.recipes.length > 0),
        recipesCount: list.recipes ? list.recipes.length : 0,
        firstRecipeImage: list.recipes && list.recipes[0] ? list.recipes[0].image : 'NO IMAGE'
      });
    });
  }, [savedLists]);

  const handleCreateNewList = () => {
    navigate('/calendar-selection');
  };

  // DEBUG: Add manual trigger for testing
  const debugTestSave = () => {
    console.log('DEBUG: Manual test save triggered');
    const testList = {
      id: `debug-${Date.now()}`,
      name: 'Lista Debug',
      dates: ['2025-09-24'],
      servings: 2,
      meals: ['almuerzo'],
      recipes: [{
        id: 'debug-recipe',
        title: 'Receta Debug',
        image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=500&h=300&fit=crop'
      }],
      createdAt: new Date().toISOString(),
      estimatedPrice: 25.50,
      recipeImages: ['https://images.unsplash.com/photo-1546548970-71785318a17b?w=500&h=300&fit=crop']
    };
    
    const existingLists = JSON.parse(localStorage.getItem('savedShoppingLists') || '[]');
    const updatedLists = [testList, ...existingLists];
    localStorage.setItem('savedShoppingLists', JSON.stringify(updatedLists));
    console.log('DEBUG: Test list saved, triggering refresh...');
    refreshLists();
  };

  const handleGoToList = (listId: string) => {
    navigate(`/milista/${listId}`);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F7F7' }}>
      {/* Top Header - Solo el perfil con iniciales */}
      <div className="flex items-center justify-between p-4">
        <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer" onClick={() => navigate('/profile')}>
          <div className="w-full h-full flex items-center justify-center text-white font-medium text-lg opacity-90" style={{
            backgroundColor: '#ec4899'
          }}>
            RJ
          </div>
        </div>
        <div className="flex-1"></div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex-1 flex flex-col">
          {/* Always show title */}
          <h2 className="text-lg font-medium text-left mb-4">Mis listas</h2>
          
          {/* Saved Lists - Solo si existen */}
          {savedLists.length > 0 && (
            <div className="space-y-4 mb-6">
              {savedLists.map((list, index) => {
                // Get first 3 recipe images for collage display
                const recipeImages = list.recipes?.slice(0, 3).map(recipe => recipe.image) || [];
                
                return (
                  <div 
                    key={`list-${list.id || `${list.name}-${index}`}`} 
                    className="flex gap-4 items-center cursor-pointer relative rounded-xl bg-white w-full transition-transform duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.1)] border p-4"
                    style={{ borderColor: '#F8F8FC' }}
                    onClick={() => handleGoToList(list.id)}
                  >
                     {/* Recipe images in cascade */}
                     <div className="relative w-16 h-16 flex-shrink-0">
                       {list.recipes && list.recipes.length > 0 ? (
                         (() => {
                           const imagesToShow = list.recipes.slice(0, Math.min(3, list.recipes.length));
                           
                           return imagesToShow.map((recipe, imgIndex) => {
                             const offsetX = imgIndex * 6; // 6px horizontal offset
                             const offsetY = imgIndex * 4; // 4px vertical offset
                             const zIndex = imagesToShow.length - imgIndex; // Higher z-index for images on top
                             
                             return (
                               <img 
                                 key={imgIndex}
                                 src={recipe.image} 
                                 alt={recipe.title || `Recipe ${imgIndex + 1}`}
                                 className="absolute w-12 h-12 object-cover rounded-lg border-2 border-white shadow-sm"
                                 style={{
                                   left: `${offsetX}px`,
                                   top: `${offsetY}px`,
                                   zIndex: zIndex
                                 }}
                                 onError={(e) => {
                                   console.log('Index: Image failed to load:', recipe.image);
                                   e.currentTarget.style.display = 'none';
                                 }}
                               />
                             );
                           });
                         })()
                       ) : (
                         <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                           <span className="text-xs text-gray-500">📝</span>
                         </div>
                       )}
                     </div>
                     
                     {/* List information */}
                     <div className="flex-1">
                       <h3 className="font-semibold text-gray-900 mb-1 text-base">{list.name || 'Mi Lista'}</h3>
                       <div className="text-sm text-gray-600 flex items-center">
                         <img src={mercadonaLogo} alt="Mercadona" className="w-4 h-4 object-cover rounded-full mr-1" />
                         <span>Mercadona · Para {list.dates?.length || 0} días</span>
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
           )}
           
           {/* Empty state */}
           {savedLists.length === 0 && (
             <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
               <div className="text-gray-400 text-4xl mb-4">📝</div>
               <p className="text-gray-600 mb-2">No tienes listas guardadas</p>
               <p className="text-gray-500 text-sm">Crea tu primera lista de la compra</p>
             </div>
           )}

          {/* Spacer para empujar el botón hacia abajo */}
          <div className="flex-1"></div>
          
          {/* Debug button - temporal */}
          <Button 
            onClick={debugTestSave}
            className="w-full h-12 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 mb-2"
          >
            DEBUG: Crear lista test
          </Button>
          
          {/* Create New List Button - Abajo */}
          <Button 
            onClick={handleCreateNewList}
            className="w-full h-14 text-lg font-medium rounded-lg bg-btnFloating text-btnFloating-foreground hover:bg-btnFloating/90 shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Crear nueva lista
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;