import { useState, useEffect, useRef } from 'react';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface HorizontalCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  className?: string;
}

export const HorizontalCalendar = ({
  selectedDate,
  onDateSelect,
  className
}: HorizontalCalendarProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dates, setDates] = useState<Date[]>([]);

  useEffect(() => {
    // Generate 30 days starting from today
    const today = startOfDay(new Date());
    const generatedDates = Array.from({ length: 30 }, (_, i) => addDays(today, i));
    setDates(generatedDates);
  }, []);

  useEffect(() => {
    // Auto-scroll to selected date when it changes
    if (scrollRef.current) {
      const selectedIndex = dates.findIndex(date => isSameDay(date, selectedDate));
      if (selectedIndex !== -1) {
        const element = scrollRef.current.children[selectedIndex] as HTMLElement;
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    }
  }, [selectedDate, dates]);

  const isToday = (date: Date) => isSameDay(date, new Date());
  const isSelected = (date: Date) => isSameDay(date, selectedDate);

  return (
    <div className={cn("w-full", className)}>
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {dates.map((date, index) => (
          <button
            key={index}
            onClick={() => onDateSelect(date)}
            className={cn(
              "flex-shrink-0 min-w-[60px] transition-all duration-200",
              "flex flex-col items-center justify-center gap-1 py-3"
            )}
          >
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {format(date, 'EEE', { locale: es })}
            </span>
            <div className={cn(
              "w-8 h-8 flex items-center justify-center transition-all duration-200",
              isSelected(date)
                ? "bg-primary text-primary-foreground rounded-full"
                : "text-foreground"
            )}>
              <span className="text-lg font-bold">
                {format(date, 'd')}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};