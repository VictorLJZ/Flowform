"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BlockStats } from "@/hooks/useFormAnalyticsDashboard"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Updated props interface to reflect our simplified data structure
interface BlockPerformanceChartProps {
  title: string
  description?: string
  data: BlockStats[]
  height?: number
  className?: string
  color?: string
  isLoading?: boolean
  valueFormatter?: (value: number) => string
  maxBars?: number
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
}: BlockPerformanceChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Sort blocks by response count (highest first)
  let sortedData = [...data].sort((a, b) => b.count - a.count)

  // Limit to specified number of bars
  sortedData = sortedData.slice(0, maxBars)

  // Format the data for the chart
  const chartData = sortedData.map((block, index) => {
    return {
      name: block.title.length > 20 ? block.title.substring(0, 20) + "..." : block.title,
      value: block.count,
      id: block.id,
      fullTitle: block.title,
      index,
    }
  })

  // Helper function for custom tooltip content
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      return (
        <div className="custom-tooltip bg-background border rounded-md shadow-md p-3">
          <p className="mb-1 font-medium">{dataPoint.fullTitle}</p>
          <p className="text-primary font-bold">
            {valueFormatter(dataPoint.value)} responses
          </p>
        </div>
      )
    }
    return null
  }

  // Human-readable metric label for the y-axis
  const metricLabel = "Response Count"

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
