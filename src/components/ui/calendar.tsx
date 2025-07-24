import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 2);
  
  const minDate = new Date();
  minDate.setDate(today.getDate() - 10);

  return (
    <div className="max-h-96 overflow-y-auto">
      <DayPicker
        showOutsideDays={false}
        numberOfMonths={2}
        fromDate={minDate}
        toDate={maxDate}
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col space-y-6",
          month: "space-y-4",
          caption: "flex justify-start pt-1 relative items-center pl-2",
          caption_label: "text-sm font-medium",
          nav: "hidden",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex items-center justify-center",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full relative"
          ),
          day_selected:
            "bg-foreground text-background hover:bg-foreground hover:text-background focus:bg-foreground focus:text-background rounded-full",
          day_today: "bg-accent text-accent-foreground rounded-full",
          day_outside: "hidden",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-foreground/20 aria-selected:text-foreground rounded-none",
          day_range_start: "rounded-l-full rounded-r-none bg-foreground text-background",
          day_range_end: "rounded-r-full rounded-l-none bg-foreground text-background",
          day_hidden: "invisible",
          ...classNames,
        }}
        formatters={{
          formatWeekdayName: (date) => {
            const day = date.getDay();
            const dayNames = ["D", "L", "M", "X", "J", "V", "S"];
            return dayNames[day];
          }
        }}
        modifiers={{
          past: (date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today;
          }
        }}
        modifiersStyles={{
          past: {
            textDecoration: 'line-through',
            opacity: 0.6
          }
        }}
        {...props}
      />
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
