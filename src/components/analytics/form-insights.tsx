"use client"

import { useFormInsights } from "@/hooks/useFormInsights"
import { MetricCard } from "./metric-card"
import { EyeIcon, PlayIcon, SendIcon, CheckCircleIcon, ClockIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"

export interface FormInsightsProps {
  formId: string
}

/**
 * Displays key metrics about a form's performance
 * 
 * Shows views, starts, submissions, completion rate, and average time to complete
 */
export function FormInsights({ formId }: FormInsightsProps) {
  const { 
    insights,
    isLoading,
    error,
    mutate,
    formattedTime
  } = useFormInsights(formId)

  // Handle error state
  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-destructive mb-2">Error loading insights</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "An unknown error occurred"}
          </p>
          <Button onClick={() => mutate()} variant="outline">
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  // Format completion rate for display
  const formattedCompletionRate = isLoading 
    ? "0" 
    : `${insights?.completionRate.toFixed(1)}%`

  // Format last updated time
  const lastUpdated = insights?.lastUpdated 
    ? formatDistanceToNow(new Date(insights.lastUpdated), { addSuffix: true }) 
    : "Never"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Form Insights</h2>
        <p className="text-xs text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Views */}
        <MetricCard
          title="Total Views"
          value={isLoading ? "—" : insights?.totalViews.toLocaleString() || "0"}
          description="Number of times your form was viewed"
          icon={<EyeIcon className="h-4 w-4" />}
          isLoading={isLoading}
        />

        {/* Total Starts */}
        <MetricCard
          title="Total Starts"
          value={isLoading ? "—" : insights?.totalStarts.toLocaleString() || "0"}
          description="Number of times your form was started"
          icon={<PlayIcon className="h-4 w-4" />}
          isLoading={isLoading}
        />

        {/* Total Submissions */}
        <MetricCard
          title="Total Submissions"
          value={isLoading ? "—" : insights?.totalSubmissions.toLocaleString() || "0"}
          description="Number of completed submissions"
          icon={<SendIcon className="h-4 w-4" />}
          isLoading={isLoading}
        />

        {/* Completion Rate */}
        <MetricCard
          title="Completion Rate"
          value={formattedCompletionRate}
          description="Percentage of starts that resulted in a submission"
          icon={<CheckCircleIcon className="h-4 w-4" />}
          isLoading={isLoading}
        />

        {/* Average Time to Complete */}
        <MetricCard
          title="Avg. Time to Complete"
          value={isLoading ? "—" : formattedTime}
          description="Average time taken to complete the form"
          icon={<ClockIcon className="h-4 w-4" />}
          isLoading={isLoading}
        />
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={() => mutate()} 
          variant="ghost" 
          size="sm" 
          className="text-xs"
        >
          Refresh
        </Button>
      </div>
    </div>
  )
}
