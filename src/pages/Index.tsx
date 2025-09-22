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
    if (saved) {
      try {
        const parsedLists = JSON.parse(saved);
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
    navigate('/milista');
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
        <Card className="bg-white shadow-sm flex-1 flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col">
            <h1 className="text-2xl font-bold text-center mb-6">Mis listas</h1>
            
            {/* Saved Lists - Solo si existen */}
            {savedLists.length > 0 && (
              <div className="space-y-4 mb-6">
                {savedLists.slice(0, 3).map((list, index) => {
                  // Get first 3 recipe images for overlapping display
                  const recipeImages = list.recipes?.slice(0, 3).map(recipe => recipe.image) || [];
                  
                  return (
                    <div key={list.id || index} className="bg-white p-4 cursor-pointer" onClick={() => handleGoToList(list.id)}>
                      <div className="flex items-start gap-4">
                        {/* Overlapping recipe images on the left */}
                        <div className="relative w-16 h-12 flex-shrink-0">
                          {recipeImages.map((image, imgIndex) => (
                            <img
                              key={imgIndex}
                              src={image}
                              alt="Recipe"
                              className="absolute w-10 h-10 rounded-lg object-cover shadow-sm"
                              style={{
                                left: `${imgIndex * 8}px`,
                                zIndex: 3 - imgIndex,
                                transform: `rotate(${(imgIndex - 1) * 3}deg)`
                              }}
                            />
                          ))}
                        </div>
                        
                        {/* List information */}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{list.name || 'Mi Lista'}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <img src={mercadonaLogo} alt="Mercadona" className="w-4 h-4 object-cover rounded-full" />
                            <span>Mercadona</span>
                            <span>•</span>
                            <span>Para {list.servings || 2} personas</span>
                            <span>•</span>
                            <span>{list.dates?.length || 0} día{(list.dates?.length || 0) !== 1 ? 's' : ''}</span>
                          </div>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;