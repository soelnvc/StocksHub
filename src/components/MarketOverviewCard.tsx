import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MarketOverviewCardProps {
  title: string;
  value: number | null;
  change: number | null;
  changePercent: number | null;
  isLoading: boolean;
  error: string | null;
}

const MarketOverviewCard: React.FC<MarketOverviewCardProps> = ({
  title,
  value,
  change,
  changePercent,
  isLoading,
  error,
}) => {
  const isPositive = change !== null && change >= 0;
  const changeColorClass = isPositive ? "text-green-600" : "text-red-600";
  const ChangeIcon = isPositive ? ArrowUp : ArrowDown;

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-3/4" />
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : (
          <>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className={`text-xs flex items-center mt-1 ${changeColorClass}`}>
              {change !== null && (
                <>
                  <ChangeIcon className="h-3 w-3 mr-1" />
                  <span>{change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className="ml-1">({changePercent?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%)</span>
                </>
              )}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketOverviewCard;