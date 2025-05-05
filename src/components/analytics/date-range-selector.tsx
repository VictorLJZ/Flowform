"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DateRangeFilter } from "@/hooks/useFormAnalyticsDashboard"
import { cn } from "@/lib/utils"
import { addDays, format } from "date-fns"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"
import { useState } from "react"

interface DateRangeSelectorProps {
  dateFilter: DateRangeFilter
  onDateFilterChange: (filter: DateRangeFilter) => void
  customRange: { start?: Date; end?: Date }
  onCustomRangeChange: (range: { start?: Date; end?: Date }) => void
  className?: string
}

export function DateRangeSelector({
  dateFilter,
  onDateFilterChange,
  customRange,
  onCustomRangeChange,
  className,
}: DateRangeSelectorProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  
  // Format date display label based on selected filter
  const getDateRangeLabel = () => {
    switch (dateFilter) {
      case "last7days":
        return "Last 7 days"
      case "last30days":
        return "Last 30 days"
      case "last3months":
        return "Last 3 months"
      case "alltime":
        return "All time"
      case "custom":
        if (customRange.start && customRange.end) {
          return `${format(customRange.start, "MMM d, yyyy")} - ${format(customRange.end, "MMM d, yyyy")}`
        }
        return "Custom range"
      default:
        return "Select date range"
    }
  }

  // Set preset date ranges
  const handlePresetChange = (preset: DateRangeFilter) => {
    onDateFilterChange(preset)
    if (preset !== "custom") {
      setCalendarOpen(false)
    }
  }

  return (
    <div className={cn("flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full sm:w-auto justify-between"
          >
            <span>{getDateRangeLabel()}</span>
            <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="grid grid-cols-1 gap-1 p-2">
            <Button
              variant={dateFilter === "last7days" ? "default" : "ghost"}
              className="justify-start font-normal"
              onClick={() => handlePresetChange("last7days")}
            >
              Last 7 days
            </Button>
            <Button
              variant={dateFilter === "last30days" ? "default" : "ghost"}
              className="justify-start font-normal"
              onClick={() => handlePresetChange("last30days")}
            >
              Last 30 days
            </Button>
            <Button
              variant={dateFilter === "last3months" ? "default" : "ghost"}
              className="justify-start font-normal"
              onClick={() => handlePresetChange("last3months")}
            >
              Last 3 months
            </Button>
            <Button
              variant={dateFilter === "alltime" ? "default" : "ghost"}
              className="justify-start font-normal"
              onClick={() => handlePresetChange("alltime")}
            >
              All time
            </Button>
            <Button
              variant={dateFilter === "custom" ? "default" : "ghost"}
              className="justify-start font-normal"
              onClick={() => {
                onDateFilterChange("custom")
                setCalendarOpen(true)
              }}
            >
              Custom range
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {dateFilter === "custom" && (
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {customRange.start && customRange.end
                ? `${format(customRange.start, "MMM d")} - ${format(customRange.end, "MMM d")}`
                : "Pick a date range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: customRange.start || new Date(),
                to: customRange.end || addDays(new Date(), 7),
              }}
              onSelect={(range: { from?: Date; to?: Date } | undefined) => {
                onCustomRangeChange({
                  start: range?.from,
                  end: range?.to,
                })
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
