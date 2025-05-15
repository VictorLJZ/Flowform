// src/types/chart-types.ts
// Centralized type definitions for chart components

/**
 * Chart data point for recharts
 */
export type ChartDataPoint = {
  name: string;
  value: number;
  fullTitle?: string;
  blockType?: string;
  views?: number;
  uniqueViews?: number;
  avgTimeSpent?: number;
  interactionCount?: number;
  completionRate?: number;
  label?: string;
  color?: string;
  allMetrics?: Record<string, number>;
  [key: string]: string | number | Record<string, number> | undefined;
};

/**
 * Chart payload type for recharts tooltips and custom components
 */
export type ChartPayload = {
  value: number;
  name: string;
  dataKey: string;
  fill?: string;
  color?: string;
  stroke?: string;
  payload: ChartDataPoint;
};

/**
 * Generic chart event type for recharts events
 */
export type ChartEvent = {
  activeLabel?: string;
  activePayload?: ChartPayload[];
  activeTooltipIndex?: number;
};

/**
 * Tooltip properties for recharts custom tooltips
 */
export type ChartTooltipProps = {
  active?: boolean;
  payload?: ChartPayload[];
  label?: string;
};

/**
 * Bar chart payload type
 */
export type BarChartPayload = {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  payload: ChartDataPoint;
};