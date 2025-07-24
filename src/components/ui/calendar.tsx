import * as React from "react";
import { CustomCalendar } from "./custom-calendar";

export type CalendarProps = {
  className?: string;
  mode?: "single" | "range";
  selected?: Date | { from?: Date; to?: Date };
  onSelect?: (date: Date | { from?: Date; to?: Date } | undefined) => void;
};

function Calendar({
  className,
  mode = "single",
  selected,
  onSelect,
}: CalendarProps) {
  return (
    <CustomCalendar
      className={className}
      mode={mode}
      selected={selected}
      onSelect={onSelect}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
