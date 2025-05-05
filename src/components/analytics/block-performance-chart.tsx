"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EnhancedBlockStats } from "@/hooks/useFormAnalyticsDashboard"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Updated props interface to reflect our simplified data structure
interface BlockPerformanceChartProps {
  title: string
  description?: string
  data: EnhancedBlockStats[]
  height?: number
  className?: string
  color?: string
  isLoading?: boolean
  valueFormatter?: (value: number) => string
  maxBars?: number
  metricType?: 'views' | 'uniqueViews' | 'avgTimeSpent' | 'interactionCount' | 'completionRate'
}

export function BlockPerformanceChart({
  title,
  description,
  data,
  height = 350,
  className,
  color = "hsl(var(--primary))",
  isLoading = false,
  valueFormatter = (value: number) => value.toString(),
  maxBars = 10,
  metricType = 'views',
}: BlockPerformanceChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Get the proper metric value accessor based on metricType
  const getMetricValue = (block: EnhancedBlockStats) => {
    switch (metricType) {
      case 'uniqueViews': return block.uniqueViews || 0;
      case 'avgTimeSpent': return block.avgTimeSpent || 0;
      case 'interactionCount': return block.interactionCount || 0;
      case 'completionRate': return block.completionRate || 0;
      case 'views':
      default: return block.count || 0;
    }
  };
  
  // Get a human-readable label for the metric
  const getMetricLabel = () => {
    switch (metricType) {
      case 'uniqueViews': return 'Unique Views';
      case 'avgTimeSpent': return 'Avg. Time Spent (sec)';
      case 'interactionCount': return 'Interactions';
      case 'completionRate': return 'Completion Rate (%)';
      case 'views':
      default: return 'Views';
    }
  };

  // Sort blocks by the selected metric (highest first)
  let sortedData = [...data].sort((a, b) => getMetricValue(b) - getMetricValue(a));

  // Limit to specified number of bars
  sortedData = sortedData.slice(0, maxBars);

  // Format the data for the chart
  const chartData = sortedData.map((block, index) => {
    return {
      name: block.title.length > 20 ? block.title.substring(0, 20) + "..." : block.title,
      value: getMetricValue(block),
      id: block.id,
      blockType: block.blockTypeId,
      fullTitle: block.title,
      allMetrics: {
        views: block.count,
        uniqueViews: block.uniqueViews,
        avgTimeSpent: block.avgTimeSpent,
        interactionCount: block.interactionCount,
        completionRate: block.completionRate
      },
      index,
    }
  })

  // Helper function for custom tooltip content
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      return (
        <div className="custom-tooltip bg-background border rounded-md shadow-md p-3 min-w-[180px]">
          <p className="mb-1 font-medium">{dataPoint.fullTitle}</p>
          <p className="mb-1 text-xs text-muted-foreground">{dataPoint.blockType} block</p>
          
          {/* Display the primary metric */}
          <p className="text-primary font-bold">
            {valueFormatter(dataPoint.value)} {getMetricLabel()}
          </p>
          
          {/* Show additional metrics if available */}
          {dataPoint.allMetrics && (
            <div className="mt-2 pt-2 border-t border-border text-xs">
              {metricType !== 'views' && (
                <p className="flex justify-between">
                  <span>Total Views:</span>
                  <span className="font-medium">{dataPoint.allMetrics.views}</span>
                </p>
              )}
              {metricType !== 'uniqueViews' && dataPoint.allMetrics.uniqueViews > 0 && (
                <p className="flex justify-between">
                  <span>Unique Views:</span>
                  <span className="font-medium">{dataPoint.allMetrics.uniqueViews}</span>
                </p>
              )}
              {metricType !== 'avgTimeSpent' && dataPoint.allMetrics.avgTimeSpent > 0 && (
                <p className="flex justify-between">
                  <span>Avg Time Spent:</span>
                  <span className="font-medium">{dataPoint.allMetrics.avgTimeSpent.toFixed(1)}s</span>
                </p>
              )}
              {metricType !== 'interactionCount' && dataPoint.allMetrics.interactionCount > 0 && (
                <p className="flex justify-between">
                  <span>Interactions:</span>
                  <span className="font-medium">{dataPoint.allMetrics.interactionCount}</span>
                </p>
              )}
            </div>
          )}
        </div>
      )
    }
    return null
  }

  // Human-readable metric label for the y-axis
  const metricLabel = getMetricLabel()

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-2 pb-2">
        {isLoading ? (
          <div className="h-[350px] w-full animate-pulse bg-muted rounded" />
        ) : chartData.length === 0 ? (
          <div className="h-[350px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 100, bottom: 0 }}
              onMouseMove={(state: any) => {
                if (state?.activeTooltipIndex !== undefined) {
                  setActiveIndex(state.activeTooltipIndex)
                }
              }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--muted))" />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                tickFormatter={valueFormatter}
                label={{ value: metricLabel, position: 'insideBottom', offset: -5, fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
              <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === activeIndex ? color : `${color}90`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
