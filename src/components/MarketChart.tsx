import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeRange } from "@/lib/market-data-api"; // Import TimeRange

interface MarketChartProps {
  title: string;
  data: { timestamp: number; value: number }[];
  isLoading: boolean;
  error: string | null;
  timeRange: TimeRange; // New prop
}

const MarketChart: React.FC<MarketChartProps> = ({ title, data, isLoading, error, timeRange }) => {
  const formatXAxis = (tickItem: number) => {
    const date = new Date(tickItem);
    switch (timeRange) {
      case '1h':
      case '10h': // Added '10h'
      case '1d':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '1m':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case '1y':
        return date.toLocaleDateString([], { year: 'numeric', month: 'short' });
      default:
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const formatTooltip = (value: number, _name: string, props: any) => {
    const timestamp = props.payload.timestamp;
    const date = new Date(timestamp);
    let timeLabel: string;
    switch (timeRange) {
      case '1h':
      case '10h': // Added '10h'
      case '1d':
        timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        break;
      case '1m':
        timeLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        break;
      case '1y':
        timeLabel = date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
        break;
      default:
        timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return [
      `₹${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      timeLabel,
    ];
  };

  const getTitleSuffix = (range: TimeRange) => {
    switch (range) {
      case '1h': return "(Last Hour)";
      case '10h': return "(Last 10 Hours)"; // Added '10h'
      case '1d': return "(Last Day)";
      case '1m': return "(Last Month)";
      case '1y': return "(Last Year)";
      default: return "";
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg h-full flex flex-col">
      <CardHeader className="border-b dark:border-gray-700">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
          {title} Trend {getTitleSuffix(timeRange)}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-4 overflow-hidden">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : error ? (
          <p className="text-red-500 text-center py-4">{error}</p>
        ) : data.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-4">
            No historical data available.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                minTickGap={30}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                tickFormatter={(value) => `₹${value.toLocaleString()}`}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  fontSize: 12,
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={formatTooltip}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "hsl(var(--primary))", stroke: "hsl(var(--primary-foreground))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketChart;