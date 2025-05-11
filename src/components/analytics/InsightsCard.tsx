"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LightbulbIcon } from "lucide-react"

interface InsightsCardProps {
  title?: string
  insights: string[]
  className?: string
  isLoading?: boolean
}

export function InsightsCard({
  title = "Insights",
  insights,
  className,
  isLoading = false,
}: InsightsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <LightbulbIcon className="h-5 w-5 text-yellow-500" />
          {title}
        </CardTitle>
        <CardDescription>
          Automatically generated insights based on your form data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-full animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : insights.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">
            No insights available yet. Collect more responses to generate insights.
          </p>
        ) : (
          <ul className="space-y-3">
            {insights.map((insight, index) => (
              <li key={index} className="flex gap-3 text-sm">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {index + 1}
                </div>
                <p>{insight}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
