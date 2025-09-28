import * as React from "react";
import { cn } from "@/lib/utils";

interface CustomCalendarProps {
  className?: string;
  selected?: Date[];
  onSelect?: (dates: Date[]) => void;
}

export function CustomCalendar({
  className,
  selected = [],
  onSelect,
}: CustomCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Generate 20 days starting from today
  const generateDates = () => {
    const dates = [];
    const currentDate = new Date(today);
    
    for (let i = 0; i < 20; i++) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const dates = generateDates();
  
  // Get current month for display
  const getCurrentMonth = () => {
    const currentMonth = dates.find(date => {
      return date.getMonth() !== today.getMonth();
    });
    return currentMonth ? currentMonth : today;
  };

  const [displayMonth, setDisplayMonth] = React.useState(today.getMonth());
  
  React.useEffect(() => {
    // Update display month when scrolling through dates
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const dateElement = entry.target as HTMLElement;
          const dateIndex = parseInt(dateElement.dataset.dateIndex || '0');
          const date = dates[dateIndex];
          if (date && date.getMonth() !== displayMonth) {
            setDisplayMonth(date.getMonth());
          }
        }
      });
    }, { threshold: 0.5 });

    const dateElements = document.querySelectorAll('[data-date-index]');
    dateElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [dates, displayMonth]);
  
  const isSelected = (date: Date) => {
    return selected.some(selectedDate => 
      selectedDate.getTime() === selectedDate.getTime()
    );
  };

  const isToday = (date: Date) => {
    return date.getTime() === today.getTime();
  };

  const handleDateClick = (date: Date) => {
    const isDateSelected = isSelected(date);
    
    if (isDateSelected) {
      // Deselect the date
      const newSelected = selected.filter(selectedDate => 
        selectedDate.getTime() !== date.getTime()
      );
      onSelect?.(newSelected);
    } else {
      // Select the date
      if (selected.length === 0) {
        onSelect?.([date]);
      } else if (selected.length === 1) {
        // Create range between the two dates
        const firstDate = selected[0];
        const startDate = date < firstDate ? date : firstDate;
        const endDate = date < firstDate ? firstDate : date;
        
        const rangeDates = [];
        const current = new Date(startDate);
        while (current <= endDate) {
          rangeDates.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
        onSelect?.(rangeDates);
      } else {
        // Add as individual date
        const newSelected = [...selected, date].sort((a, b) => a.getTime() - b.getTime());
        onSelect?.(newSelected);
      }
    }
  };

  const formatMonth = (monthIndex: number) => {
    const date = new Date();
    date.setMonth(monthIndex);
    return date.toLocaleDateString('es-ES', { month: 'long' });
  };

  const formatDayOfWeek = (date: Date) => {
    return date.toLocaleDateString('es-ES', { weekday: 'short' });
  };

  return (
    <div className={cn("p-4 rounded-lg border", className)} style={{ backgroundColor: '#F6F4ED', borderColor: '#ECEAE4' }}>
      {/* Fixed month display */}
      <div className="mb-4">
        <span className="text-base font-medium text-[#1C1C1C]">
          {formatMonth(displayMonth)} {dates.find(d => d.getMonth() === displayMonth)?.getFullYear()}
        </span>
      </div>
      
      {/* Horizontal scrollable calendar */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-2" style={{ width: 'max-content' }}>
          {dates.map((date, index) => (
            <div
              key={index}
              data-date-index={index}
              className="flex flex-col items-center min-w-[60px]"
            >
              {/* Day of week */}
              <div className="text-xs text-muted-foreground mb-1 capitalize">
                {formatDayOfWeek(date)}
              </div>
              
              {/* Date button */}
              <button
                onClick={() => handleDateClick(date)}
                className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center text-base transition-colors relative",
                  isSelected(date) 
                    ? "bg-[#1C1C1C] text-white" 
                    : isToday(date)
                    ? "bg-[#ECEAE4] text-[#1C1C1C]"
                    : "hover:bg-[#ECEAE4] text-[#1C1C1C]"
                )}
              >
                {date.getDate()}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}