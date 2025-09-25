import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import cartlyLogo from '@/assets/cartly-logo.png';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Redirect to main app if authenticated
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/mis-listas');
    }
  }, [user, authLoading, navigate]);

  const handleLogin = () => {
    navigate('/auth?mode=login');
  };

  const handleGetStarted = () => {
    navigate('/auth?mode=signup');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F7F7' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to main app
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F7F7' }}>
      {/* Top Header with Logo and Auth Buttons */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center">
          <img src={cartlyLogo} alt="Cartly" className="h-12 w-24 object-contain" />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleLogin}
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium"
          >
            Iniciar sesión
          </Button>
          <Button
            onClick={handleGetStarted}
            className="bg-black text-white hover:bg-gray-800 font-medium px-6"
          >
            Comenzar
          </Button>
        </div>
      </div>
      
      {/* Main Content - Landing Page */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Bienvenido a Cartly
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Crea y gestiona tus listas de la compra de forma inteligente
          </p>
          {/* Chat-style Call to Action */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">C</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-800 text-base leading-relaxed">
                  ¿En qué supermercado te gustaría hacer la compra?
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleGetStarted}
                className="flex items-center gap-2 p-3 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
              >
                <img src="/lovable-uploads/mercadona-logo-new.png" alt="Mercadona" className="w-6 h-6 object-contain" />
                <span className="text-red-700 font-medium text-sm">Mercadona</span>
              </button>
              
              <button 
                onClick={handleGetStarted}
                className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                <img src="/lovable-uploads/carrefour-logo.png" alt="Carrefour" className="w-6 h-6 object-contain" />
                <span className="text-blue-700 font-medium text-sm">Carrefour</span>
              </button>
              
              <button 
                onClick={handleGetStarted}
                className="flex items-center gap-2 p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg border border-yellow-200 transition-colors"
              >
                <img src="/lovable-uploads/lidl-logo.png" alt="Lidl" className="w-6 h-6 object-contain" />
                <span className="text-yellow-700 font-medium text-sm">Lidl</span>
              </button>
              
              <button 
                onClick={handleGetStarted}
                className="flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <span className="text-gray-700 font-medium text-sm">Otro</span>
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={handleLogin}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                ¿Ya tienes cuenta? Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;