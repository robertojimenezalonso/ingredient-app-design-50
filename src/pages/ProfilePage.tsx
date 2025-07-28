import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Settings, Heart, History, LogOut, Trash2, Calendar, Users, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGlobalRecipeRegistry } from '@/hooks/useGlobalRecipeRegistry';
import { toast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { getTotalIngredients } = useCart();
  const { user, loading, signOut } = useAuth();
  const registry = useGlobalRecipeRegistry();
  const [savedLists, setSavedLists] = useState<any[]>([]);

  // Load saved shopping lists
  useEffect(() => {
    const loadSavedLists = () => {
      try {
        const saved = localStorage.getItem('savedShoppingLists');
        if (saved) {
          const lists = JSON.parse(saved);
          // Ensure all lists have recipeImages - add fallback if missing
          const listsWithImages = lists.map((list: any) => ({
            ...list,
            recipeImages: list.recipeImages || [
              'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
              'https://images.unsplash.com/photo-1582562124811-c09040d0a901', 
              'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07'
            ]
          }));
          setSavedLists(listsWithImages.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ));
        }
      } catch (error) {
        console.error('Error loading saved lists:', error);
      }
    };

    loadSavedLists();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleListClick = (listId?: string) => {
    navigate('/milista');
  };


  const clearRecipes = () => {
    registry.clear();
    localStorage.removeItem('aiGeneratedRecipes');
    toast({
      title: "Recetas eliminadas",
      description: "Se han eliminado todas las recetas generadas"
    });
  };

  const menuItems = [
    {
      icon: Heart,
      title: 'Favoritos',
      description: 'Tus recetas guardadas',
      onClick: () => navigate('/category/favorites')
    },
    {
      icon: History,
      title: 'Historial',
      description: 'Recetas cocinadas',
      onClick: () => {}
    },
    {
      icon: Settings,
      title: 'Configuración',
      description: 'Ajustes de la app',
      onClick: () => {}
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/')}
          className="rounded-xl"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Perfil</h1>
      </div>

      <div className="p-4">
        {/* User Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user?.user_metadata?.display_name || user?.email || 'Usuario'}</h2>
                <p className="text-muted-foreground">Cocinero aficionado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Planificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{savedLists.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recetas cocinadas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Historial de planificaciones */}
        {savedLists.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">Tus planificaciones</h3>
            <div className="space-y-3">
              {savedLists.map((list: any, index: number) => {
                const daysText = list.selectedDates?.length 
                  ? `${list.selectedDates.length} día${list.selectedDates.length > 1 ? 's' : ''}`
                  : '0 días';
                  
                const servingsText = `${list.servingsPerRecipe || 1} ración${(list.servingsPerRecipe || 1) > 1 ? 'es' : ''}`;
                
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
                      <div className="w-24 h-16 flex gap-1 overflow-hidden rounded-xl">
                        {(() => {
                          const fallbackImages = [
                            'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
                            'https://images.unsplash.com/photo-1582562124811-c09040d0a901', 
                            'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07'
                          ];
                          const imagesToShow = list.recipeImages && list.recipeImages.length > 0 
                            ? list.recipeImages.slice(0, 3)
                            : fallbackImages;
                          
                          return imagesToShow.map((imageUrl: string, imgIndex: number) => (
                            <img 
                              key={imgIndex}
                              src={imageUrl} 
                              alt={`Receta ${imgIndex + 1}`}
                              className="w-8 h-16 object-cover rounded-sm"
                              onError={(e) => {
                                console.error('Image failed to load:', imageUrl);
                                (e.target as HTMLImageElement).src = fallbackImages[imgIndex] || fallbackImages[0];
                              }}
                            />
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4" onClick={item.onClick}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Clear Recipes Button */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-orange-200">
            <CardContent className="p-4" onClick={clearRecipes}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-orange-600">Limpiar Recetas</h3>
                  <p className="text-sm text-muted-foreground">Eliminar todas las recetas generadas ({registry.getCount()} recetas)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Logout Button */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-destructive/20">
            <CardContent className="p-4" onClick={signOut}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <LogOut className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-destructive">Cerrar Sesión</h3>
                  <p className="text-sm text-muted-foreground">Salir de tu cuenta</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;