import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Settings, Heart, History, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BottomNav } from '@/components/BottomNav';
import { useCart } from '@/hooks/useCart';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { getTotalIngredients } = useCart();
  const [activeTab, setActiveTab] = useState<'explore' | 'cart' | 'recipes' | 'profile'>('profile');
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleTabChange = (tab: 'explore' | 'cart' | 'recipes' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'explore') {
      navigate('/');
    } else if (tab === 'cart') {
      navigate('/cart');
    }
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
    <div className="min-h-screen bg-background pb-24">
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

      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default ProfilePage;