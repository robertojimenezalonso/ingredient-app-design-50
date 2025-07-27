
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { SavedShoppingListCard } from '@/components/SavedShoppingListCard';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const InitialWelcomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'explore' | 'cart' | 'recipes' | 'profile'>('explore');
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleTabChange = (tab: 'explore' | 'cart' | 'recipes' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'explore') {
      navigate('/calendar-selection');
    } else if (tab === 'profile') {
      navigate('/profile');
    } else if (tab === 'cart') {
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Saved Shopping List Card - only shows when returning from Mi Lista */}
      <SavedShoppingListCard />
      
      {/* Main welcome content */}
      <div className="p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenido a tu asistente de compras
          </h1>
          <p className="text-gray-600">
            Planifica tus comidas y genera tu lista de la compra automáticamente
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <button 
            onClick={() => navigate('/calendar-selection')}
            className="w-full bg-black text-white py-4 px-6 rounded-2xl font-medium text-base shadow-lg hover:bg-gray-800 transition-colors"
          >
            Comenzar planificación
          </button>
          
          {!user && (
            <Button 
              variant="outline"
              onClick={() => navigate('/auth')}
              className="w-full"
            >
              Iniciar Sesión
            </Button>
          )}
        </div>
      </div>

      <BottomNav 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default InitialWelcomePage;
