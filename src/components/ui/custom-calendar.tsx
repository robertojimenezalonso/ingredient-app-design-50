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
  
  // State for current displayed month
  const [displayMonth, setDisplayMonth] = React.useState(() => {
    return { month: today.getMonth(), year: today.getFullYear() };
  });
  
  React.useEffect(() => {
    // Find the first date that's currently visible on the left side of the scroll container
    const scrollContainer = document.querySelector('.overflow-x-auto');
    if (!scrollContainer) return;

    const observer = new IntersectionObserver((entries) => {
      // Get all visible dates
      const visibleDates = entries
        .filter(entry => entry.isIntersecting)
        .map(entry => {
          const element = entry.target as HTMLElement;
          const dateIndex = parseInt(element.dataset.dateIndex || '0');
          return { element, date: dates[dateIndex], index: dateIndex };
        })
        .filter(item => item.date)
        .sort((a, b) => a.index - b.index);

      if (visibleDates.length > 0) {
        // Get the first visible date (leftmost)
        const firstVisibleDate = visibleDates[0].date;
        
        // Check if this date represents a different month than currently displayed
        const newMonth = firstVisibleDate.getMonth();
        const newYear = firstVisibleDate.getFullYear();
        
        if (newMonth !== displayMonth.month || newYear !== displayMonth.year) {
          // Only change if this is the first day of the new month visible
          // or if we've scrolled far enough that the new month is dominant
          const newMonthDates = visibleDates.filter(item => 
            item.date.getMonth() === newMonth && item.date.getFullYear() === newYear
          );
          const currentMonthDates = visibleDates.filter(item => 
            item.date.getMonth() === displayMonth.month && item.date.getFullYear() === displayMonth.year
          );
          
          // Change month when new month has more visible days than current month
          if (newMonthDates.length > currentMonthDates.length) {
            setDisplayMonth({ month: newMonth, year: newYear });
          }
        }
      }
    }, { 
      threshold: 0.3,
      root: scrollContainer
    });

    // Observe all date elements
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

  const formatMonth = (monthData: { month: number; year: number }) => {
    const date = new Date();
    date.setMonth(monthData.month);
    date.setFullYear(monthData.year);
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
          {formatMonth(displayMonth)} {displayMonth.year}
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