import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, ArrowRight, Trash2, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import { useToast } from '@/hooks/use-toast';
import mercadonaLogo from '@/assets/mercadona-logo-new.png';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { lists, loading: listsLoading, deleteAllLists } = useShoppingLists();
  const { toast } = useToast();
  const [showAllLists, setShowAllLists] = useState(false);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleCreateNewList = () => {
    navigate('/calendar-selection');
  };

  const handleGoToList = (listId: string) => {
    navigate(`/milista/${listId}`);
  };

  const handleDeleteAllLists = async () => {
    try {
      await deleteAllLists();
      toast({
        title: "Listas eliminadas",
        description: "Se han eliminado todas las listas guardadas"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron eliminar las listas",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (authLoading || listsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F7F7' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const displayName = user.user_metadata?.display_name || user.email?.charAt(0).toUpperCase() || 'U';
  const initials = displayName.length > 1 ? displayName.substring(0, 2).toUpperCase() : displayName;
  
  // Determine which lists to show
  const maxDefaultLists = 3;
  const listsToShow = showAllLists ? lists : lists.slice(0, maxDefaultLists);
  const hasMoreLists = lists.length > maxDefaultLists;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F7F7' }}>
      {/* Top Header */}
      <div className="flex items-center justify-between p-4">
        <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer" onClick={() => navigate('/profile')}>
          <div className="w-full h-full flex items-center justify-center text-white font-medium text-lg opacity-90" style={{
            backgroundColor: '#ec4899'
          }}>
            {initials}
          </div>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-2">
          {lists.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteAllLists}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex-1 flex flex-col">
          {/* Always show title */}
          <h2 className="text-lg font-medium text-left mb-4">Mis listas</h2>
          
          {/* Saved Lists */}
          {lists.length > 0 && (
            <div className="space-y-4 mb-6">
              {listsToShow.map((list, index) => {
                // Get first 3 recipe images for collage display
                const recipeImages = list.recipes?.slice(0, 3) || [];
                
                return (
                  <div 
                    key={list.id} 
                    className="flex gap-4 items-center cursor-pointer relative rounded-xl bg-white w-full transition-transform duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.1)] border p-4"
                    style={{ borderColor: '#F8F8FC' }}
                    onClick={() => handleGoToList(list.id)}
                  >
                     {/* Recipe images with new design */}
                     <div className="relative w-20 h-20 flex-shrink-0">
                        {list.recipes && list.recipes.length > 0 ? (
                          (() => {
                            const imagesToShow = list.recipes.slice(0, Math.min(3, list.recipes.length));
                            
                            return imagesToShow.map((recipe, imgIndex) => {
                              // Define positioning and rotation for each image
                              let left = '16px';
                              let top = '8px';
                              let rotation = '';
                              let zIndex = 1;
                              
                              if (imgIndex === 0) {
                                // First image: centered and on top
                                left = '18px';
                                top = '10px';
                                rotation = '';
                                zIndex = 3;
                              } else if (imgIndex === 1) {
                                // Second image: slightly to the left and tilted
                                left = '8px';
                                top = '14px';
                                rotation = 'rotate-[-8deg]';
                                zIndex = 1;
                              } else if (imgIndex === 2) {
                                // Third image: to the right and tilted
                                left = '28px';
                                top = '14px';
                                rotation = 'rotate-[8deg]';
                                zIndex = 2;
                              }
                              
                              return (
                                <img 
                                  key={imgIndex}
                                  src={recipe.image} 
                                  alt={recipe.title || `Recipe ${imgIndex + 1}`}
                                  className={`absolute w-14 h-14 object-cover rounded-lg border-2 border-white shadow-lg transition-transform duration-200 ${rotation}`}
                                  style={{
                                    left: left,
                                    top: top,
                                    zIndex: zIndex,
                                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                                  }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              );
                            });
                          })()
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center shadow-lg" style={{ 
                            position: 'absolute', 
                            left: '18px', 
                            top: '10px',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                          }}>
                            <span className="text-xs text-gray-500">📝</span>
                          </div>
                        )}
                       </div>
                      
                       {/* List information */}
                       <div className="flex-1">
                         <h3 className="font-semibold text-gray-900 mb-1 text-base">{list.name}</h3>
                         
                         {/* Price information */}
                         <div className="mb-2">
                           <div className="flex items-center text-sm text-gray-700 mb-1">
                             <img src={mercadonaLogo} alt="Mercadona" className="w-4 h-4 object-cover rounded-full mr-2" />
                             <span className="mr-2">Mercadona</span>
                             <span className="font-medium">€{list.estimated_price?.toFixed(2) || '0.00'}</span>
                           </div>
                           <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium inline-block">
                             Mejor precio: €{((list.estimated_price || 0) * 0.85).toFixed(2)}
                           </div>
                         </div>
                         
                         <div className="text-sm text-gray-600 flex items-center">
                           <img src={mercadonaLogo} alt="Mercadona" className="w-4 h-4 object-cover rounded-full mr-1" />
                           <span>Mercadona · Para {list.dates?.length || 0} días</span>
                         </div>
                       </div>
                    </div>
                  );
                })}
              
              {/* Ver más button */}
              {hasMoreLists && !showAllLists && (
                <div className="flex justify-center pt-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowAllLists(true)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Ver más ({lists.length - maxDefaultLists} listas más)
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
              
              {/* Ver menos button */}
              {showAllLists && hasMoreLists && (
                <div className="flex justify-center pt-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowAllLists(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Ver menos
                    <ChevronDown className="h-4 w-4 ml-1 rotate-180" />
                  </Button>
                </div>
              )}
            </div>
          )}
            
          {/* Empty state */}
            {lists.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📝</div>
                <p className="text-gray-600 mb-2">No tienes listas guardadas</p>
                <p className="text-gray-500 text-sm">Crea tu primera lista de la compra</p>
              </div>
            )}

          {/* Spacer para empujar el contenido hacia arriba */}
          <div className="flex-1"></div>
        </div>
      </div>
      
      {/* Create New List Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <Button 
          onClick={handleCreateNewList}
          className="w-full h-14 text-lg font-medium rounded-lg bg-btnFloating text-btnFloating-foreground hover:bg-btnFloating/90 shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Crear nueva lista
        </Button>
      </div>
    </div>
  );
};

export default Index;