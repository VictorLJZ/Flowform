"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useFormAnalyticsDashboard } from "@/hooks/useFormAnalyticsDashboard"
import { Skeleton } from "@/components/ui/skeleton"

interface BasicMetricsCardProps {
  formId: string
  className?: string
}

export function BasicMetricsCard({ formId, className }: BasicMetricsCardProps) {
  // Use our simplified hook that only fetches base metrics
  const { metrics, isLoading, hasError, analyticsError } = useFormAnalyticsDashboard(formId)

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (hasError || !metrics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Analytics Error</CardTitle>
          <CardDescription>We encountered an error loading the analytics data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{analyticsError?.message || "No metrics data available"}</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate readable completion rate
  const completionRate = Math.round(metrics.completion_rate * 100)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Form Performance</CardTitle>
        <CardDescription>Key metrics for your form</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Views</h3>
            <p className="text-2xl font-bold">{metrics.total_views}</p>
            <p className="text-xs text-muted-foreground">{metrics.unique_views} unique visitors</p>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Completion Rate</h3>
            <p className="text-2xl font-bold">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">{metrics.total_completions} completions</p>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Started Forms</h3>
            <p className="text-2xl font-bold">{metrics.total_starts}</p>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Bounce Rate</h3>
            <p className="text-2xl font-bold">{Math.round(metrics.bounce_rate * 100)}%</p>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mt-4 text-right">
          Last updated: {new Date(metrics.last_updated).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}
