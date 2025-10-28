import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, ArrowDown, ArrowUp } from "lucide-react";
import { formatCurrency } from "@/utils/currency"; // Import the new utility

interface TopStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
}

interface TopStocksTableProps {
  topStocks: TopStock[];
  isLoading: boolean;
  error: string | null;
}

const TopStocksTable: React.FC<TopStocksTableProps> = ({ topStocks, isLoading, error }) => {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg">
      <CardHeader className="border-b dark:border-gray-700">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Top Stocks</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <p className="text-red-500 text-center py-4">{error}</p>
        ) : topStocks.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-4">
            No top stocks available.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topStocks.map((stock) => {
                  const isPositive = stock.change >= 0;
                  const changeColorClass = isPositive ? "text-green-600" : "text-red-600";
                  const ChangeIcon = isPositive ? ArrowUp : ArrowDown;
                  return (
                    <TableRow key={stock.symbol}>
                      <TableCell className="font-medium">{stock.symbol}</TableCell>
                      <TableCell>{stock.name}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(stock.price)}
                      </TableCell>
                      <TableCell className={`text-right flex items-center justify-end ${changeColorClass}`}>
                        <ChangeIcon className="h-3 w-3 mr-1" />
                        <span>{stock.change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="ml-1">({stock.change_percent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%)</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopStocksTable;