import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, ArrowRight, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import { useToast } from '@/hooks/use-toast';
import mercadonaLogo from '@/assets/mercadona-logo-new.png';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { lists, loading: listsLoading, deleteAllLists } = useShoppingLists();
  const { toast } = useToast();

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
              {lists.map((list, index) => {
                // Get first 3 recipe images for collage display
                const recipeImages = list.recipes?.slice(0, 3) || [];
                
                return (
                  <div 
                    key={list.id} 
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
                        <h3 className="font-semibold text-gray-900 mb-1 text-base">{list.name}</h3>
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
            {lists.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📝</div>
                <p className="text-gray-600 mb-2">No tienes listas guardadas</p>
                <p className="text-gray-500 text-sm">Crea tu primera lista de la compra</p>
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