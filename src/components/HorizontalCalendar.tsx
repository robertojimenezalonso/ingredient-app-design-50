import { useState, useEffect, useRef } from 'react';
import { format, addDays, startOfDay, isSameDay, isToday as isDateToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface VerticalCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  className?: string;
}

export const VerticalCalendar = ({
  selectedDate,
  onDateSelect,
  className
}: VerticalCalendarProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dates, setDates] = useState<Date[]>([]);

  useEffect(() => {
    // Generate 30 days starting from today
    const today = startOfDay(new Date());
    const generatedDates = Array.from({ length: 30 }, (_, i) => addDays(today, i));
    setDates(generatedDates);
  }, []);

  const getDateLabel = (date: Date) => {
    if (isDateToday(date)) return 'Hoy';
    if (isTomorrow(date)) return 'Mañana';
    return format(date, "EEEE d", { locale: es });
  };

  const isSelected = (date: Date) => isSameDay(date, selectedDate);

  return (
    <div className={cn("w-full", className)}>
      <div 
        ref={scrollRef}
        className="flex flex-col space-y-0"
      >
        {dates.map((date, index) => (
          <button
            key={index}
            onClick={() => onDateSelect(date)}
            className={cn(
              "w-full text-left px-4 py-4 transition-all duration-200",
              "border-b border-gray-100 hover:bg-gray-50",
              isSelected(date) && "bg-primary/10 border-primary/20"
            )}
          >
            <span className={cn(
              "text-lg font-medium capitalize",
              isSelected(date) ? "text-primary" : "text-foreground"
            )}>
              {getDateLabel(date)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};