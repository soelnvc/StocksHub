import { useEffect } from "react";
import Layout from "@/components/Layout";
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
import { History } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { formatCurrency } from "@/utils/currency"; // Import the new utility

const TransactionHistory = () => {
  const { transactions, isLoadingTransactions, error, fetchTransactions } = useTransactions();

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 30000); // Refetch every 30 seconds
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">Transaction History</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Review all your past stock buy and sell orders.
        </p>

        <Card className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader className="border-b dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Your Transactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingTransactions ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : error ? (
              <p className="text-red-500 text-center py-4">{error}</p>
            ) : transactions.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No transactions found. Start trading to see your history!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Type</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <span className={`font-medium ${transaction.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{transaction.stock_symbol}</TableCell>
                        <TableCell>{transaction.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(transaction.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {new Date(transaction.transaction_time).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TransactionHistory;