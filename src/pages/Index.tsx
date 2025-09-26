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
  
  // Calendar screen typewriter states
  const [calendarTypewriterStep, setCalendarTypewriterStep] = useState(0);
  const [displayedCalendarParagraph1, setDisplayedCalendarParagraph1] = useState('');
  const [displayedCalendarParagraph2, setDisplayedCalendarParagraph2] = useState('');
  const [showCalendarCursor, setShowCalendarCursor] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const paragraph1Text = "👉 Empecemos… ¿En qué súper te gustaría hacer la compra?";
  const additionalMeals = ['Aperitivo', 'Snack', 'Merienda'];
  
  // Calendar screen text
  const calendarParagraph1Text = `Hemos encontrado 824 productos en ${selectedSupermarket === 'mercadona' ? 'Mercadona' : selectedSupermarket === 'carrefour' ? 'Carrefour' : selectedSupermarket === 'lidl' ? 'Lidl' : 'Alcampo'}, con ellos podemos preparar más de 2.800 recetas.`;
  const calendarParagraph2Text = "👉 Dime, ¿para qué días te gustaría hacer tu compra?";

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

  // Calendar screen typewriter effect
  useEffect(() => {
    if (!isExpanded) {
      // Reset calendar typewriter when not expanded
      setCalendarTypewriterStep(0);
      setDisplayedCalendarParagraph1('');
      setDisplayedCalendarParagraph2('');
      setShowCalendarCursor(true);
      setShowCalendar(false);
      return;
    }

    let timeout: NodeJS.Timeout;
    
    if (calendarTypewriterStep === 0) {
      // Start first message after 500ms delay
      timeout = setTimeout(() => {
        setCalendarTypewriterStep(1);
      }, 500);
    } else if (calendarTypewriterStep === 1) {
      // Type first paragraph character by character
      if (displayedCalendarParagraph1.length < calendarParagraph1Text.length) {
        timeout = setTimeout(() => {
          setDisplayedCalendarParagraph1(calendarParagraph1Text.slice(0, displayedCalendarParagraph1.length + 1));
        }, 50);
      } else {
        // Move to second paragraph
        setTimeout(() => {
          setCalendarTypewriterStep(2);
        }, 500);
      }
    } else if (calendarTypewriterStep === 2) {
      // Type second paragraph character by character
      if (displayedCalendarParagraph2.length < calendarParagraph2Text.length) {
        timeout = setTimeout(() => {
          setDisplayedCalendarParagraph2(calendarParagraph2Text.slice(0, displayedCalendarParagraph2.length + 1));
        }, 50);
      } else {
        // Hide cursor and show calendar
        setTimeout(() => {
          setShowCalendarCursor(false);
          setShowCalendar(true);
        }, 800);
      }
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isExpanded, calendarTypewriterStep, displayedCalendarParagraph1, displayedCalendarParagraph2, calendarParagraph1Text, calendarParagraph2Text]);


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
      <div className="h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#FCFBF8' }}>
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 z-20 h-16 flex items-center border-b" style={{ backgroundColor: '#FCFBF8', borderBottomColor: '#ECEAE4' }}>
          <button 
            onClick={handleClose}
            className="ml-6 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            <X className="h-5 w-5 text-[#1C1C1C]" />
          </button>
        </div>

        {/* Chat area - starts below fixed header */}
        <div className="h-screen flex flex-col relative pt-16">
          {/* Calendar Container - Chat style with bottom padding for fixed button */}
          <div className="flex-1 transition-all duration-500 ease-out overflow-hidden" style={{ backgroundColor: '#FCFBF8' }}>
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="px-4 flex-shrink-0 space-y-4">
                {/* Product Tags above all text */}
                <div className="mt-6 mb-4">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {/* Product Tag 1 */}
                    <div className="flex items-start gap-2 bg-white rounded-lg shadow-sm p-2">
                      <img 
                        src="https://prod-mercadona.imgix.net/images/a66b8d4177a91f7f219903267291e071.jpg?fit=crop&h=300&w=300" 
                        alt="Patatas" 
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex flex-col">
                        <h3 className="text-xs text-[#1C1C1C] mb-1">Patatas 5kg</h3>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-[#1C1C1C]">4,75 €</span>
                          <span className="text-gray-500">/ud.</span>
                        </div>
                      </div>
                    </div>

                    {/* Product Tag 2 */}
                    <div className="flex items-start gap-2 bg-white rounded-lg shadow-sm p-2">
                      <img 
                        src="https://prod-mercadona.imgix.net/images/a66b8d4177a91f7f219903267291e071.jpg?fit=crop&h=300&w=300" 
                        alt="Patatas" 
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex flex-col">
                        <h3 className="text-xs text-[#1C1C1C] mb-1">Patatas 5kg</h3>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-[#1C1C1C]">4,75 €</span>
                          <span className="text-gray-500">/ud.</span>
                        </div>
                      </div>
                    </div>

                    {/* Product Tag 3 */}
                    <div className="flex items-start gap-2 bg-white rounded-lg shadow-sm p-2">
                      <img 
                        src="https://prod-mercadona.imgix.net/images/a66b8d4177a91f7f219903267291e071.jpg?fit=crop&h=300&w=300" 
                        alt="Patatas" 
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex flex-col">
                        <h3 className="text-xs text-[#1C1C1C] mb-1">Patatas 5kg</h3>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-[#1C1C1C]">4,75 €</span>
                          <span className="text-gray-500">/ud.</span>
                        </div>
                      </div>
                    </div>

                    {/* Product Tag 4 */}
                    <div className="flex items-start gap-2 bg-white rounded-lg shadow-sm p-2">
                      <img 
                        src="https://prod-mercadona.imgix.net/images/a66b8d4177a91f7f219903267291e071.jpg?fit=crop&h=300&w=300" 
                        alt="Patatas" 
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex flex-col">
                        <h3 className="text-xs text-[#1C1C1C] mb-1">Patatas 5kg</h3>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-[#1C1C1C]">4,75 €</span>
                          <span className="text-gray-500">/ud.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`transition-all duration-500 ${calendarTypewriterStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                  <p className="text-base leading-relaxed text-left text-[#1C1C1C] mt-8">
                    {calendarTypewriterStep >= 1 && (
                      <span>
                        {displayedCalendarParagraph1}
                        {calendarTypewriterStep === 1 && showCalendarCursor && <span className="animate-pulse">|</span>}
                      </span>
                    )}
                  </p>
                </div>

                <div className={`transition-all duration-500 ${calendarTypewriterStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                  <p className="text-base leading-relaxed text-left text-[#1C1C1C] font-semibold">
                    {calendarTypewriterStep >= 2 && (
                      <span>
                        {displayedCalendarParagraph2}
                        {calendarTypewriterStep === 2 && showCalendarCursor && <span className="animate-pulse">|</span>}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className={`flex justify-center flex-shrink-0 transition-all duration-500 ease-out ${showCalendar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <Calendar 
                  selected={selectedDates} 
                  onSelect={dates => setSelectedDates(dates || [])} 
                  className="pointer-events-auto w-full" 
                />
              </div>
            </div>
          </div>

          {/* Fixed Button Area at Bottom of Screen */}
          <div className="absolute bottom-0 left-0 right-0 border-t" style={{ backgroundColor: '#FCFBF8', borderTopColor: '#ECEAE4' }}>
            <div className="px-4 py-3 flex justify-end">
              <Button
                variant="ghost"
                onClick={handleCalendarContinue}
                disabled={!canContinue}
                className="w-10 h-10 rounded-full flex items-center justify-center border-0 p-0"
                style={{
                  backgroundColor: canContinue ? '#000000' : '#898885',
                  color: canContinue ? '#ffffff' : '#F9F8F2',
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
          <h1 className="text-2xl font-bold text-[#1C1C1C]">Grochat</h1>
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
          <div className="rounded-3xl shadow-lg p-6 border w-full transition-all duration-500 ease-out" style={{ backgroundColor: '#FCFBF8', borderColor: '#ECEAE4', minHeight: '120px' }}>
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
                className={`inline-flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 text-base border ${
                  selectedSupermarket === 'mercadona' 
                    ? 'bg-gray-800 text-white border-gray-800' 
                    : 'text-[#1C1C1C] hover:bg-gray-300 border-[#ECEAE4]'
                } ${visibleSupermarkets >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={selectedSupermarket !== 'mercadona' ? { backgroundColor: '#F6F4ED' } : {}}
              >
                <img src="/mercadona-logo-updated.webp" alt="Mercadona" className="w-5 h-5 object-contain" />
                <span className="font-medium text-base">Mercadona</span>
              </button>
              
              <button 
                onClick={() => handleSupermarketSelect('carrefour')}
                className={`inline-flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 text-base border ${
                  selectedSupermarket === 'carrefour' 
                    ? 'bg-gray-800 text-white border-gray-800' 
                    : 'text-[#1C1C1C] hover:bg-gray-300 border-[#ECEAE4]'
                } ${visibleSupermarkets >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={selectedSupermarket !== 'carrefour' ? { backgroundColor: '#F6F4ED' } : {}}
              >
                <img src="/carrefour-logo-updated.png" alt="Carrefour" className="w-4 h-4 object-contain" />
                <span className="font-medium text-base">Carrefour</span>
              </button>
              
              <button 
                onClick={() => handleSupermarketSelect('lidl')}
                className={`inline-flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 text-base border ${
                  selectedSupermarket === 'lidl' 
                    ? 'bg-gray-800 text-white border-gray-800' 
                    : 'text-[#1C1C1C] hover:bg-gray-300 border-[#ECEAE4]'
                } ${visibleSupermarkets >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={selectedSupermarket !== 'lidl' ? { backgroundColor: '#F6F4ED' } : {}}
              >
                <img src="/lidl-logo-updated.png" alt="Lidl" className="w-4 h-4 object-contain rounded-full" />
                <span className="font-medium text-base">Lidl</span>
              </button>
              
              <button 
                onClick={() => handleSupermarketSelect('alcampo')}
                className={`inline-flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 text-base border ${
                  selectedSupermarket === 'alcampo' 
                    ? 'bg-gray-800 text-white border-gray-800' 
                    : 'text-[#1C1C1C] hover:bg-gray-300 border-[#ECEAE4]'
                } ${visibleSupermarkets >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={selectedSupermarket !== 'alcampo' ? { backgroundColor: '#F6F4ED' } : {}}
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
                  backgroundColor: selectedSupermarket ? '#000000' : '#898885',
                  color: selectedSupermarket ? '#ffffff' : '#F9F8F2',
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