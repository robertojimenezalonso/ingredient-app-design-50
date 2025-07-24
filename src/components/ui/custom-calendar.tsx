import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface CustomCalendarProps {
  className?: string;
  mode?: "single" | "range";
  selected?: Date | { from?: Date; to?: Date };
  onSelect?: (date: Date | { from?: Date; to?: Date } | undefined) => void;
}

export function CustomCalendar({
  className,
  mode = "single",
  selected,
  onSelect,
}: CustomCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate 10 days before today
  const tenDaysAgo = new Date(today);
  tenDaysAgo.setDate(today.getDate() - 10);
  
  // Generate dates from 10 days ago to 2 months from now
  const generateDates = () => {
    const dates = [];
    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + 2);
    
    const currentDate = new Date(tenDaysAgo);
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
    if (mode === "single" && selected instanceof Date) {
      return date.getTime() === selected.getTime();
    }
    if (mode === "range" && selected && typeof selected === "object" && "from" in selected) {
      if (selected.from && selected.to) {
        return date >= selected.from && date <= selected.to;
      }
      if (selected.from) {
        return date.getTime() === selected.from.getTime();
      }
    }
    return false;
  };

  const isPast = (date: Date) => {
    return date < today;
  };

  const isToday = (date: Date) => {
    return date.getTime() === today.getTime();
  };

  const handleDateClick = (date: Date) => {
    if (mode === "single") {
      onSelect?.(date);
    } else if (mode === "range") {
      const rangeSelected = selected as { from?: Date; to?: Date } | undefined;
      if (!rangeSelected?.from || (rangeSelected.from && rangeSelected.to)) {
        onSelect?.({ from: date, to: undefined });
      } else if (rangeSelected.from && !rangeSelected.to) {
        if (date >= rangeSelected.from) {
          onSelect?.({ from: rangeSelected.from, to: date });
        } else {
          onSelect?.({ from: date, to: rangeSelected.from });
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
    <div className={cn("max-h-96 overflow-y-auto p-3", className)}>
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
                <div key={weekIndex} className="flex w-full mt-2">
                  {week.map((date, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20"
                    >
                      {date && (
                        <button
                          onClick={() => handleDateClick(date)}
                          className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "h-9 w-9 p-0 font-normal rounded-full relative",
                            isSelected(date) &&
                              "bg-foreground text-background hover:bg-foreground hover:text-background focus:bg-foreground focus:text-background",
                            isToday(date) && !isSelected(date) && "bg-accent text-accent-foreground",
                            isPast(date) && "opacity-60"
                          )}
                          style={isPast(date) ? { textDecoration: 'line-through' } : {}}
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