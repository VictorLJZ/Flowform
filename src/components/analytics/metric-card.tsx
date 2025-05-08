"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
    direction: "up" | "down" | "neutral"
  }
  isLoading?: boolean
  className?: string
}

/**
 * Card component for displaying a metric with optional icon and trend
 */
export function MetricCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  isLoading = false, 
  className 
}: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-10 w-[180px]" />
            {description && <Skeleton className="h-4 w-full" />}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {icon && <div className="text-muted-foreground">{icon}</div>}
            </div>
            <div className="flex items-end gap-2">
              <h2 className="text-3xl font-bold">{value}</h2>
              {trend && (
                <div className={cn(
                  "flex items-center text-xs",
                  trend.direction === "up" && "text-emerald-500",
                  trend.direction === "down" && "text-rose-500",
                  trend.direction === "neutral" && "text-muted-foreground"
                )}>
                  {trend.direction === "up" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {trend.direction === "down" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M1.22 5.222a.75.75 0 011.06 0L7 9.942l3.768-3.769a.75.75 0 011.113.058 20.908 20.908 0 013.813 7.254l1.574-2.727a.75.75 0 011.3.75l-2.475 4.286a.75.75 0 01-.966.364l-4.285-1.81a.75.75 0 01.483-1.425l3.38 1.431A19.397 19.397 0 017.69 7.278l-3.75 3.75-4.72-4.72a.75.75 0 010-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className="ml-1">{trend.value}% {trend.label}</span>
                </div>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
