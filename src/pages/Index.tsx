import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { ArrowUp, ArrowRight, X, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import cartlyLogo from '@/assets/cartly-logo.png';

const Index = () => {
  // Chat conversation component with 4-paragraph typewriter effect
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedSupermarket, setSelectedSupermarket] = useState<string | null>(null);
  
  // Expanded state for calendar view
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [showMoreMeals, setShowMoreMeals] = useState(false);
  
  // Typewriter effect states
  const [typewriterStep, setTypewriterStep] = useState(0);
  const [displayedParagraph1, setDisplayedParagraph1] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [showSupermarkets, setShowSupermarkets] = useState(false);
  const [visibleSupermarkets, setVisibleSupermarkets] = useState<number>(0);
  
  const paragraph1Text = "👉 Empecemos… ¿En qué súper te gustaría hacer la compra?";
  const additionalMeals = ['Aperitivo', 'Snack', 'Merienda'];

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
  }, [typewriterStep, displayedParagraph1, paragraph1Text]);


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
      setIsExpanded(true);
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    setSelectedSupermarket(null);
    setSelectedDates([]);
    setSelectedMeals([]);
    setShowMoreMeals(false);
  };

  const toggleMeal = (meal: string) => {
    if (selectedMeals.includes(meal)) {
      setSelectedMeals(selectedMeals.filter(m => m !== meal));
    } else {
      setSelectedMeals([...selectedMeals, meal]);
    }
  };

  const handleCalendarContinue = () => {
    if (selectedDates.length > 0) {
      navigate('/auth?mode=signup');
    }
  };

  const canContinue = selectedDates.length > 0;

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

  // Expanded calendar view
  if (isExpanded) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-t from-purple-200 via-blue-100 to-gray-50 relative overflow-hidden">
        {/* X button positioned absolutely in top area */}
        <button 
          onClick={handleClose}
          className="absolute top-6 left-6 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white transition-colors z-10"
        >
          <X className="h-5 w-5 text-[#1C1C1C]" />
        </button>

        {/* First half - completely empty, spacer */}
        <div className="flex-1"></div>

        {/* Second half with calendar - fixed to bottom half */}
        <div className="h-1/2 flex flex-col max-h-1/2">
          {/* Calendar Container - Chat style */}
          <div className="rounded-t-3xl shadow-lg p-4 bg-white flex-1 transition-all duration-500 ease-out overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="mb-3 flex-shrink-0">
                <p className="text-base leading-relaxed text-left text-[#1C1C1C] font-medium">
                  ¿Para qué días quieres generar recetas?
                </p>
              </div>
              
              <div className="flex justify-center flex-1 overflow-hidden">
                <Calendar 
                  selected={selectedDates} 
                  onSelect={dates => setSelectedDates(dates || [])} 
                  className="pointer-events-auto max-h-full" 
                />
              </div>

              {/* Send Button - Bottom Right */}
              <div className="flex justify-end flex-shrink-0 mt-2">
                <Button
                  variant="ghost"
                  onClick={handleCalendarContinue}
                  disabled={!canContinue}
                  className="w-10 h-10 rounded-full flex items-center justify-center border-0 p-0"
                  style={{
                    backgroundColor: canContinue ? '#000000' : '#F2F2F2',
                    color: canContinue ? '#ffffff' : '#5D5D5D',
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
          <h1 className="text-2xl font-bold text-[#1C1C1C]">Cartly</h1>
        </div>
        <div className="flex items-center gap-3 h-24">
          <Button
            variant="outline"
            onClick={handleLogin}
            className="text-sm font-medium text-[#1C1C1C] bg-[#F7F4ED] border-[#EBEAE5] hover:bg-gray-100 px-3 py-1"
          >
            Iniciar sesión
          </Button>
          <Button
            onClick={handleGetStarted}
            className="text-sm font-medium bg-[#1C1C1C] text-white hover:bg-gray-800 px-3 py-1 rounded-lg"
          >
            Empezar
          </Button>
        </div>
      </div>
      
      {/* Main Content - Landing Page */}
      <div className="flex-1 flex flex-col px-6 pt-16">
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-3xl font-semibold text-[#1C1C1C] mb-2 text-center">
            Genera listas de compra
          </h1>
          <p className="text-lg text-[#626469] text-center mb-6">
            Crea recetas personalizadas con ingredientes de tu súper utilizando IA
          </p>
          
          {/* Chat-style Call to Action */}
          <div className="rounded-3xl shadow-lg p-6 border bg-white w-full transition-all duration-500 ease-out" style={{ borderColor: '#CAC9C4', minHeight: '120px' }}>
            <div className={`transition-all duration-500 ease-out ${typewriterStep >= 1 ? 'mb-6' : 'mb-0'} space-y-4`}>
              {/* First paragraph */}
              <div className={`transition-all duration-500 ${typewriterStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <p className="text-base leading-relaxed text-left text-[#1C1C1C] font-medium">
                  {typewriterStep >= 1 && (
                    <span>
                      {displayedParagraph1}
                      {typewriterStep === 1 && showCursor && <span className="animate-pulse">|</span>}
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
                    : 'text-[#1C1C1C] hover:bg-gray-300'
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
                    : 'text-[#1C1C1C] hover:bg-gray-300'
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
                    : 'text-[#1C1C1C] hover:bg-gray-300'
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
                    : 'text-[#1C1C1C] hover:bg-gray-300'
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