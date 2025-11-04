"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(
          "inline-flex items-center justify-center rounded-md border border-arc bg-arc-secondary text-arc",
          "w-7 h-7 p-0 opacity-70 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell: "text-arc-muted rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm [&:has([aria-selected])]:bg-gray-100 dark:[&:has([aria-selected])]:bg-slate-800",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          "inline-flex items-center justify-center w-8 h-8 rounded-md text-sm",
          "hover:bg-gray-100 dark:hover:bg-slate-800"
        ),
        day_range_start: "day-range-start bg-arc text-white",
        day_range_end: "day-range-end bg-arc text-white",
        day_selected: "bg-arc text-arc-primary hover:bg-arc",
        day_today: "bg-gray-100 dark:bg-slate-800",
        day_outside: "text-arc-muted opacity-70",
        day_disabled: "text-arc-muted opacity-50",
        day_range_middle: "bg-gray-100 dark:bg-slate-800",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }: { className?: string; orientation?: "up" | "down" | "left" | "right" }) => {
          const shared = { className: cn("w-4 h-4", className), ...props } as any;
          switch (orientation) {
            case "up":
              return <ChevronUp {...shared} />;
            case "down":
              return <ChevronDown {...shared} />;
            case "right":
              return <ChevronRight {...shared} />;
            case "left":
            default:
              return <ChevronLeft {...shared} />;
          }
        },
      }}
      {...props}
    />
  );
}
