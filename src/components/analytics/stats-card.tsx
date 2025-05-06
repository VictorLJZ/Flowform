"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: number
  trendLabel?: string
  isLoading?: boolean
  tooltip?: string
  className?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  trendLabel,
  isLoading = false,
  tooltip,
  className
}: StatsCardProps) {
  // Determine trend direction and color
  const showTrend = trend !== undefined && trend !== null
  const trendIcon = trend ? (
    trend > 0 ? (
      <ArrowUpIcon className="h-4 w-4" />
    ) : trend < 0 ? (
      <ArrowDownIcon className="h-4 w-4" />
    ) : (
      <ArrowRightIcon className="h-4 w-4" />
    )
  ) : null

  const trendColor = trend ? (
    trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-600"
  ) : ""

  // For positive metrics like conversion rate, green is good (up)
  // For negative metrics like bounce rate, red is good (down)
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <TooltipProvider>
          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {title}
                  </h3>
                </TooltipTrigger>
                {tooltip && <TooltipContent>{tooltip}</TooltipContent>}
              </Tooltip>
              <div className="flex items-baseline gap-2">
                {isLoading ? (
                  <div className="h-9 w-24 animate-pulse rounded bg-muted"></div>
                ) : (
                  <div className="text-2xl font-bold">{value}</div>
                )}
                {showTrend && !isLoading && (
                  <div className={cn("text-sm font-medium flex items-center gap-1", trendColor)}>
                    {trendIcon}
                    {Math.abs(trend)} {trendLabel}
                  </div>
                )}
              </div>
            </div>
            {icon && (
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                {icon}
              </div>
            )}
          </div>
          {description && (
            <p className="mt-2 text-xs text-muted-foreground">{description}</p>
          )}
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
