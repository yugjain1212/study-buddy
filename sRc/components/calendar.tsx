import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  return (
    <DayPicker
      showWeekNumber
      showOutsideDays={showOutsideDays}
      className={cn("p-3 w-full", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
        month: "space-y-4 w-full",
        caption: "flex justify-center pt-1 relative items-center w-full mb-4",
        caption_label: "text-base font-semibold text-foreground",
        nav: "space-x-1 flex items-center absolute inset-0 pointer-events-none",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 pointer-events-auto transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
        ),
        nav_button_previous: "absolute left-0 top-0",
        nav_button_next: "absolute right-0 top-0",
        table: "w-full border-collapse",
        head_row: "flex w-full mb-2",
        head_cell: "text-muted-foreground rounded-md font-medium text-xs text-center p-2 w-9 flex-shrink-0",
        row: "flex w-full",
        cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 flex-shrink-0",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-md"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-semibold shadow-sm",
        day_today: "bg-accent text-accent-foreground font-semibold ring-2 ring-primary/30",
        day_outside:
          "day-outside text-muted-foreground/50 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground/30 opacity-30 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        weeknumber: "flex h-9 w-9 items-center justify-center font-medium text-xs text-muted-foreground",
        ...classNames,
      }}
      style={{
        '--rdp-cell-size': '2.25rem',
        '--rdp-caption-font-size': '1rem',
        '--rdp-accent-color': 'hsl(var(--primary))',
        '--rdp-background-color': 'hsl(var(--accent))',
        '--rdp-accent-color-dark': 'hsl(var(--primary))',
        '--rdp-background-color-dark': 'hsl(var(--accent))',
      } as React.CSSProperties}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
        Head: () => null, // We'll handle the header in the styles
      } as any}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };