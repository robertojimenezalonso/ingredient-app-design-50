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
    // Load saved lists from localStorage - NO DEFAULT DATA
    const saved = localStorage.getItem('savedShoppingLists');
    console.log('Index: Loading saved lists from localStorage:', saved ? 'Found data' : 'No data');
    if (saved) {
      try {
        const parsedLists = JSON.parse(saved);
        console.log('Index: Parsed lists:', parsedLists.length, 'lists found');
        console.log('Index: First list recipes:', parsedLists[0]?.recipes?.map(r => ({ title: r.title, image: r.image })));
        // Sort by creation date (newest first)
        const sortedLists = parsedLists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSavedLists(sortedLists);
      } catch (error) {
        console.error('Error parsing saved lists:', error);
        setSavedLists([]);
      }
    }
  }, []);

  const handleCreateNewList = () => {
    navigate('/calendar-selection');
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
          {savedLists.length > 0 && (
            <h2 className="text-lg font-medium text-left mb-4">Mis listas</h2>
          )}
          
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
                    {/* Recipe images collage on the left */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                      {recipeImages.length > 0 && (
                        <div className="relative w-full h-full">
                          {recipeImages.map((image, imgIndex) => (
                            <img
                              key={imgIndex}
                              src={image}
                              alt="Recipe"
                              className="absolute w-12 h-12 rounded-lg object-cover border-2 border-white shadow-sm"
                              style={{
                                left: `${imgIndex * 6}px`,
                                top: `${imgIndex * 2}px`,
                                zIndex: 3 - imgIndex,
                                transform: `rotate(${(imgIndex - 1) * 2}deg)`
                              }}
                            />
                          ))}
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

          {/* Spacer para empujar el botón hacia abajo */}
          <div className="flex-1"></div>
          
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