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
  
  // Typewriter effect states
  const [typewriterStep, setTypewriterStep] = useState(0);
  const [displayedSubtitle, setDisplayedSubtitle] = useState('');
  const [displayedQuestion, setDisplayedQuestion] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [showSupermarkets, setShowSupermarkets] = useState(false);
  
  const subtitleText = "Crea listas de la compra inteligentes chateando con AI";
  const questionText = "¿En qué supermercado te gustaría hacer la compra?";

  // Typewriter effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (typewriterStep === 0) {
      // Start first message after initial delay
      timeout = setTimeout(() => {
        setTypewriterStep(1);
      }, 500);
    } else if (typewriterStep === 1) {
      // Type subtitle character by character
      if (displayedSubtitle.length < subtitleText.length) {
        timeout = setTimeout(() => {
          setDisplayedSubtitle(subtitleText.slice(0, displayedSubtitle.length + 1));
        }, 30);
      } else {
        // Hide cursor and move to next step
        setTimeout(() => {
          setShowCursor(false);
          setTypewriterStep(2);
        }, 800);
      }
    } else if (typewriterStep === 2) {
      // Show cursor for second message
      setShowCursor(true);
      // Type question character by character
      if (displayedQuestion.length < questionText.length) {
        timeout = setTimeout(() => {
          setDisplayedQuestion(questionText.slice(0, displayedQuestion.length + 1));
        }, 30);
      } else {
        // Hide cursor and show supermarkets
        setTimeout(() => {
          setShowCursor(false);
          setShowSupermarkets(true);
        }, 800);
      }
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [typewriterStep, displayedSubtitle, displayedQuestion, subtitleText, questionText]);


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
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Genera tu lista de la compra
          </h1>
          
          {/* Chat-style Call to Action */}
          <div className="rounded-3xl shadow-lg p-6 border" style={{ backgroundColor: '#F7F4ED', borderColor: '#CAC9C4' }}>
            <div className="mb-6 space-y-4">
              {/* Typing animation for the first message */}
              <div className={`transition-all duration-500 ${typewriterStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <p className="text-base leading-relaxed text-left text-black">
                  {typewriterStep >= 1 && (
                    <span>
                      {displayedSubtitle}
                      {typewriterStep === 1 && showCursor && <span className="animate-pulse">|</span>}
                    </span>
                  )}
                </p>
              </div>
              
              {/* Second message with delay */}
              <div className={`transition-all duration-500 ${typewriterStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <p className="text-base leading-relaxed text-left text-black">
                  {typewriterStep >= 2 && (
                    <span>
                      {displayedQuestion}
                      {typewriterStep === 2 && showCursor && <span className="animate-pulse">|</span>}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className={`grid grid-cols-2 gap-3 mb-6 transition-all duration-500 ${showSupermarkets ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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
                <img src="/lidl-logo-updated.png" alt="Lidl" className="w-5 h-5 object-contain rounded-full" />
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
            
            <div className={`flex justify-end transition-all duration-500 ${showSupermarkets ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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