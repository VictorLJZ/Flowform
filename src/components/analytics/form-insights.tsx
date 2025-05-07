"use client"

import { useFormInsights } from "@/hooks/useFormInsights"
import { EyeIcon, PlayIcon, SendIcon, CheckCircleIcon, ClockIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

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
      <div className="p-6 border rounded-md bg-destructive/5">
        <div className="text-center">
          <h3 className="text-lg font-medium text-destructive mb-2">Error loading insights</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "An unknown error occurred"}
          </p>
          <Button onClick={() => mutate()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Form Insights</h2>
        <p className="text-xs text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-6">Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Total Views */}
            <MetricItem
              title="Total Views"
              value={isLoading ? "—" : insights?.totalViews.toLocaleString() || "0"}
              description="Times your form was viewed"
              icon={<EyeIcon className="h-4 w-4" />}
              isLoading={isLoading}
            />

            {/* Total Starts */}
            <MetricItem
              title="Total Starts"
              value={isLoading ? "—" : insights?.totalStarts.toLocaleString() || "0"}
              description="Times your form was started"
              icon={<PlayIcon className="h-4 w-4" />}
              isLoading={isLoading}
            />

            {/* Total Submissions */}
            <MetricItem
              title="Total Submissions"
              value={isLoading ? "—" : insights?.totalSubmissions.toLocaleString() || "0"}
              description="Completed submissions"
              icon={<SendIcon className="h-4 w-4" />}
              isLoading={isLoading}
            />

            {/* Completion Rate */}
            <MetricItem
              title="Completion Rate"
              value={formattedCompletionRate}
              description="Starts resulting in submission"
              icon={<CheckCircleIcon className="h-4 w-4" />}
              isLoading={isLoading}
            />

            {/* Average Time to Complete */}
            <MetricItem
              title="Avg. Time to Complete"
              value={isLoading ? "—" : formattedTime}
              description="Average completion time"
              icon={<ClockIcon className="h-4 w-4" />}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
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
    </div>
  );
}

/**
 * Individual metric item component with simpler design
 */
function MetricItem({ 
  title, 
  value, 
  description, 
  icon, 
  isLoading = false,
  className,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("py-4 px-6", className)}>
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-8 w-[60px]" />
          {description && <Skeleton className="h-4 w-[140px]" />}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {icon && <div className="text-muted-foreground">{icon}</div>}
          </div>
          <div>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}
    </div>
  )
}
