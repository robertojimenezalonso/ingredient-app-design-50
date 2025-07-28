import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Settings, Heart, History, LogOut, Trash2 } from 'lucide-react';
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

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);


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
                Recetas favoritas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">0</div>
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