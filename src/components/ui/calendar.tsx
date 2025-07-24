import * as React from "react";
import { CustomCalendar } from "./custom-calendar";

export type CalendarProps = {
  className?: string;
  selected?: Date[];
  onSelect?: (dates: Date[]) => void;
};

function Calendar({
  className,
  selected,
  onSelect,
}: CalendarProps) {
  return (
    <CustomCalendar
      className={className}
      selected={selected}
      onSelect={onSelect}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
