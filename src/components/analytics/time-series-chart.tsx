"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TimeSeriesPoint } from "@/hooks/useFormAnalyticsDashboard"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { useState } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartEvent, ChartTooltipProps } from "@/types"

type ChartType = "area" | "bar" | "line"

interface TimeSeriesChartProps {
  title: string
  description?: string
  data: TimeSeriesPoint[]
  type?: ChartType
  height?: number
  className?: string
  color?: string
  isLoading?: boolean
  valueFormatter?: (value: number) => string
  dateFormatter?: (date: string) => string
  showGridLines?: boolean
}

export function TimeSeriesChart({
  title,
  description,
  data,
  type = "area",
  height = 350,
  className,
  color = "hsl(var(--primary))",
  isLoading = false,
  valueFormatter = (value: number) => value.toString(),
  dateFormatter = (date: string) => format(parseISO(date), "MMM d"),
  showGridLines = true,
}: TimeSeriesChartProps) {
  // Use state to track hover index if needed for future functionality
  const [, setActiveIndex] = useState<number | null>(null)

  // Format the chart data
  const chartData = data.map((item, index) => ({
    name: dateFormatter(item.date),
    value: item.value,
    date: item.date,
    index,
  }))

  // Helper function for custom tooltip content
  const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      return (
        <div className="custom-tooltip bg-background border rounded-md shadow-md p-3">
          <p className="mb-1 font-medium">{label}</p>
          <p className="text-primary font-bold">{valueFormatter(dataPoint.value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-2 pb-2">
        {isLoading ? (
          <div className="h-[350px] w-full animate-pulse bg-muted rounded" />
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            {type === "bar" ? (
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                onMouseMove={(state: ChartEvent) => {
                  if (state?.activeTooltipIndex !== undefined) {
                    setActiveIndex(state.activeTooltipIndex)
                  }
                }}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {showGridLines && (
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                )}
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                  tickFormatter={valueFormatter}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar
                  dataKey="value"
                  fill={color}
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.9}
                  animationDuration={300}
                />
              </BarChart>
            ) : (
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                onMouseMove={(state: ChartEvent) => {
                  if (state?.activeTooltipIndex !== undefined) {
                    setActiveIndex(state.activeTooltipIndex)
                  }
                }}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {showGridLines && (
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                )}
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                  tickFormatter={valueFormatter}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  fill={color}
                  fillOpacity={0.1}
                  activeDot={{ r: 6, fill: color, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                  animationDuration={300}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
