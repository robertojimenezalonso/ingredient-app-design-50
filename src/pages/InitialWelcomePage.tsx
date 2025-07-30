
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SavedShoppingListCard } from '@/components/SavedShoppingListCard';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const InitialWelcomePage = () => {
  const navigate = useNavigate();
  
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);


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
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
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
            className="w-full bg-btn-floating text-btn-floating-foreground py-4 px-6 rounded-2xl font-medium text-base shadow-lg hover:bg-btn-floating/90 transition-colors"
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

      {/* Saved Shopping List Card - now shows below the button */}
      <SavedShoppingListCard />
    </div>
  );
};

export default InitialWelcomePage;
