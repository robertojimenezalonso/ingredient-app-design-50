import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

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
  
  // Calculate Monday of current week
  const getMondayOfCurrentWeek = (date: Date) => {
    const monday = new Date(date);
    const dayOfWeek = monday.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    monday.setDate(monday.getDate() - daysToSubtract); // No additional days subtracted
    return monday;
  };
  
  const mondayOfCurrentWeek = getMondayOfCurrentWeek(today);
  
  // Generate dates from Monday of previous week to end of next month
  const generateDates = () => {
    const dates = [];
    const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0); // Last day of next month
    
    // Start from Monday of previous week
    const startDate = new Date(mondayOfCurrentWeek);
    startDate.setDate(startDate.getDate() - 7); // Go back one week
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const dates = generateDates();
  
  // Group dates by month and week
  const groupDatesByMonth = () => {
    const months: { [key: string]: Date[][] } = {};
    
    dates.forEach(date => {
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (!months[monthKey]) {
        months[monthKey] = [];
      }
      
      const weekIndex = Math.floor((date.getDate() - 1) / 7);
      if (!months[monthKey][weekIndex]) {
        months[monthKey][weekIndex] = [];
      }
      
      months[monthKey][weekIndex].push(date);
    });
    
    return months;
  };

  const monthGroups = groupDatesByMonth();
  
  const isSelected = (date: Date) => {
    return selected.some(selectedDate => 
      selectedDate.getTime() === date.getTime()
    );
  };

  const isPast = (date: Date) => {
    // Dates before today are considered past and should be disabled
    return date < today;
  };

  const isToday = (date: Date) => {
    return date.getTime() === today.getTime();
  };

  const handleDateClick = (date: Date) => {
    // Don't allow selection of past dates
    if (isPast(date)) return;
    
    const isDateSelected = isSelected(date);
    
    if (isDateSelected) {
      // Deselect the date - remove it from the array
      const newSelected = selected.filter(selectedDate => 
        selectedDate.getTime() !== date.getTime()
      );
      onSelect?.(newSelected);
    } else {
      // Select the date
      if (selected.length === 0) {
        // First date selection
        onSelect?.([date]);
      } else if (selected.length === 1) {
        // Second date - create range between the two dates
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
        // Multiple dates already selected - check if we can create a new range
        const sortedSelected = [...selected].sort((a, b) => a.getTime() - b.getTime());
        
        // Find isolated dates (dates that don't have adjacent dates selected)
        const isolatedDates = sortedSelected.filter(selectedDate => {
          const prevDay = new Date(selectedDate);
          prevDay.setDate(selectedDate.getDate() - 1);
          const nextDay = new Date(selectedDate);
          nextDay.setDate(selectedDate.getDate() + 1);
          
          const hasPrevious = sortedSelected.some(d => d.getTime() === prevDay.getTime());
          const hasNext = sortedSelected.some(d => d.getTime() === nextDay.getTime());
          
          return !hasPrevious && !hasNext;
        });
        
        // If there's exactly one isolated date, create a range with it and the new date
        if (isolatedDates.length === 1) {
          const isolatedDate = isolatedDates[0];
          const startDate = date < isolatedDate ? date : isolatedDate;
          const endDate = date < isolatedDate ? isolatedDate : date;
          
          // Remove the isolated date from current selection
          const remainingSelected = selected.filter(d => d.getTime() !== isolatedDate.getTime());
          
          // Create range between isolated date and new date
          const rangeDates = [];
          const current = new Date(startDate);
          while (current <= endDate) {
            rangeDates.push(new Date(current));
            current.setDate(current.getDate() + 1);
          }
          
          // Combine remaining selection with new range
          const newSelected = [...remainingSelected, ...rangeDates].sort((a, b) => a.getTime() - b.getTime());
          onSelect?.(newSelected);
        } else {
          // Add as individual date
          const newSelected = [...selected, date].sort((a, b) => a.getTime() - b.getTime());
          onSelect?.(newSelected);
        }
      }
    }
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Create a proper week structure
  const createWeekStructure = (monthDates: Date[]) => {
    const weeks: (Date | null)[][] = [];
    const firstDate = monthDates[0];
    const lastDate = monthDates[monthDates.length - 1];
    
    // Start from the Monday of the week containing the first date
    const startDate = new Date(firstDate);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    const currentWeek: (Date | null)[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDate || currentWeek.length < 7) {
      if (currentDate >= firstDate && currentDate <= lastDate && monthDates.some(d => d.getTime() === currentDate.getTime())) {
        currentWeek.push(new Date(currentDate));
      } else {
        currentWeek.push(null);
      }
      
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek.length = 0;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
      
      if (currentDate > lastDate && currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push([...currentWeek]);
        break;
      }
    }
    
    return weeks;
  };

  return (
    <div className={cn("p-3 rounded-lg", className)} style={{ backgroundColor: '#F4F4F4' }}>
      {Object.entries(monthGroups).map(([monthKey, weeks]) => {
        const monthDate = dates.find(d => `${d.getFullYear()}-${d.getMonth()}` === monthKey);
        if (!monthDate) return null;
        
        const monthDates = dates.filter(d => `${d.getFullYear()}-${d.getMonth()}` === monthKey);
        const weekStructure = createWeekStructure(monthDates);
        
        return (
          <div key={monthKey} className="space-y-4 mb-6">
            <div className="flex justify-start pt-1 relative items-center pl-2">
              <span className="text-sm font-medium">{formatMonth(monthDate)}</span>
            </div>
            
            {/* Day headers */}
            <div className="flex">
              {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
                <div
                  key={day}
                  className="text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex items-center justify-center"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Date grid */}
            <div className="space-y-1">
              {weekStructure.map((week, weekIndex) => (
                <div key={weekIndex} className="flex w-full mt-2 gap-1">
                  {week.map((date, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 flex items-center justify-center"
                    >
                      {date && (
                        <button
                          onClick={() => handleDateClick(date)}
                          disabled={isPast(date)}
                          className={cn(
                            "h-9 w-9 p-0 font-normal rounded-full relative transition-colors bg-transparent focus:outline-none",
                            isSelected(date) &&
                              "bg-foreground/15 border-2 border-foreground text-foreground hover:bg-foreground/15",
                            isToday(date) && !isSelected(date) && "text-foreground",
                            isPast(date) && "opacity-60 cursor-not-allowed"
                          )}
                          style={{
                            ...(isPast(date) ? { textDecoration: 'line-through', color: '#AAAAAA' } : {}),
                            ...(isToday(date) && !isSelected(date) ? { backgroundColor: '#D6D6D6' } : {})
                          }}
                        >
                          {date.getDate()}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}