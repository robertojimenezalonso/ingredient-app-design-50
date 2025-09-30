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

type ServingSelection = {
  date: Date;
  mealType: string;
  servings: number | null;
};

export const CustomizeServingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const confirmedDates = location.state?.confirmedDates || [];
  const selectedSupermarket = location.state?.selectedSupermarket || null;
  const mealSelections = location.state?.mealSelections || [];
  const shouldSkipAnimations = location.state?.shouldRestoreSelection || false;

  const fullText = "Perfecto. Ahora selecciona cuántas personas por cada comida:";

  // Initialize servings selections
  const [servingSelections, setServingSelections] = useState<ServingSelection[]>(() => {
    return mealSelections.map((selection: MealSelection) => ({
      date: new Date(selection.date),
      mealType: selection.mealType,
      servings: 0
    }));
  });

  // Group selections by date
  const groupedByDate = servingSelections.reduce((acc: any, selection, index) => {
    const dateKey = selection.date.getTime();
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: selection.date,
        meals: []
      };
    }
    acc[dateKey].meals.push({
      ...selection,
      originalIndex: index
    });
    return acc;
  }, {});

  const groupedSelections = Object.values(groupedByDate);

  // Animation states
  const [showIcon, setShowIcon] = useState(shouldSkipAnimations);
  const [displayedText, setDisplayedText] = useState(shouldSkipAnimations ? fullText : '');
  const [showCursor, setShowCursor] = useState(!shouldSkipAnimations);
  const [showContent, setShowContent] = useState(shouldSkipAnimations);
  const [visibleItemIndex, setVisibleItemIndex] = useState(shouldSkipAnimations ? groupedSelections.length - 1 : -1);
  const [visibleNumbersCount, setVisibleNumbersCount] = useState(shouldSkipAnimations ? servingSelections.length * 10 : 0);

  const totalNumbers = servingSelections.length * 10;

  // Start animation sequence
  useEffect(() => {
    if (shouldSkipAnimations) return;
    
    setTimeout(() => setShowIcon(true), 300);
    
    setTimeout(() => {
      if (displayedText.length === 0) {
        setDisplayedText(fullText[0]);
      }
    }, 500);
  }, [shouldSkipAnimations]);

  // Typewriter effect
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
        setShowContent(true);
      }, 200);
    }
  }, [showIcon, displayedText, fullText, showCursor, shouldSkipAnimations]);

  // Progressive item appearance
  useEffect(() => {
    if (shouldSkipAnimations) return;
    
    if (showContent && visibleItemIndex < groupedSelections.length - 1) {
      const timeout = setTimeout(() => {
        setVisibleItemIndex(prev => prev + 1);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [showContent, visibleItemIndex, groupedSelections.length, shouldSkipAnimations]);

  // Progressive numbers appearance
  useEffect(() => {
    if (shouldSkipAnimations) return;
    
    if (showContent && visibleNumbersCount < totalNumbers) {
      const timeout = setTimeout(() => {
        setVisibleNumbersCount(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [showContent, visibleNumbersCount, totalNumbers, shouldSkipAnimations]);

  const handleBack = () => {
    navigate('/recipe-preferences', { 
      state: { 
        confirmedDates,
        selectedSupermarket,
        mealSelections,
        shouldRestoreSelection: true 
      } 
    });
  };

  const handleServingSelection = (index: number, servings: number) => {
    setServingSelections(prev => {
      const newSelections = [...prev];
      newSelections[index] = {
        ...newSelections[index],
        servings: Math.max(0, servings)
      };
      return newSelections;
    });
  };

  const formatFullDate = (date: Date) => {
    const dayName = format(date, 'EEE', { locale: es });
    const dayNumber = format(date, 'd', { locale: es });
    const month = format(date, 'MMM', { locale: es });
    
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    
    return `${capitalizedDay} ${dayNumber} - ${capitalizedMonth}`;
  };

  const formatShortDate = (date: Date) => {
    const formatted = format(date, 'EEE d', { locale: es });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Check if at least one selection has at least one serving
  const canContinue = servingSelections.some(selection => (selection.servings || 0) > 0);

  const handleContinue = () => {
    if (canContinue) {
      console.log('Continuing with custom servings:', servingSelections);
      // TODO: navigate to next page
    }
  };

  // Get selected servings for the bottom bar (only those with servings > 0)
  const getSelectedServings = () => {
    return servingSelections.filter(selection => (selection.servings || 0) > 0).reverse();
  };

  const selectedServings = getSelectedServings();

  const getNumberIndex = (groupIndex: number, mealIndex: number, numIndex: number) => {
    let totalBefore = 0;
    for (let i = 0; i < groupIndex; i++) {
      totalBefore += (groupedSelections[i] as any).meals.length * 10;
    }
    return totalBefore + (mealIndex * 10) + numIndex;
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
        <div className="flex-1 transition-all duration-500 ease-out overflow-hidden pb-20" style={{
          backgroundColor: '#FFFFFF'
        }}>
          <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
            {/* User response - "Customizar por receta" (right-aligned) */}
            <div className="px-4 pt-4 mb-6">
              <div className="flex justify-end">
                <div 
                  className="text-[#1C1C1C] rounded-lg px-3 py-2 text-sm max-w-xs" 
                  style={{ backgroundColor: '#F4F4F4' }}
                >
                  Customizar por receta
                </div>
              </div>
            </div>

            {/* Bot question - customize servings */}
            <div className="px-4 mb-6">
              <div className="flex justify-start">
                <div className="max-w-full w-full">
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

                  {/* Meal selections with serving options */}
                  {showContent && (
                    <div className="space-y-6">
                      {groupedSelections.map((group: any, groupIndex: number) => {
                        const isVisible = groupIndex <= visibleItemIndex;
                        
                        return (
                          <div 
                            key={groupIndex} 
                            className={`space-y-4 transition-all ${
                              isVisible ? 'opacity-100' : 'opacity-0'
                            }`}
                          >
                            {/* Date label - appears once per day */}
                            {isVisible && (
                              <p className="text-sm font-medium text-[#1C1C1C] animate-fade-in">
                                {formatFullDate(group.date)}
                              </p>
                            )}
                            
                            {/* Meal types for this date */}
                            {isVisible && group.meals.map((meal: any, mealIndex: number) => (
                              <div 
                                key={mealIndex} 
                                className="flex items-center justify-between px-4 py-2 rounded-lg"
                                style={{
                                  backgroundColor: '#F4F4F4'
                                }}
                              >
                                <p className="text-base text-[#1C1C1C]">
                                  {meal.mealType}
                                </p>
                                
                                {/* Counter with +/- buttons */}
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => {
                                      const currentServings = meal.servings || 0;
                                      if (currentServings > 0) {
                                        handleServingSelection(meal.originalIndex, currentServings - 1);
                                      }
                                    }}
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                    style={{
                                      backgroundColor: (meal.servings || 0) === 0 ? 'transparent' : '#D6D6D6',
                                      border: (meal.servings || 0) === 0 ? '1px solid #D6D6D6' : 'none',
                                      color: '#1C1C1C'
                                    }}
                                  >
                                    <span className="flex items-center justify-center">−</span>
                                  
                                  </button>
                                  
                                  <span className="text-base font-medium text-[#1C1C1C] min-w-[24px] text-center">
                                    {meal.servings || 0}
                                  </span>
                                  
                                  <button
                                    onClick={() => {
                                      const currentServings = meal.servings || 0;
                                      handleServingSelection(meal.originalIndex, currentServings + 1);
                                    }}
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                    style={{
                                      backgroundColor: '#D6D6D6',
                                      color: '#1C1C1C'
                                    }}
                                  >
                                    <span className="flex items-center justify-center">+</span>
                                  
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
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
            {selectedServings.length > 0 && (
              <div className="flex-1 flex items-center gap-2 px-4 h-10 rounded-full overflow-x-auto scrollbar-hide" style={{ 
                backgroundColor: '#F2F2F2',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}>
                {selectedServings.map((tag, index) => (
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
                    {tag.mealType} {formatShortDate(tag.date)} - {tag.servings} {tag.servings === 1 ? 'persona' : 'personas'}
                  </Badge>
                ))}
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
