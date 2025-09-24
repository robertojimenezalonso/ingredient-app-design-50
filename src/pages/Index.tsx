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
          <div className="space-y-4">
            <Button
              onClick={handleGetStarted}
              className="w-full h-12 text-lg font-medium bg-black text-white hover:bg-gray-800"
            >
              Comenzar ahora
            </Button>
            <Button
              variant="outline"
              onClick={handleLogin}
              className="w-full h-12 text-lg font-medium"
            >
              Ya tengo cuenta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;