import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowUp, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type MealSelection = {
  date: Date;
  mealTypes: string[];
};

export const MealSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const confirmedDates = location.state?.confirmedDates || [];
  const selectedSupermarket = location.state?.selectedSupermarket || null;
  const savedMealSelections = location.state?.mealSelections || null;
  const shouldRestore = location.state?.shouldRestoreSelection || false;
  
  const [mealSelections, setMealSelections] = useState<MealSelection[]>(() => {
    // Si estamos volviendo desde la siguiente página, restaurar las selecciones
    if (shouldRestore && savedMealSelections) {
      const restored = confirmedDates.map((date: Date) => ({ date, mealTypes: [] as string[] }));
      savedMealSelections.forEach((selection: any) => {
        const dateIndex = restored.findIndex((r: MealSelection) => 
          r.date.getTime() === new Date(selection.date).getTime()
        );
        if (dateIndex !== -1) {
          restored[dateIndex].mealTypes.push(selection.mealType);
        }
      });
      return restored;
    }
    return confirmedDates.map((date: Date) => ({ date, mealTypes: [] }));
  });

  const mealTypes = ['Desayuno', 'Comida', 'Cena', 'Postre', 'Snack'];
  
  const fullText = "Ahora necesito saber qué tipo de comidas quieres elegir para esos días. Selecciona:";
  const totalMealTags = mealSelections.length * mealTypes.length;
  
  // Animation states
  const [showIcon, setShowIcon] = useState(shouldRestore);
  const [displayedText, setDisplayedText] = useState(shouldRestore ? fullText : '');
  const [showCursor, setShowCursor] = useState(!shouldRestore);
  const [showDates, setShowDates] = useState(shouldRestore);
  const [visibleDateIndex, setVisibleDateIndex] = useState(shouldRestore ? mealSelections.length - 1 : -1);
  const [visibleMealTagsCount, setVisibleMealTagsCount] = useState(shouldRestore ? totalMealTags : 0);

  // Start animation sequence
  useEffect(() => {
    if (shouldRestore) return;
    
    // Show icon first
    setTimeout(() => setShowIcon(true), 300);
    
    // Start typewriter after icon
    setTimeout(() => {
      if (displayedText.length === 0) {
        setDisplayedText(fullText[0]);
      }
    }, 500);
  }, [shouldRestore]);

  // Typewriter effect
  useEffect(() => {
    if (shouldRestore) return;
    
    if (showIcon && displayedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    } else if (displayedText.length === fullText.length && showCursor) {
      setTimeout(() => {
        setShowCursor(false);
        setShowDates(true);
      }, 200);
    }
  }, [showIcon, displayedText, fullText, showCursor, shouldRestore]);

  // Progressive date appearance
  useEffect(() => {
    if (shouldRestore) return;
    
    if (showDates && visibleDateIndex < mealSelections.length - 1) {
      const timeout = setTimeout(() => {
        setVisibleDateIndex(prev => prev + 1);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [showDates, visibleDateIndex, mealSelections.length, shouldRestore]);

  // Progressive meal tags appearance - starts after date is visible
  useEffect(() => {
    if (shouldRestore) return;
    
    if (showDates && visibleMealTagsCount < totalMealTags) {
      const timeout = setTimeout(() => {
        setVisibleMealTagsCount(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [showDates, visibleMealTagsCount, totalMealTags, shouldRestore]);

  const getMealTagIndex = (dateIndex: number, mealIndex: number) => {
    return dateIndex * mealTypes.length + mealIndex;
  };

  const handleBack = () => {
    navigate('/?step=calendar&completed=true', { 
      state: { 
        confirmedDates,
        selectedSupermarket,
        shouldRestoreSelection: true 
      } 
    });
  };

  const toggleMealType = (dateIndex: number, mealType: string) => {
    setMealSelections(prev => {
      const newSelections = prev.map((selection, index) => {
        if (index === dateIndex) {
          const currentMeals = selection.mealTypes;
          
          if (currentMeals.includes(mealType)) {
            // Deseleccionar
            return {
              ...selection,
              mealTypes: currentMeals.filter(m => m !== mealType)
            };
          } else {
            // Seleccionar
            return {
              ...selection,
              mealTypes: [...currentMeals, mealType]
            };
          }
        }
        return selection;
      });
      
      return newSelections;
    });
  };

  const getSelectedMealTags = () => {
    const tags: { date: Date; mealType: string; dateIndex: number; mealIndex: number }[] = [];
    mealSelections.forEach((selection, dateIndex) => {
      selection.mealTypes.forEach((mealType, mealIndex) => {
        tags.push({ date: selection.date, mealType, dateIndex, mealIndex });
      });
    });
    // Invertir el orden para que los últimos seleccionados aparezcan primero
    return tags.reverse();
  };

  const selectedTags = getSelectedMealTags();
  const canContinue = mealSelections.every(selection => selection.mealTypes.length > 0);

  const handleContinue = () => {
    if (canContinue) {
      // Preparar las selecciones para la siguiente página
      const flattenedSelections: { date: Date; mealType: string }[] = [];
      mealSelections.forEach(selection => {
        selection.mealTypes.forEach(mealType => {
          flattenedSelections.push({ date: selection.date, mealType });
        });
      });

      // Navegar a la siguiente página con todas las selecciones
      navigate('/recipe-preferences', {
        state: { 
          confirmedDates,
          selectedSupermarket,
          mealSelections: flattenedSelections,
          shouldRestoreSelection: false
        }
      });
    }
  };

  const formatFullDate = (date: Date) => {
    const dayName = format(date, 'EEE', { locale: es }); // Abreviación del día
    const dayNumber = format(date, 'd', { locale: es });
    const month = format(date, 'MMM', { locale: es }); // Abreviación del mes
    
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    
    return `${capitalizedDay} ${dayNumber} - ${capitalizedMonth}`;
  };

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
        <div className="flex-1 transition-all duration-500 ease-out overflow-hidden" style={{
          backgroundColor: '#FFFFFF'
        }}>
          <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-28">
            {/* User response - selected dates (right-aligned) */}
            <div className="px-4 pt-4 mb-6">
              <div className="flex justify-end">
                <div className="flex flex-wrap gap-2 items-center text-[#1C1C1C] rounded-lg px-3 py-2 text-base max-w-xs" style={{
                  backgroundColor: '#F4F4F4'
                }}>
                  {confirmedDates.sort((a: Date, b: Date) => a.getTime() - b.getTime()).map((date: Date, index: number) => {
                    const formatted = format(date, 'EEE d', { locale: es });
                    const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);
                    return (
                      <span key={index}>
                        {capitalized}
                        {index < confirmedDates.length - 1 && ', '}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bot message - meal type selection */}
            <div className="px-4 mb-6">
              <div className="flex justify-start">
                <div className="max-w-xs">
                  <div className="flex items-start gap-2">
                    {showIcon && (
                      <span className="text-lg animate-fade-in">🍛</span>
                    )}
                    {showIcon && (
                      <p className="text-base leading-relaxed text-left text-[#1C1C1C]">
                        {displayedText.split('qué tipo de comidas').map((part, index) => {
                          if (index === 0) {
                            return <span key={index}>{part}</span>;
                          } else {
                            return (
                              <span key={index}>
                                <span className="font-semibold">qué tipo de comidas</span>
                                {part}
                              </span>
                            );
                          }
                        })}
                        {showCursor && <span className="animate-pulse">|</span>}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Date and meal type selection */}
            {showDates && (
              <div className="px-4 space-y-6 mb-6">
                {mealSelections.map((selection, dateIndex) => (
                  <div 
                    key={dateIndex} 
                    className="space-y-3"
                  >
                    {/* Date label - appears from left to right */}
                    {dateIndex <= visibleDateIndex && (
                      <p className="text-sm font-medium text-[#1C1C1C] animate-fade-in" style={{
                        animation: 'fade-in 0.3s ease-out'
                      }}>
                        {formatFullDate(selection.date)}
                      </p>
                    )}
                    
                    {/* Meal type tags - appear one by one */}
                    {dateIndex <= visibleDateIndex && (
                      <div className="flex flex-wrap gap-2 pointer-events-auto">
                        {mealTypes.map((mealType, mealIndex) => {
                          const isSelected = selection.mealTypes.includes(mealType);
                          const tagIndex = getMealTagIndex(dateIndex, mealIndex);
                          const isVisible = tagIndex < visibleMealTagsCount;
                          
                          return (
                            <button
                              key={mealType}
                              onClick={() => toggleMealType(dateIndex, mealType)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-normal transition-all pointer-events-auto cursor-pointer ${
                                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                              }`}
                              style={{
                                backgroundColor: isSelected ? '#D9DADC' : '#F4F4F4',
                                color: '#020818',
                                border: isSelected ? '1px solid #020818' : '1px solid transparent',
                                transition: 'all 0.2s ease-out'
                              }}
                            >
                              {mealType}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Button Area at Bottom of Screen */}
        <div className="absolute bottom-0 left-0 right-0 z-[100]" style={{
          backgroundColor: '#FFFFFF'
        }}>
          <div className="px-4 pt-4 pb-8 flex items-center gap-2" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
            {selectedTags.length > 0 && (
              <div className="flex-1 flex items-center gap-2 px-4 h-10 rounded-full overflow-x-auto scrollbar-hide" style={{ 
                backgroundColor: '#F2F2F2',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}>
                {selectedTags.map((tag, index) => {
                  const formatted = format(tag.date, 'EEE d', { locale: es });
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
                      {tag.mealType} - {capitalized}
                    </Badge>
                  );
                })}
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