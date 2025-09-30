import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const MealSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const confirmedDates = location.state?.confirmedDates || [];

  const handleBack = () => {
    navigate('/?step=calendar&completed=true', { 
      state: { 
        confirmedDates,
        shouldRestoreSelection: true 
      } 
    });
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
          <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
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

            {/* Future content will go here */}
          </div>
        </div>
      </div>
    </div>
  );
};