import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { ArrowUp, ArrowRight, X, Plus, Minus, Menu, LogOut, User, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import cartlyLogo from '@/assets/cartly-logo.png';
import { supabase } from '@/integrations/supabase/client';
import { IngredientProgressAnimation } from '@/components/IngredientProgressAnimation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
const Index = () => {
  // Chat conversation component with 4-paragraph typewriter effect
  const navigate = useNavigate();
  const {
    user,
    loading: authLoading,
    signOut
  } = useAuth();
  const [selectedSupermarket, setSelectedSupermarket] = useState<string | null>(null);
  const [supermarketIngredients, setSupermarketIngredients] = useState<any[]>([]);

  // Expanded state for calendar view
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [showMoreMeals, setShowMoreMeals] = useState(false);
  const [dateSelectionError, setDateSelectionError] = useState(false);

  // Remove typewriter effect states - show content immediately

  // Calendar screen typewriter states
  const [calendarTypewriterStep, setCalendarTypewriterStep] = useState(0);
  const [displayedCalendarParagraph2, setDisplayedCalendarParagraph2] = useState('');
  const [showCalendarCursor, setShowCalendarCursor] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  // Loading states
  const [showLoadingDot, setShowLoadingDot] = useState(false);
  const [showSearchingText, setShowSearchingText] = useState(false);
  const [showResultCard, setShowResultCard] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  
  // Progressive chat effect states
  const [showSearchResult, setShowSearchResult] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [visibleIngredientsCount, setVisibleIngredientsCount] = useState(0);
  const [showSource, setShowSource] = useState(false);
  const [showRecipesText, setShowRecipesText] = useState(false);
  
  // Typewriter states for chat messages
  const [displayedSearchResultText, setDisplayedSearchResultText] = useState('');
  const [showSearchResultCursor, setShowSearchResultCursor] = useState(true);
  const [displayedRecipesText, setDisplayedRecipesText] = useState('');
  const [showRecipesCursor, setShowRecipesCursor] = useState(true);
  
  const searchResultText = "He encontrado 824 ingredientes en Mercadona:";
  const recipesText = "Con estos ingredientes puedo generar más de 4.000 recetas. Te mostraré solo las que mejor encajen contigo.";
  
  const paragraph1Text = "Elige tu súper para hacer la compra";

  // Menu desplegable state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const additionalMeals = ['Aperitivo', 'Snack', 'Merienda'];

  // Calendar screen text
  const calendarParagraph2Text = "📅 Primero necesito saber para qué días quieres organizar tu compra.";

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

  // Cargar ingredientes del supermercado seleccionado
  useEffect(() => {
    const fetchIngredients = async () => {
      if (selectedSupermarket) {
        // Capitalizar la primera letra para que coincida con los datos en Supabase
        const supermarketName = selectedSupermarket.charAt(0).toUpperCase() + selectedSupermarket.slice(1);
        
        const { data, error } = await supabase
          .from('supermarket_ingredients')
          .select('*')
          .eq('supermarket', supermarketName);
        
        if (!error && data) {
          setSupermarketIngredients(data);
        }
      }
    };
    
    fetchIngredients();
  }, [selectedSupermarket]);

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
      setShowSearchResult(false);
      setDisplayedSearchResultText('');
      setShowSearchResultCursor(true);
      setShowIngredients(false);
      setVisibleIngredientsCount(0);
      setShowSource(false);
      setShowRecipesText(false);
      setDisplayedRecipesText('');
      setShowRecipesCursor(true);
      setCalendarTypewriterStep(0);
      setDisplayedCalendarParagraph2('');

      // Start sequence
      setTimeout(() => setShowLoadingDot(true), 300);
      setTimeout(() => {
        setShowLoadingDot(false);
        setShowSearchingText(true);
      }, 1500);
      setTimeout(() => {
        setShowSearchingText(false);
        setShowResultCard(true);
        setShowSearchResult(true); // Start typewriter for search result
      }, 7000);
    }
  }, [isExpanded, loadingComplete]);
  
  // Typewriter effect for search result text
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showSearchResult && displayedSearchResultText.length < searchResultText.length) {
      timeout = setTimeout(() => {
        setDisplayedSearchResultText(searchResultText.slice(0, displayedSearchResultText.length + 1));
      }, 30); // 30ms per character for typewriter speed
    } else if (showSearchResult && displayedSearchResultText.length === searchResultText.length) {
      // Hide cursor and show ingredients after text is complete
      setTimeout(() => {
        setShowSearchResultCursor(false);
        setShowIngredients(true);
      }, 200); // Reduced from 500ms to 200ms
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [showSearchResult, displayedSearchResultText, searchResultText]);
  
  // Progressive ingredient appearance
  useEffect(() => {
    if (showIngredients && visibleIngredientsCount < supermarketIngredients.length + 1) {
      const timer = setTimeout(() => {
        setVisibleIngredientsCount(prev => prev + 1);
      }, 100); // 100ms between each ingredient
      return () => clearTimeout(timer);
    } else if (showIngredients && visibleIngredientsCount >= supermarketIngredients.length + 1) {
      // After all ingredients shown, show source
      setTimeout(() => {
        setShowSource(true);
      }, 150); // Reduced from 300ms to 150ms
    }
  }, [showIngredients, visibleIngredientsCount, supermarketIngredients.length]);
  
  // Show recipes text after source
  useEffect(() => {
    if (showSource && !showRecipesText) {
      setTimeout(() => {
        setShowRecipesText(true);
      }, 200); // Reduced from 500ms to 200ms
    }
  }, [showSource, showRecipesText]);
  
  // Typewriter effect for recipes text
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showRecipesText && displayedRecipesText.length < recipesText.length) {
      timeout = setTimeout(() => {
        setDisplayedRecipesText(recipesText.slice(0, displayedRecipesText.length + 1));
      }, 30); // 30ms per character
    } else if (showRecipesText && displayedRecipesText.length === recipesText.length) {
      // Hide cursor and start calendar sequence after text is complete
      setTimeout(() => {
        setShowRecipesCursor(false);
        setLoadingComplete(true);
        setCalendarTypewriterStep(2);
      }, 300); // Reduced from 800ms to 300ms
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [showRecipesText, displayedRecipesText, recipesText]);

  // Remove typewriter effect - content shows immediately

  // Calendar screen typewriter effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isExpanded && calendarTypewriterStep === 2) {
      // Type second paragraph
      if (displayedCalendarParagraph2.length < calendarParagraph2Text.length) {
        timeout = setTimeout(() => {
          setDisplayedCalendarParagraph2(calendarParagraph2Text.slice(0, displayedCalendarParagraph2.length + 1));
        }, 30);
      } else {
        // Hide cursor and show calendar immediately
        setTimeout(() => {
          setShowCalendarCursor(false);
          setShowCalendar(true);
        }, 100); // Reduced from 800ms to 100ms for quicker transition
      }
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isExpanded, calendarTypewriterStep, displayedCalendarParagraph2, calendarParagraph2Text]);
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

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (!dates) {
      setSelectedDates([]);
      setDateSelectionError(false);
      return;
    }
    
    // Verificar si estamos intentando seleccionar más de 7 días
    if (dates.length > 7) {
      setDateSelectionError(true);
      // Mantener solo los primeros 7 días
      return;
    }
    
    setDateSelectionError(false);
    setSelectedDates(dates);
  };

  const removeDateTag = (dateToRemove: Date) => {
    setSelectedDates(selectedDates.filter(date => date.getTime() !== dateToRemove.getTime()));
    setDateSelectionError(false);
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
        backgroundColor: '#FFFFFF',
        borderBottomColor: '#E5E5E5'
      }}>
          <button onClick={handleClose} className="ml-6 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white transition-colors">
            <X className="h-5 w-5 text-[#1C1C1C]" />
          </button>
        </div>

        {/* Chat area - starts below fixed header */}
        <div className="h-screen flex flex-col relative pt-16">
          {/* Calendar Container - Chat style with bottom padding for fixed button */}
          <div className="flex-1 transition-all duration-500 ease-out overflow-hidden" style={{
          backgroundColor: '#FFFFFF'
        }}>
            <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
              {/* User response - supermarket selection (right-aligned) */}
              <div className="px-4 pt-4 mb-6">
                <div className="flex justify-end">
                  <div className="flex items-center gap-2 text-[#1C1C1C] rounded-lg px-3 py-2 text-base max-w-xs" style={{
                  backgroundColor: '#F4F4F4'
                }}>
                    <img src={selectedSupermarket === 'mercadona' ? '/mercadona-logo-updated.webp' : selectedSupermarket === 'carrefour' ? '/carrefour-logo-updated.png' : selectedSupermarket === 'lidl' ? '/lidl-logo-updated.png' : '/alcampo-logo.png'} alt={selectedSupermarket} className="w-6 h-6 object-contain" />
                    <span>
                      {selectedSupermarket === 'mercadona' ? 'Mercadona' : selectedSupermarket === 'carrefour' ? 'Carrefour' : selectedSupermarket === 'lidl' ? 'Lidl' : 'Alcampo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Loading sequence - all elements appear in the same position */}
              <div className="px-4 mb-6">
                <div className="flex justify-start">
                  <div className="max-w-xs min-h-[60px]">
                    {/* Loading dot */}
                    {showLoadingDot && !showSearchingText && !showResultCard && <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#1C1C1C] rounded-full animate-pulse"></div>
                      </div>}
                    
                    {/* Searching text with pulsing effect and search icon - replaces the dot */}
                    {showSearchingText && !showResultCard && <div>
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4 text-[#1C1C1C] animate-pulse" />
                          <span className="text-[#1C1C1C] text-base animate-pulse">
                            Buscando ingredientes en {selectedSupermarket === 'mercadona' ? 'Mercadona' : selectedSupermarket === 'carrefour' ? 'Carrefour' : selectedSupermarket === 'lidl' ? 'Lidl' : 'Alcampo'}
                          </span>
                        </div>
                        
                        {/* Progressive ingredient circles */}
                        <IngredientProgressAnimation 
                          supermarketIngredients={supermarketIngredients} 
                          totalCount={824}
                        />
                      </div>}
                    
                    {/* Result card - replaces everything else and stays fixed */}
                    {showResultCard && <>
                      {showSearchResult && (
                        <div className="flex items-start gap-2">
                          <span className="text-lg">🔍</span>
                          <p className="text-[#1C1C1C] text-base">
                            {displayedSearchResultText.split('824 ingredientes en Mercadona:').length > 1 ? (
                              <>
                                He encontrado <span className="font-semibold">824 ingredientes en Mercadona:</span>
                                {showSearchResultCursor && displayedSearchResultText.length === searchResultText.length && <span className="animate-pulse">|</span>}
                              </>
                            ) : (
                              <>
                                {displayedSearchResultText}
                                {showSearchResultCursor && <span className="animate-pulse">|</span>}
                              </>
                            )}
                          </p>
                        </div>
                      )}
                        
                      {/* Ingredients Cards */}
                      {showIngredients && (
                        <div className="mt-4 w-screen relative -ml-4">
                          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide pl-4">
                            {supermarketIngredients.slice(1).concat(supermarketIngredients.slice(0, 1)).map((ingredient, index) => (
                              index < visibleIngredientsCount && (
                                <div 
                                  key={ingredient.id}
                                  className="flex-shrink-0 w-20 animate-fade-in"
                                  style={{
                                    animationDelay: '0ms',
                                    animationDuration: '200ms'
                                  }}
                                >
                                  <div className="w-full h-20 rounded-lg mb-2 overflow-hidden" style={{ backgroundColor: '#F4F4F4' }}>
                                    {ingredient.image_url ? (
                                      <img 
                                        src={ingredient.image_url} 
                                        alt={ingredient.product_name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-xs font-medium text-gray-500">
                                          {ingredient.product_name.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <h4 className="text-sm text-[#1C1C1C] line-clamp-2 mb-1">
                                    {ingredient.product_name} ({ingredient.quantity} {ingredient.unit_type})
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {ingredient.price.toFixed(2).replace('.', ',')}€
                                  </p>
                                </div>
                              )
                            ))}
                            
                            {/* More products indicator */}
                            {visibleIngredientsCount > supermarketIngredients.length && (
                              <div className="flex-shrink-0 w-20 h-32 flex items-center justify-center animate-fade-in">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F4F4F4' }}>
                                  <span className="text-xs font-medium text-gray-600">
                                    +{Math.max(0, 824 - supermarketIngredients.length)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Source attribution */}
                      {showSource && (
                        <div className="mt-3 flex items-center justify-start gap-2 animate-fade-in">
                          <img src="/mercadona-logo-updated.webp" alt="Mercadona" className="w-5 h-5 object-contain" />
                          <span className="text-sm text-gray-600">Fuente</span>
                        </div>
                      )}
                      
                      {/* Additional text */}
                      {showRecipesText && (
                        <p className="mt-3 text-base text-[#1C1C1C]">
                          {displayedRecipesText.split('4.000 recetas').map((part, index) => {
                            if (index === 0) {
                              return <span key={index}>{part}</span>;
                            } else {
                              return (
                                <span key={index}>
                                  <span className="font-semibold">4.000 recetas</span>
                                  {part}
                                </span>
                              );
                            }
                          })}
                          {showRecipesCursor && <span className="animate-pulse">|</span>}
                        </p>
                      )}
                    </>}
                  </div>
                </div>
              </div>

              {/* Main content - only show after loading is complete */}
              {loadingComplete && <div className="px-4 flex-shrink-0 space-y-4 pb-24">
                  {/* Divider line */}
                  <div className="w-full" style={{ borderTop: '1px solid #E5E5E5', marginBottom: '1.5rem' }} />
                  {/* Calendar paragraph with typewriter effect */}
                  <div className="mb-6">
                    <div className={`transition-all duration-500 ${calendarTypewriterStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <div className="flex items-start gap-2">
                        <span className="text-lg">📅</span>
                        <p className="text-base leading-relaxed text-left text-[#1C1C1C]">
                          {calendarTypewriterStep >= 2 && <span>
                              {displayedCalendarParagraph2.length < calendarParagraph2Text.length ? (
                                <>
                                  {displayedCalendarParagraph2.replace('📅 ', '')}
                                  {calendarTypewriterStep === 2 && showCalendarCursor && <span className="animate-pulse">|</span>}
                                </>
                              ) : (
                                <>
                                  Primero necesito saber <span className="font-semibold">para qué días</span> quieres organizar tu compra. Selecciona:
                                </>
                              )}
                            </span>}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`flex justify-center flex-shrink-0 ${showCalendar ? 'opacity-100' : 'opacity-0'}`}>
                    <Calendar selected={selectedDates} onSelect={handleDateSelect} className="pointer-events-auto w-full" />
                  </div>
                </div>}
            </div>
          </div>

          {/* Error Message Area - Outside footer */}
          {dateSelectionError && (
            <div className="absolute bottom-16 left-0 right-0 px-4" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="py-3 text-center">
                <p className="text-sm text-red-500">
                  Máximo puedes seleccionar 7 días<br />para organizar tu compra
                </p>
              </div>
            </div>
          )}

          {/* Fixed Button Area at Bottom of Screen */}
          <div className="absolute bottom-0 left-0 right-0" style={{
          backgroundColor: '#FFFFFF'
        }}>
            <div className="px-4 py-4 flex items-center gap-2">
              {selectedDates.length > 0 && (
                <div className="flex-1 flex items-center gap-2 px-4 h-10 rounded-full overflow-x-auto" style={{ backgroundColor: '#F2F2F2' }}>
                  {[...selectedDates].reverse().map((date, index) => {
                    const formatted = format(date, 'EEE d', { locale: es });
                    const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);
                    return (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" 
                        style={{ 
                          backgroundColor: '#D9DADC', 
                          color: '#020818',
                          borderRadius: '8px'
                        }}
                      >
                        {capitalized}
                      </Badge>
                    );
                  })}
                </div>
              )}
              <Button variant="ghost" onClick={handleCalendarContinue} disabled={!canContinue} className="w-10 h-10 rounded-full flex items-center justify-center border-0 p-0 flex-shrink-0 ml-auto" style={{
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
      <div className="flex items-center justify-between px-6 pt-3 pb-6">
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
          <h1 className="text-2xl font-bold text-[#1C1C1C]">Grochat</h1>
        </div>
        
        <div className="h-24 flex items-center gap-3">
          {!user ? (
            <>
              <Button variant="ghost" onClick={handleLogin} className="text-sm font-medium text-[#1C1C1C] bg-[#F4F4F4] hover:bg-gray-100 px-3 py-0.5 border-none">
                Iniciar sesión
              </Button>
              <Button onClick={handleGetStarted} className="text-sm font-medium bg-[#1C1C1C] text-white hover:bg-gray-800 px-3 py-0.5 rounded-lg">
                Empezar
              </Button>
            </>
          ) : null}
        </div>
      </div>
      
      {/* Main Content - Landing Page */}
      <div className="flex-1 flex flex-col justify-start px-4 pt-8">
        <div className="w-full max-w-md mx-auto mt-2">
          <h1 className="text-3xl font-semibold text-[#1C1C1C] mb-2 text-center">
            Genera listas de compra
          </h1>
          <p className="text-lg mb-4 text-center leading-snug" style={{ color: '#5E6168' }}>
            Crea recetas con los ingredientes<br />
            de tu supermercado usando IA
          </p>
          {/* Chat-style Call to Action */}
          <div className="shadow-lg pt-6 px-6 pb-6 border w-full mt-8" style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#D6D6D6',
          borderRadius: '30px'
        }}>
            <div className="mb-3">
              <p className="text-base leading-relaxed text-left text-[#1C1C1C]">
                {paragraph1Text}
              </p>
            </div>
            
            {/* Horizontal supermarket layout */}
            <div className="flex justify-between items-center gap-3 mb-1">
              <button onClick={() => handleSupermarketSelect('mercadona')} className="flex-1 flex flex-col items-center gap-2 transition-all duration-300">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 ${selectedSupermarket === 'mercadona' ? 'bg-[#D9DADC] border border-[#020818]' : 'bg-[#F4F4F4]'}`}>
                  <img src="/mercadona-logo-updated.webp" alt="Mercadona" className="w-14 h-14 object-contain" />
                </div>
                <span className={`text-xs font-semibold transition-all duration-300 text-center ${selectedSupermarket === 'mercadona' ? 'text-gray-800' : 'text-[#1C1C1C]'}`}>
                  Mercadona
                </span>
              </button>
              
              <button onClick={() => handleSupermarketSelect('carrefour')} className="flex-1 flex flex-col items-center gap-2 transition-all duration-300">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 ${selectedSupermarket === 'carrefour' ? 'bg-[#D9DADC] border border-[#020818]' : 'bg-[#F4F4F4]'}`}>
                  <img src="/carrefour-logo-updated.png" alt="Carrefour" className="w-12 h-12 object-contain" />
                </div>
                <span className={`text-xs font-semibold transition-all duration-300 text-center ${selectedSupermarket === 'carrefour' ? 'text-gray-800' : 'text-[#1C1C1C]'}`}>
                  Carrefour
                </span>
              </button>
              
              <button onClick={() => handleSupermarketSelect('lidl')} className="flex-1 flex flex-col items-center gap-2 transition-all duration-300">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 ${selectedSupermarket === 'lidl' ? 'bg-[#D9DADC] border border-[#020818]' : 'bg-[#F4F4F4]'}`}>
                  <img src="/lidl-logo-updated.png" alt="Lidl" className="w-12 h-12 object-contain rounded-md" />
                </div>
                <span className={`text-xs font-semibold transition-all duration-300 text-center ${selectedSupermarket === 'lidl' ? 'text-gray-800' : 'text-[#1C1C1C]'}`}>
                  Lidl
                </span>
              </button>
              
              <button onClick={() => handleSupermarketSelect('alcampo')} className="flex-1 flex flex-col items-center gap-2 transition-all duration-300">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 ${selectedSupermarket === 'alcampo' ? 'bg-[#D9DADC] border border-[#020818]' : 'bg-[#F4F4F4]'}`}>
                  <img src="/alcampo-logo.png" alt="Alcampo" className="w-10 h-10 object-contain" />
                </div>
                <span className={`text-xs font-semibold transition-all duration-300 text-center ${selectedSupermarket === 'alcampo' ? 'text-gray-800' : 'text-[#1C1C1C]'}`}>
                  Alcampo
                </span>
              </button>
            </div>
            
            <div className="flex items-center gap-2 mt-4 -mb-2">
              {selectedSupermarket && (
                <div className="flex-1 flex items-center gap-2 px-4 h-10 rounded-full" style={{ backgroundColor: '#F2F2F2' }}>
                  <Badge variant="secondary" className="font-normal hover:bg-[#D9DADC] py-1" style={{ 
                    backgroundColor: '#D9DADC', 
                    color: '#020818',
                    borderRadius: '8px'
                  }}>
                    {selectedSupermarket === 'mercadona' ? 'Mercadona' : selectedSupermarket === 'carrefour' ? 'Carrefour' : selectedSupermarket === 'lidl' ? 'Lidl' : 'Alcampo'}
                  </Badge>
                </div>
              )}
              <Button variant="ghost" onClick={handleSubmit} disabled={!selectedSupermarket} className="w-10 h-10 rounded-full flex items-center justify-center border-0 p-0 flex-shrink-0 ml-auto" style={{
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