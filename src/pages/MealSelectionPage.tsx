import { useState } from 'react';
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
  
  const [mealSelections, setMealSelections] = useState<MealSelection[]>(
    confirmedDates.map((date: Date) => ({ date, mealTypes: [] }))
  );

  const mealTypes = ['Desayuno', 'Comida', 'Cena', 'Postre', 'Snack'];

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
      const newSelections = [...prev];
      const currentMeals = newSelections[dateIndex].mealTypes;
      
      if (currentMeals.includes(mealType)) {
        newSelections[dateIndex].mealTypes = currentMeals.filter(m => m !== mealType);
      } else {
        newSelections[dateIndex].mealTypes = [...currentMeals, mealType];
      }
      
      return newSelections;
    });
  };

  const getSelectedMealTags = () => {
    const tags: { date: Date; mealType: string }[] = [];
    mealSelections.forEach(selection => {
      selection.mealTypes.forEach(mealType => {
        tags.push({ date: selection.date, mealType });
      });
    });
    return tags;
  };

  const selectedTags = getSelectedMealTags();
  const canContinue = selectedTags.length > 0;

  const handleContinue = () => {
    if (canContinue) {
      // Aquí continuaremos con el siguiente paso
      console.log('Meal selections:', mealSelections);
    }
  };

  const formatFullDate = (date: Date) => {
    const dayName = format(date, 'EEEE', { locale: es });
    const dayNumber = format(date, 'd', { locale: es });
    const month = format(date, 'MMM', { locale: es }); // Abreviación del mes
    
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dayNumber} de ${month}`;
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
                    <span className="text-lg">🍛</span>
                    <p className="text-base leading-relaxed text-left text-[#1C1C1C]">
                      Ahora necesito saber <span className="font-semibold">qué tipo de comidas</span> quieres elegir para esos días. Selecciona:
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Date and meal type selection */}
            <div className="px-4 space-y-6 mb-6">
              {mealSelections.map((selection, dateIndex) => (
                <div key={dateIndex} className="space-y-3">
                  {/* Date label */}
                  <p className="text-sm font-medium text-[#1C1C1C]">
                    {formatFullDate(selection.date)}
                  </p>
                  
                  {/* Meal type tags */}
                  <div className="flex flex-wrap gap-2">
                    {mealTypes.map((mealType) => {
                      const isSelected = selection.mealTypes.includes(mealType);
                      return (
                        <button
                          key={mealType}
                          onClick={() => toggleMealType(dateIndex, mealType)}
                          className="px-3 py-1.5 rounded-lg text-sm font-normal transition-all"
                          style={{
                            backgroundColor: isSelected ? '#D9DADC' : '#F4F4F4',
                            color: '#020818',
                            border: isSelected ? '1px solid #020818' : '1px solid transparent'
                          }}
                        >
                          {mealType}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Button Area at Bottom of Screen */}
        <div className="absolute bottom-0 left-0 right-0" style={{
          backgroundColor: '#FFFFFF'
        }}>
          <div className="px-4 pt-6 pb-8 flex items-center gap-2" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
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
                      {capitalized} - {tag.mealType}
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