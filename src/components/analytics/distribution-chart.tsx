"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartTooltipProps } from '@/types'
import { cn } from '@/lib/utils'

interface DistributionChartProps {
  title: string
  description?: string
  data: Array<{
    name: string
    value: number
    color?: string
    percentage?: number
  }>
  height?: number
  className?: string
  isLoading?: boolean
  valueFormatter?: (value: number) => string
  showLegend?: boolean
  showTooltip?: boolean
  innerRadius?: number
  outerRadius?: number
}

// Default color palette
const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(217, 91%, 60%)", // blue
  "hsl(142, 71%, 45%)", // green
  "hsl(47, 100%, 50%)", // yellow 
  "hsl(326, 100%, 60%)", // pink
  "hsl(33, 100%, 50%)", // orange
  "hsl(262, 80%, 60%)", // purple
]

export function DistributionChart({
  title,
  description,
  data,
  height = 300,
  className,
  isLoading = false,
  valueFormatter = (value: number) => value.toString(),
  showLegend = true,
  showTooltip = true,
  innerRadius = 60,
  outerRadius = 80,
}: DistributionChartProps) {
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  // Prepare data for chart
  const chartData = data.map((item, index) => ({
    name: item.name,
    value: item.value,
    percentage: total > 0 ? (item.value / total) * 100 : 0,
    color: item.color || COLORS[index % COLORS.length],
  }))

  // Prevent showing "empty data" chart
  const isValidData = chartData.some(item => item.value > 0)

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="custom-tooltip bg-background border rounded-md shadow-md p-3">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-primary font-bold">{valueFormatter(data.value)}</p>
          <p className="text-xs text-muted-foreground">{data.percentage && typeof data.percentage === 'number' ? `${data.percentage.toFixed(1)}%` : ''}</p>
        </div>
      )
    }
    return null
  }

  // Custom legend to add percentages
  const CustomizedLegend = (props: { payload?: Array<{ color: string; value: string }> }) => {
    const { payload = [] } = props
    return (
      <ul className="flex flex-col gap-2 text-sm">
        {payload.map((entry, index: number) => (
          <li key={`item-${index}`} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.value}</span>
            <span className="font-medium">
              {(() => {
                const item = chartData.find(d => d.name === entry.value);
                const percentage = item?.percentage;
                return percentage && typeof percentage === 'number' ? `${percentage.toFixed(1)}%` : '';
              })()}
            </span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-2 pb-2">
        {isLoading ? (
          <div className="h-[300px] w-full animate-pulse bg-muted rounded" />
        ) : !isValidData ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-between">
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  dataKey="value"
                  paddingAngle={2}
                  animationDuration={500}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {showTooltip && <Tooltip content={<CustomTooltip />} />}
                {showLegend && <Legend content={<CustomizedLegend />} verticalAlign="middle" align="right" layout="vertical" />}
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
