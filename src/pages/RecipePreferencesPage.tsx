import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type MealSelection = {
  date: Date;
  mealType: string;
};

export const RecipePreferencesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const confirmedDates = location.state?.confirmedDates || [];
  const selectedSupermarket = location.state?.selectedSupermarket || null;
  const mealSelections = location.state?.mealSelections || [];
  const shouldSkipAnimations = location.state?.shouldRestoreSelection || false;
  
  const fullText = "Vale, dime el número de personas por receta. Selecciona:";
  const secondFullText = "O también puedes:";
  const totalNumbers = 10;
  
  const [selectedServings, setSelectedServings] = useState<number | 'custom' | null>(null);
  
  // Animation states
  const [showIcon, setShowIcon] = useState(shouldSkipAnimations);
  const [displayedText, setDisplayedText] = useState(shouldSkipAnimations ? fullText : '');
  const [showCursor, setShowCursor] = useState(!shouldSkipAnimations);
  const [showNumbers, setShowNumbers] = useState(shouldSkipAnimations);
  const [visibleNumbersCount, setVisibleNumbersCount] = useState(shouldSkipAnimations ? totalNumbers : 0);
  const [showSecondText, setShowSecondText] = useState(shouldSkipAnimations);
  const [displayedSecondText, setDisplayedSecondText] = useState(shouldSkipAnimations ? secondFullText : '');
  const [showCustomButton, setShowCustomButton] = useState(shouldSkipAnimations);

  const handleContinue = () => {
    if (selectedServings !== null) {
      if (selectedServings === 'custom') {
        // Navegar a la pantalla de customización
        navigate('/customize-servings', {
          state: { 
            confirmedDates,
            selectedSupermarket,
            mealSelections
          }
        });
      } else {
        // Aquí navegaremos a la siguiente pantalla con los datos
        console.log('Continuing with servings:', selectedServings);
        // TODO: navigate to next page
      }
    }
  };

  const canContinue = selectedServings !== null;

  const handleBack = () => {
    navigate('/meal-selection', { 
      state: { 
        confirmedDates,
        selectedSupermarket,
        mealSelections,
        shouldRestoreSelection: true 
      } 
    });
  };

  // Agrupar selecciones por fecha
  const groupedSelections = mealSelections.reduce((acc: any, selection: MealSelection) => {
    const dateKey = selection.date.getTime();
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: selection.date,
        mealTypes: []
      };
    }
    acc[dateKey].mealTypes.push(selection.mealType);
    return acc;
  }, {});

  const formatShortDate = (date: Date) => {
    const formatted = format(date, 'EEE d', { locale: es });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Start animation sequence
  useEffect(() => {
    if (shouldSkipAnimations) return;
    
    // Show icon first
    setTimeout(() => setShowIcon(true), 300);
    
    // Start typewriter after icon
    setTimeout(() => {
      if (displayedText.length === 0) {
        setDisplayedText(fullText[0]);
      }
    }, 500);
  }, [shouldSkipAnimations]);

  // Typewriter effect for first text
  useEffect(() => {
    if (shouldSkipAnimations) return;
    
    if (showIcon && displayedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    } else if (displayedText.length === fullText.length && showCursor) {
      setTimeout(() => {
        setShowCursor(false);
        setShowNumbers(true);
      }, 200);
    }
  }, [showIcon, displayedText, fullText, showCursor, shouldSkipAnimations]);

  // Progressive numbers appearance
  useEffect(() => {
    if (shouldSkipAnimations) return;
    
    if (showNumbers && visibleNumbersCount < totalNumbers) {
      const timeout = setTimeout(() => {
        setVisibleNumbersCount(prev => prev + 1);
      }, 80);
      return () => clearTimeout(timeout);
    } else if (visibleNumbersCount === totalNumbers && !showSecondText) {
      setTimeout(() => {
        setShowSecondText(true);
        setDisplayedSecondText(secondFullText[0]);
      }, 300);
    }
  }, [showNumbers, visibleNumbersCount, totalNumbers, showSecondText, shouldSkipAnimations]);

  // Typewriter effect for second text
  useEffect(() => {
    if (shouldSkipAnimations) return;
    
    if (showSecondText && displayedSecondText.length < secondFullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedSecondText(secondFullText.slice(0, displayedSecondText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    } else if (displayedSecondText.length === secondFullText.length && !showCustomButton) {
      setTimeout(() => {
        setShowCustomButton(true);
      }, 100);
    }
  }, [showSecondText, displayedSecondText, secondFullText, showCustomButton, shouldSkipAnimations]);

  return (
    <div className="min-h-screen flex flex-col relative" style={{
      backgroundColor: '#FCFBF8'
    }}>
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-20 h-16 flex items-center border-b" style={{
        backgroundColor: '#FFFFFF',
        borderBottomColor: '#E5E5E5'
      }}>
        <button 
          onClick={handleBack} 
          className="ml-6 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-[#1C1C1C]" />
        </button>
      </div>

      {/* Chat area - starts below fixed header */}
      <div className="h-screen flex flex-col relative pt-16">
        <div className="flex-1 transition-all duration-500 ease-out overflow-hidden pb-20" style={{
          backgroundColor: '#FFFFFF'
        }}>
          <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
            {/* User response - meal selections (right-aligned) */}
            <div className="px-4 pt-4 mb-6">
              <div className="flex justify-end">
                <div 
                  className="text-[#1C1C1C] rounded-lg px-3 py-2 text-sm max-w-xs" 
                  style={{ backgroundColor: '#F4F4F4' }}
                >
                  {Object.values(groupedSelections).map((group: any, index: number) => (
                    <span key={index}>
                      <span className="font-bold">{formatShortDate(group.date)}</span>
                      {' '}
                      {group.mealTypes.join(', ')}
                      {index < Object.values(groupedSelections).length - 1 && ' - '}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bot question - servings selection */}
            <div className="px-4 mb-6">
              <div className="flex justify-start">
                <div className="max-w-xs">
                  <div className="flex items-start gap-2 mb-4">
                    {showIcon && (
                      <span className="text-lg animate-fade-in">👤</span>
                    )}
                    {showIcon && (
                      <p className="text-base text-[#1C1C1C]">
                        {displayedText}
                        {showCursor && <span className="animate-pulse">|</span>}
                      </p>
                    )}
                  </div>
                  {showNumbers && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((num, index) => {
                          const isVisible = index < visibleNumbersCount;
                          return (
                            <button
                              key={num}
                              onClick={() => setSelectedServings(selectedServings === num ? null : num)}
                              className={`px-4 py-2 rounded-full text-sm transition-all ${
                                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                              }`}
                              style={{
                                backgroundColor: selectedServings === num ? '#D9DADC' : '#F4F4F4',
                                color: '#020818',
                                border: selectedServings === num ? '1px solid #020818' : '1px solid transparent',
                                transition: 'all 0.2s ease-out'
                              }}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-2">
                        {[6, 7, 8, 9, 10].map((num, index) => {
                          const isVisible = index + 5 < visibleNumbersCount;
                          return (
                            <button
                              key={num}
                              onClick={() => setSelectedServings(selectedServings === num ? null : num)}
                              className={`px-4 py-2 rounded-full text-sm transition-all ${
                                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                              }`}
                              style={{
                                backgroundColor: selectedServings === num ? '#D9DADC' : '#F4F4F4',
                                color: '#020818',
                                border: selectedServings === num ? '1px solid #020818' : '1px solid transparent',
                                transition: 'all 0.2s ease-out'
                              }}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {showSecondText && (
                    <div className="mt-6">
                      <p className="text-base text-[#1C1C1C] mb-3">
                        {displayedSecondText}
                      </p>
                      {showCustomButton && (
                        <button
                          onClick={() => setSelectedServings(selectedServings === 'custom' ? null : 'custom')}
                          className="px-4 py-2 rounded-lg text-sm transition-all animate-fade-in"
                          style={{
                            backgroundColor: selectedServings === 'custom' ? '#D9DADC' : '#F4F4F4',
                            color: '#020818',
                            border: selectedServings === 'custom' ? '1px solid #020818' : '1px solid transparent',
                            transition: 'all 0.2s ease-out'
                          }}
                        >
                          Customizar por receta
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Button Area at Bottom of Screen */}
        <div className="absolute bottom-0 left-0 right-0" style={{
          backgroundColor: '#FFFFFF'
        }}>
          <div className="px-4 pt-4 pb-8 flex items-center gap-2" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
            {selectedServings !== null && (
              <div className="flex-1 flex items-center gap-2 px-4 h-10 rounded-full overflow-x-auto scrollbar-hide" style={{ 
                backgroundColor: '#F2F2F2',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}>
                <Badge 
                  variant="secondary" 
                  className="font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" 
                  style={{ 
                    backgroundColor: '#D9DADC', 
                    color: '#020818',
                    borderRadius: '8px'
                  }}
                >
                  {selectedServings === 'custom' ? 'Customizar por receta' : `${selectedServings} raciones`}
                </Badge>
              </div>
            )}
            <Button 
              variant="ghost" 
              onClick={handleContinue} 
              disabled={!canContinue} 
              className="w-10 h-10 rounded-full flex items-center justify-center border-0 p-0 flex-shrink-0 ml-auto" 
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
};