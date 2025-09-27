import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { ArrowUp, ArrowRight, X, Plus, Minus, Menu, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import cartlyLogo from '@/assets/cartly-logo.png';
const Index = () => {
  // Chat conversation component with 4-paragraph typewriter effect
  const navigate = useNavigate();
  const {
    user,
    loading: authLoading,
    signOut
  } = useAuth();
  const [selectedSupermarket, setSelectedSupermarket] = useState<string | null>(null);

  // Expanded state for calendar view
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [showMoreMeals, setShowMoreMeals] = useState(false);

  // Remove typewriter effect states - show content immediately

  // Calendar screen typewriter states
  const [calendarTypewriterStep, setCalendarTypewriterStep] = useState(0);
  const [displayedCalendarParagraph1, setDisplayedCalendarParagraph1] = useState('');
  const [displayedCalendarParagraph2, setDisplayedCalendarParagraph2] = useState('');
  const [showCalendarCursor, setShowCalendarCursor] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  // Loading states
  const [showLoadingDot, setShowLoadingDot] = useState(false);
  const [showSearchingText, setShowSearchingText] = useState(false);
  const [showResultCard, setShowResultCard] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const paragraph1Text = "Elige tu súper para hacer la compra";

  // Menu desplegable state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const additionalMeals = ['Aperitivo', 'Snack', 'Merienda'];

  // Calendar screen text
  const calendarParagraph1Text = `Hemos encontrado 824 productos en ${selectedSupermarket === 'mercadona' ? 'Mercadona' : selectedSupermarket === 'carrefour' ? 'Carrefour' : selectedSupermarket === 'lidl' ? 'Lidl' : 'Alcampo'}, con ellos podemos preparar más de 2.800 recetas.`;
  const calendarParagraph2Text = "👉 Dime, ¿para qué días te gustaría hacer tu compra?";

  // Detectar regreso del login y expandir automáticamente
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pendingSupermarket = localStorage.getItem('pendingSupermarket');
    if (user && pendingSupermarket && urlParams.get('expanded') !== null) {
      setSelectedSupermarket(pendingSupermarket);
      setIsExpanded(true);
      localStorage.removeItem('pendingSupermarket');
      // Limpiar URL sin recargar
      window.history.replaceState({}, '', '/');
    }
  }, [user]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMenuOpen && !target.closest('.relative')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Loading sequence effect
  useEffect(() => {
    if (isExpanded && !loadingComplete) {
      // Reset all states
      setShowLoadingDot(false);
      setShowSearchingText(false);
      setShowResultCard(false);
      setCalendarTypewriterStep(0);
      setDisplayedCalendarParagraph1('');
      setDisplayedCalendarParagraph2('');

      // Start sequence
      setTimeout(() => setShowLoadingDot(true), 300);
      setTimeout(() => setShowSearchingText(true), 1000);
      setTimeout(() => setShowResultCard(true), 2500);
      setTimeout(() => {
        setLoadingComplete(true);
        setCalendarTypewriterStep(1);
      }, 3500);
    }
  }, [isExpanded, loadingComplete]);

  // Remove typewriter effect - content shows immediately

  // Calendar screen typewriter effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isExpanded && calendarTypewriterStep === 1) {
      // Type first paragraph
      if (displayedCalendarParagraph1.length < calendarParagraph1Text.length) {
        timeout = setTimeout(() => {
          setDisplayedCalendarParagraph1(calendarParagraph1Text.slice(0, displayedCalendarParagraph1.length + 1));
        }, 30);
      } else {
        // Move to second paragraph
        setTimeout(() => {
          setCalendarTypewriterStep(2);
        }, 500);
      }
    } else if (isExpanded && calendarTypewriterStep === 2) {
      // Type second paragraph
      if (displayedCalendarParagraph2.length < calendarParagraph2Text.length) {
        timeout = setTimeout(() => {
          setDisplayedCalendarParagraph2(calendarParagraph2Text.slice(0, displayedCalendarParagraph2.length + 1));
        }, 30);
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
  const handleLogout = async () => {
    setIsMenuOpen(false);
    await signOut();
  };
  const handleSupermarketSelect = (supermarket: string) => {
    setSelectedSupermarket(selectedSupermarket === supermarket ? null : supermarket);
  };
  const handleSubmit = () => {
    if (selectedSupermarket) {
      if (!user) {
        // Guardar el supermercado seleccionado antes de ir al login
        localStorage.setItem('pendingSupermarket', selectedSupermarket);
        navigate('/auth?returnTo=expanded');
        return;
      }
      setLoadingComplete(false);
      setIsExpanded(true);
    }
  };
  const handleClose = () => {
    setIsExpanded(false);
    setSelectedSupermarket(null);
    setSelectedDates([]);
    setSelectedMeals([]);
    setShowMoreMeals(false);
    setLoadingComplete(false);
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
    return <div className="min-h-screen flex items-center justify-center" style={{
      backgroundColor: '#F7F7F7'
    }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando...</p>
        </div>
      </div>;
  }

  // Expanded calendar view
  if (isExpanded) {
    return <div className="h-screen flex flex-col relative overflow-hidden" style={{
      backgroundColor: '#FCFBF8'
    }}>
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 z-20 h-16 flex items-center border-b" style={{
        backgroundColor: '#FCFBF8',
        borderBottomColor: '#ECEAE4'
      }}>
          <button onClick={handleClose} className="ml-6 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white transition-colors">
            <X className="h-5 w-5 text-[#1C1C1C]" />
          </button>
        </div>

        {/* Chat area - starts below fixed header */}
        <div className="h-screen flex flex-col relative pt-16">
          {/* Calendar Container - Chat style with bottom padding for fixed button */}
          <div className="flex-1 transition-all duration-500 ease-out overflow-hidden" style={{
          backgroundColor: '#FCFBF8'
        }}>
            <div className="flex flex-col h-full overflow-y-auto">
              {/* User response - supermarket selection (right-aligned) */}
              <div className="px-4 pt-4 mb-6">
                <div className="flex justify-end">
                  <div className="flex items-center gap-2 text-[#1C1C1C] rounded-lg px-3 py-2 text-sm max-w-xs" style={{
                  backgroundColor: '#F6F4ED'
                }}>
                    <img src={selectedSupermarket === 'mercadona' ? '/mercadona-logo-updated.webp' : selectedSupermarket === 'carrefour' ? '/carrefour-logo-updated.png' : selectedSupermarket === 'lidl' ? '/lidl-logo-updated.png' : '/alcampo-logo.png'} alt={selectedSupermarket} className="w-4 h-4 object-contain" />
                    <span className="font-medium">
                      {selectedSupermarket === 'mercadona' ? 'Mercadona' : selectedSupermarket === 'carrefour' ? 'Carrefour' : selectedSupermarket === 'lidl' ? 'Lidl' : 'Alcampo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Loading sequence */}
              {!loadingComplete && <div className="px-4 mb-6">
                  <div className="flex justify-start">
                    <div className="max-w-xs">
                      {/* Loading dot */}
                      {showLoadingDot && <div className="flex items-center gap-2 mb-4">
                          <div className="w-3 h-3 bg-[#1C1C1C] rounded-full animate-pulse"></div>
                        </div>}
                      
                      {/* Searching text with wave effect */}
                      {showSearchingText && <div className="mb-4">
                          <div className="flex items-center gap-1">
                            <span className="text-[#1C1C1C] text-sm">Buscando ingredientes en</span>
                            <div className="inline-flex">
                              {(selectedSupermarket === 'mercadona' ? 'Mercadona' : selectedSupermarket === 'carrefour' ? 'Carrefour' : selectedSupermarket === 'lidl' ? 'Lidl' : 'Alcampo').split('').map((letter, index) => <span key={index} className="text-[#1C1C1C] text-sm font-medium animate-bounce" style={{
                          animationDelay: `${index * 0.1}s`,
                          animationDuration: '1s'
                        }}>
                                  {letter}
                                </span>)}
                            </div>
                          </div>
                        </div>}
                      
                      {/* Result card */}
                      {showResultCard && <div className="bg-white rounded-lg p-4 border border-[#ECEAE4] shadow-sm animate-fade-in">
                          <p className="text-[#1C1C1C] text-sm font-medium">
                            Hemos encontrado 824 ingredientes en {' '}
                            {selectedSupermarket === 'mercadona' ? 'Mercadona' : selectedSupermarket === 'carrefour' ? 'Carrefour' : selectedSupermarket === 'lidl' ? 'Lidl' : 'Alcampo'}
                          </p>
                        </div>}
                    </div>
                  </div>
                </div>}

              {/* Main content - only show after loading is complete */}
              {loadingComplete && <div className="px-4 flex-shrink-0 space-y-4">
                  {/* Calendar paragraph with typewriter effect */}
                  <div className="mb-6">
                    <div className={`transition-all duration-500 ${calendarTypewriterStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <p className="text-base leading-relaxed text-left text-[#1C1C1C] font-medium mb-4">
                        {calendarTypewriterStep >= 1 && <span>
                            {displayedCalendarParagraph1}
                            {calendarTypewriterStep === 1 && showCalendarCursor && <span className="animate-pulse">|</span>}
                          </span>}
                      </p>
                    </div>
                    <div className={`transition-all duration-500 ${calendarTypewriterStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <p className="text-base leading-relaxed text-left text-[#1C1C1C] font-medium">
                        {calendarTypewriterStep >= 2 && <span>
                            {displayedCalendarParagraph2}
                            {calendarTypewriterStep === 2 && showCalendarCursor && <span className="animate-pulse">|</span>}
                          </span>}
                      </p>
                    </div>
                  </div>
                  <div className={`flex justify-center flex-shrink-0 transition-all duration-500 ease-out ${showCalendar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <Calendar selected={selectedDates} onSelect={dates => setSelectedDates(dates || [])} className="pointer-events-auto w-full" />
                  </div>
                </div>}
            </div>
          </div>

          {/* Fixed Button Area at Bottom of Screen */}
          <div className="absolute bottom-0 left-0 right-0 border-t" style={{
          backgroundColor: '#FCFBF8',
          borderTopColor: '#ECEAE4'
        }}>
            <div className="px-4 py-3 flex justify-end">
              <Button variant="ghost" onClick={handleCalendarContinue} disabled={!canContinue} className="w-10 h-10 rounded-full flex items-center justify-center border-0 p-0" style={{
              backgroundColor: canContinue ? '#000000' : '#898885',
              color: canContinue ? '#ffffff' : '#F9F8F2',
              border: 'none',
              opacity: 1
            }}>
                <ArrowUp size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>;
  }

  // Main Landing Page
  return <div className="min-h-screen flex flex-col relative gradient-grain">
      {/* Content wrapper with z-index to stay above grain */}
      <div className="relative z-10 min-h-screen flex flex-col">
      {/* Remove vintage grain effect */}
      {/* Top Header with Logo and Auth Buttons/Menu */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          {user && <div className="relative">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center justify-center w-10 h-10 hover:bg-gray-100/20 transition-colors">
                <Menu className="h-5 w-5 text-[#1C1C1C]" />
              </button>
              
              {/* Dropdown Menu */}
              {isMenuOpen && <div className="absolute top-12 left-0 w-64 bg-white rounded-lg shadow-lg border border-[#EBEAE5] z-50">
                  <div className="p-4">
                    {/* User Info */}
                    <div className="border-b border-[#EBEAE5] pb-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1C1C1C] rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-[#1C1C1C] text-sm">
                            {user.user_metadata?.display_name || user.email?.split('@')[0] || 'Usuario'}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Logout Button */}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#1C1C1C] hover:bg-[#F7F4ED] rounded-lg transition-colors">
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>}
            </div>}
          <h1 className="text-2xl font-semibold text-[#1C1C1C]">Grochat</h1>
        </div>
        
        {!user && <div className="flex items-center gap-3 h-24">
            <Button variant="outline" onClick={handleLogin} className="text-sm font-medium text-[#1C1C1C] bg-[#F7F4ED] border-[#EBEAE5] hover:bg-gray-100 px-3 py-1">
              Iniciar sesión
            </Button>
            <Button onClick={handleGetStarted} className="text-sm font-medium bg-[#1C1C1C] text-white hover:bg-gray-800 px-3 py-1 rounded-lg">
              Empezar
            </Button>
          </div>}
      </div>
      
      {/* Main Content - Landing Page */}
      <div className="flex-1 flex flex-col justify-start px-4 pt-20">
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-3xl font-semibold text-[#1C1C1C] mb-4 text-center">
            Genera listas de compra
          </h1>
          <p className="text-base mb-8 text-center" style={{ color: '#5E6168' }}>
            Crea recetas utilizando los ingredientes<br />
            de tu súpermercado
          </p>
          {/* Chat-style Call to Action */}
          <div className="rounded-3xl shadow-lg pt-6 px-6 pb-6 border w-full" style={{
          backgroundColor: '#FCFBF8',
          borderColor: '#ECEAE4'
        }}>
            <div className="mb-6">
              <p className="text-base leading-relaxed text-left text-[#1C1C1C]">
                {paragraph1Text}
              </p>
            </div>
            
            {/* Horizontal supermarket layout */}
            <div className="flex justify-between items-center gap-3 mb-1">
              <button onClick={() => handleSupermarketSelect('mercadona')} className="flex flex-col items-center gap-2 transition-all duration-300">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center border transition-all duration-300 ${selectedSupermarket === 'mercadona' ? 'bg-[#D2D1CE]' : 'bg-[#F6F4ED]'}`} style={{
                borderColor: selectedSupermarket === 'mercadona' ? '#020817' : '#ECEAE4'
              }}>
                  <img src="/mercadona-logo-updated.webp" alt="Mercadona" className="w-14 h-14 object-contain" />
                </div>
                <span className={`text-xs font-semibold transition-all duration-300 ${selectedSupermarket === 'mercadona' ? 'text-gray-800' : 'text-[#1C1C1C]'}`}>
                  Mercadona
                </span>
              </button>
              
              <button onClick={() => handleSupermarketSelect('carrefour')} className="flex flex-col items-center gap-1 transition-all duration-300">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center border transition-all duration-300 ${selectedSupermarket === 'carrefour' ? 'bg-[#D2D1CE]' : 'bg-[#F6F4ED]'}`} style={{
                borderColor: selectedSupermarket === 'carrefour' ? '#020817' : '#ECEAE4'
              }}>
                  <img src="/carrefour-logo-updated.png" alt="Carrefour" className="w-12 h-12 object-contain" />
                </div>
                <span className={`text-xs font-medium transition-all duration-300 ${selectedSupermarket === 'carrefour' ? 'text-gray-800' : 'text-[#1C1C1C]'}`}>
                  Carrefour
                </span>
              </button>
              
              <button onClick={() => handleSupermarketSelect('lidl')} className="flex flex-col items-center gap-1 transition-all duration-300">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center border transition-all duration-300 ${selectedSupermarket === 'lidl' ? 'bg-[#D2D1CE]' : 'bg-[#F6F4ED]'}`} style={{
                borderColor: selectedSupermarket === 'lidl' ? '#020817' : '#ECEAE4'
              }}>
                  <img src="/lidl-logo-updated.png" alt="Lidl" className="w-12 h-12 object-contain rounded-md" />
                </div>
                <span className={`text-xs font-medium transition-all duration-300 ${selectedSupermarket === 'lidl' ? 'text-gray-800' : 'text-[#1C1C1C]'}`}>
                  Lidl
                </span>
              </button>
              
              <button onClick={() => handleSupermarketSelect('alcampo')} className="flex flex-col items-center gap-1 transition-all duration-300">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center border transition-all duration-300 ${selectedSupermarket === 'alcampo' ? 'bg-[#D2D1CE]' : 'bg-[#F6F4ED]'}`} style={{
                borderColor: selectedSupermarket === 'alcampo' ? '#020817' : '#ECEAE4'
              }}>
                  <img src="/alcampo-logo.png" alt="Alcampo" className="w-10 h-10 object-contain" />
                </div>
                <span className={`text-xs font-medium transition-all duration-300 ${selectedSupermarket === 'alcampo' ? 'text-gray-800' : 'text-[#1C1C1C]'}`}>
                  Alcampo
                </span>
              </button>
            </div>
            
            <div className="flex justify-end mt-4 -mb-2">
              <Button variant="ghost" onClick={handleSubmit} disabled={!selectedSupermarket} className="w-10 h-10 rounded-full flex items-center justify-center border-0 p-0" style={{
              backgroundColor: selectedSupermarket ? '#000000' : '#898885',
              color: selectedSupermarket ? '#ffffff' : '#F9F8F2',
              border: 'none',
              opacity: 1
            }}>
                <ArrowUp size={16} />
              </Button>
            </div>
        </div>
      </div>
      </div>
    </div>
    </div>;
};
export default Index;