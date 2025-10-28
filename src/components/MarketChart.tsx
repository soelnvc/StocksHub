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

interface MarketChartProps {
  title: string;
  data: { timestamp: number; value: number }[];
  isLoading: boolean;
  error: string | null;
}

const MarketChart: React.FC<MarketChartProps> = ({ title, data, isLoading, error }) => {
  const formatXAxis = (tickItem: number) => {
    const date = new Date(tickItem);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTooltip = (value: number, name: string, props: any) => {
    const timestamp = props.payload.timestamp;
    const date = new Date(timestamp);
    return [
      `₹${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    ];
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg h-full">
      <CardHeader className="border-b dark:border-gray-700">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
          {title} Trend (Last Hour)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 h-[calc(100%-70px)]"> {/* Adjust height based on header */}
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