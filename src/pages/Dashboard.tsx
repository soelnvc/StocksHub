import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Wallet, Package } from "lucide-react"; // Added Wallet and Package icons
import { Skeleton } from "@/components/ui/skeleton";
import { useUserPortfolio } from "@/hooks/use-user-portfolio"; // Import the new hook
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Dashboard = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const { balance, userStocks, isLoadingPortfolio, error: portfolioError, fetchPortfolio } = useUserPortfolio();
  const [isLoadingBalance, setIsLoadingBalance] = useState(true); // Keep local loading for initial balance fetch
  const [error, setError] = useState<string | null>(null); // Keep local error for initial balance fetch

  useEffect(() => {
    const fetchInitialBalance = async () => {
      if (!user) {
        setIsLoadingBalance(false);
        return;
      }

      setIsLoadingBalance(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from("user_balances")
          .select("balance")
          .eq("user_id", user.id)
          .maybeSingle();

        if (supabaseError) {
          console.error("Supabase error fetching balance:", supabaseError.message);
          setError(`Failed to load balance: ${supabaseError.message}`);
          return;
        }

        // The balance state is now managed by useUserPortfolio, but we need to ensure it's loaded
        // for the initial display if useUserPortfolio hasn't completed its first fetch yet.
        // For simplicity, we'll rely on useUserPortfolio's `balance` state directly.
        // This local state is primarily for the initial loading indicator.
      } catch (err: any) {
        console.error("Unexpected error fetching balance:", err.message);
        setError("Failed to load balance due to an unexpected error.");
      } finally {
        setIsLoadingBalance(false);
      }
    };

    if (!isSessionLoading && user) {
      fetchInitialBalance();
      fetchPortfolio(); // Ensure portfolio is fetched when user is available
    }
  }, [user, isSessionLoading, fetchPortfolio]);

  const displayLoading = isLoadingBalance || isLoadingPortfolio;
  const displayError = error || portfolioError;

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full max-w-4xl mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Virtual Balance
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {displayLoading ? (
                <Skeleton className="h-10 w-3/4" />
              ) : displayError ? (
                <p className="text-red-500 text-2xl font-bold">{displayError}</p>
              ) : (
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  ₹{balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Your current virtual trading funds.
              </p>
            </CardContent>
          </Card>
          {/* More cards for other stats can go here */}
        </div>

        <Card className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Your Portfolio</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : displayError ? (
              <p className="text-red-500 text-center py-4">{displayError}</p>
            ) : userStocks.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                You don't own any stocks yet. Start trading!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Symbol</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Avg. Buy Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userStocks.map((stock) => (
                      <TableRow key={stock.id}>
                        <TableCell className="font-medium">{stock.stock_symbol}</TableCell>
                        <TableCell>{stock.quantity}</TableCell>
                        <TableCell className="text-right">
                          ₹{stock.average_buy_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

export default Dashboard;