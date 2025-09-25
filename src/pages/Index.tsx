import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ArrowUp, ArrowRight } from 'lucide-react';
import cartlyLogo from '@/assets/cartly-logo.png';

const Index = () => {
  // Chat conversation component with 4-paragraph typewriter effect
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedSupermarket, setSelectedSupermarket] = useState<string | null>(null);
  
  // Typewriter effect states
  const [typewriterStep, setTypewriterStep] = useState(0);
  const [displayedParagraph1, setDisplayedParagraph1] = useState('');
  const [displayedParagraph2, setDisplayedParagraph2] = useState('');
  const [displayedParagraph3, setDisplayedParagraph3] = useState('');
  const [displayedParagraph4, setDisplayedParagraph4] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [showSupermarkets, setShowSupermarkets] = useState(false);
  const [visibleSupermarkets, setVisibleSupermarkets] = useState<number>(0);
  
  const paragraph1Text = "Crearé recetas según tus preferencias.";
  const paragraph2Text = "Después, buscaré los ingredientes en tu súper favorito y te generaré la lista de la compra.";
  const paragraph3Text = "👉 Empecemos… ¿En qué súper te gustaría hacer la compra?";

  // Typewriter effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (typewriterStep === 0) {
      // Start first message after 1 second delay to let user read title
      timeout = setTimeout(() => {
        setTypewriterStep(1);
      }, 1000);
    } else if (typewriterStep === 1) {
      // Type first paragraph character by character
      if (displayedParagraph1.length < paragraph1Text.length) {
        timeout = setTimeout(() => {
          setDisplayedParagraph1(paragraph1Text.slice(0, displayedParagraph1.length + 1));
        }, 50);
      } else {
        // Move to next step immediately for fluid flow
        setTypewriterStep(2);
      }
    } else if (typewriterStep === 2) {
      // Type second paragraph character by character
      if (displayedParagraph2.length < paragraph2Text.length) {
        timeout = setTimeout(() => {
          setDisplayedParagraph2(paragraph2Text.slice(0, displayedParagraph2.length + 1));
        }, 50);
      } else {
        // Move to next step immediately for fluid flow
        setTypewriterStep(3);
      }
    } else if (typewriterStep === 3) {
      // Type third paragraph character by character
      if (displayedParagraph3.length < paragraph3Text.length) {
        timeout = setTimeout(() => {
          setDisplayedParagraph3(paragraph3Text.slice(0, displayedParagraph3.length + 1));
        }, 50);
      } else {
        // Hide cursor and show supermarkets
        setTimeout(() => {
          setShowCursor(false);
          setShowSupermarkets(true);
          // Start showing supermarkets one by one
          setTimeout(() => setVisibleSupermarkets(1), 200);
          setTimeout(() => setVisibleSupermarkets(2), 400);
          setTimeout(() => setVisibleSupermarkets(3), 600);
          setTimeout(() => setVisibleSupermarkets(4), 800);
        }, 800);
      }
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [typewriterStep, displayedParagraph1, displayedParagraph2, displayedParagraph3, paragraph1Text, paragraph2Text, paragraph3Text]);


  const handleLogin = () => {
    navigate('/auth?mode=login');
  };

  const handleGetStarted = () => {
    navigate('/auth?mode=signup');
  };

  const handleSupermarketSelect = (supermarket: string) => {
    setSelectedSupermarket(selectedSupermarket === supermarket ? null : supermarket);
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
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleLogin}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Iniciar sesión
          </Button>
          <Button
            onClick={handleGetStarted}
            className="text-sm font-medium bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-lg"
          >
            Empezar
          </Button>
        </div>
      </div>
      
      {/* Main Content - Landing Page */}
      <div className="flex-1 flex flex-col px-6 pt-16">
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-xl font-medium text-gray-900 mb-6 text-center">
            Hola 👋, soy Cartly, tu asistente de compra en supermercado
          </h1>
          
          {/* Chat-style Call to Action */}
          <div className="rounded-3xl shadow-lg p-6 border bg-white w-full transition-all duration-500 ease-out" style={{ borderColor: '#CAC9C4', minHeight: '120px' }}>
            <div className={`transition-all duration-500 ease-out ${typewriterStep >= 1 ? 'mb-6' : 'mb-0'} space-y-4`}>
              {/* First paragraph */}
              <div className={`transition-all duration-500 ${typewriterStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <p className="text-base leading-relaxed text-left text-black">
                  {typewriterStep >= 1 && (
                    <span>
                      {displayedParagraph1}
                      {typewriterStep === 1 && showCursor && <span className="animate-pulse">|</span>}
                    </span>
                  )}
                </p>
              </div>
              
              {/* Second paragraph */}
              <div className={`transition-all duration-500 ${typewriterStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <p className="text-base leading-relaxed text-left text-black">
                  {typewriterStep >= 2 && (
                    <span>
                      {displayedParagraph2}
                      {typewriterStep === 2 && showCursor && <span className="animate-pulse">|</span>}
                    </span>
                  )}
                </p>
              </div>
              
              {/* Third paragraph */}
              <div className={`transition-all duration-500 ${typewriterStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <p className="text-base leading-relaxed text-left text-black font-medium">
                  {typewriterStep >= 3 && (
                    <span>
                      {displayedParagraph3}
                      {typewriterStep === 3 && showCursor && <span className="animate-pulse">|</span>}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className={`flex flex-col items-start gap-2 transition-all duration-500 ease-out ${showSupermarkets ? 'opacity-100 translate-y-0 mb-6' : 'opacity-0 translate-y-4 mb-0 h-0 overflow-hidden'}`}>
              <button 
                onClick={() => handleSupermarketSelect('mercadona')}
                className={`inline-flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 text-base ${
                  selectedSupermarket === 'mercadona' 
                    ? 'bg-gray-800 text-white' 
                    : 'text-black hover:bg-gray-300'
                } ${visibleSupermarkets >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={selectedSupermarket !== 'mercadona' ? { backgroundColor: '#F2F2F2' } : {}}
              >
                <img src="/mercadona-logo-updated.webp" alt="Mercadona" className="w-5 h-5 object-contain" />
                <span className="font-medium text-base">Mercadona</span>
              </button>
              
              <button 
                onClick={() => handleSupermarketSelect('carrefour')}
                className={`inline-flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 text-base ${
                  selectedSupermarket === 'carrefour' 
                    ? 'bg-gray-800 text-white' 
                    : 'text-black hover:bg-gray-300'
                } ${visibleSupermarkets >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={selectedSupermarket !== 'carrefour' ? { backgroundColor: '#F2F2F2' } : {}}
              >
                <img src="/carrefour-logo-updated.png" alt="Carrefour" className="w-4 h-4 object-contain" />
                <span className="font-medium text-base">Carrefour</span>
              </button>
              
              <button 
                onClick={() => handleSupermarketSelect('lidl')}
                className={`inline-flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 text-base ${
                  selectedSupermarket === 'lidl' 
                    ? 'bg-gray-800 text-white' 
                    : 'text-black hover:bg-gray-300'
                } ${visibleSupermarkets >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={selectedSupermarket !== 'lidl' ? { backgroundColor: '#F2F2F2' } : {}}
              >
                <img src="/lidl-logo-updated.png" alt="Lidl" className="w-4 h-4 object-contain rounded-full" />
                <span className="font-medium text-base">Lidl</span>
              </button>
              
              <button 
                onClick={() => handleSupermarketSelect('alcampo')}
                className={`inline-flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 text-base ${
                  selectedSupermarket === 'alcampo' 
                    ? 'bg-gray-800 text-white' 
                    : 'text-black hover:bg-gray-300'
                } ${visibleSupermarkets >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={selectedSupermarket !== 'alcampo' ? { backgroundColor: '#F2F2F2' } : {}}
              >
                <img src="/alcampo-logo.png" alt="Alcampo" className="w-4 h-4 object-contain" />
                <span className="font-medium text-base">Alcampo</span>
              </button>
            </div>
            
            <div className={`flex justify-end transition-all duration-500 ease-out ${showSupermarkets ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 h-0 overflow-hidden'}`}>
              <Button
                variant="ghost"
                onClick={handleSubmit}
                disabled={!selectedSupermarket}
                className="w-10 h-10 rounded-full flex items-center justify-center border-0 p-0"
                style={{
                  backgroundColor: selectedSupermarket ? '#000000' : '#F2F2F2',
                  color: selectedSupermarket ? '#ffffff' : '#5D5D5D',
                  border: 'none',
                  opacity: 1
                }}
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