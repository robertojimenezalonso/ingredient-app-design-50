import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ArrowUp } from 'lucide-react';
import cartlyLogo from '@/assets/cartly-logo.png';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedSupermarket, setSelectedSupermarket] = useState<string | null>(null);

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

  const handleSupermarketSelect = (supermarket: string) => {
    setSelectedSupermarket(supermarket);
  };

  const handleSubmit = () => {
    if (selectedSupermarket) {
      navigate('/auth?mode=signup');
    }
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
    <div className="min-h-screen flex flex-col bg-gradient-to-t from-purple-200 via-blue-100 to-gray-50 relative overflow-hidden">
      {/* Vintage grain effect */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'multiply'
        }}
      />
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
          <div className="rounded-3xl shadow-lg p-6 border" style={{ backgroundColor: '#F7F4ED', borderColor: '#CAC9C4' }}>
            <div className="mb-6">
              <p className="text-base leading-relaxed text-left" style={{ color: '#5F5F5D' }}>
                ¿En qué supermercado te gustaría hacer la compra?
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button 
                onClick={() => handleSupermarketSelect('mercadona')}
                className={`flex items-center gap-2 p-4 rounded-full transition-colors border ${
                  selectedSupermarket === 'mercadona' 
                    ? 'bg-gray-800 text-white border-gray-800' 
                    : 'bg-transparent text-black hover:bg-gray-50'
                }`}
                style={selectedSupermarket !== 'mercadona' ? { borderColor: '#CAC9C4' } : {}}
              >
                <img src="/mercadona-logo-updated.webp" alt="Mercadona" className="w-5 h-5 object-contain" />
                <span className="font-medium text-sm">Mercadona</span>
              </button>
              
              <button 
                onClick={() => handleSupermarketSelect('carrefour')}
                className={`flex items-center gap-2 p-4 rounded-full transition-colors border ${
                  selectedSupermarket === 'carrefour' 
                    ? 'bg-gray-800 text-white border-gray-800' 
                    : 'bg-transparent text-black hover:bg-gray-50'
                }`}
                style={selectedSupermarket !== 'carrefour' ? { borderColor: '#CAC9C4' } : {}}
              >
                <img src="/carrefour-logo-updated.png" alt="Carrefour" className="w-5 h-5 object-contain" />
                <span className="font-medium text-sm">Carrefour</span>
              </button>
              
              <button 
                onClick={() => handleSupermarketSelect('lidl')}
                className={`flex items-center gap-2 p-4 rounded-full transition-colors border ${
                  selectedSupermarket === 'lidl' 
                    ? 'bg-gray-800 text-white border-gray-800' 
                    : 'bg-transparent text-black hover:bg-gray-50'
                }`}
                style={selectedSupermarket !== 'lidl' ? { borderColor: '#CAC9C4' } : {}}
              >
                <img src="/lidl-logo-updated.png" alt="Lidl" className="w-5 h-5 object-contain" />
                <span className="font-medium text-sm">Lidl</span>
              </button>
              
              <button 
                onClick={() => handleSupermarketSelect('alcampo')}
                className={`flex items-center justify-center gap-2 p-4 rounded-full transition-colors border ${
                  selectedSupermarket === 'alcampo' 
                    ? 'bg-gray-800 text-white border-gray-800' 
                    : 'bg-transparent text-black hover:bg-gray-50'
                }`}
                style={selectedSupermarket !== 'alcampo' ? { borderColor: '#CAC9C4' } : {}}
              >
                <img src="/alcampo-logo.png" alt="Alcampo" className="w-5 h-5 object-contain" />
                <span className="font-medium text-sm">Alcampo</span>
              </button>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!selectedSupermarket}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedSupermarket 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ArrowUp size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;