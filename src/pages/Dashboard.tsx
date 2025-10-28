import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Package, Award, Flame, TrendingUp, LineChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserPortfolio } from "@/hooks/use-user-portfolio";
import { useGamification } from "@/hooks/use-gamification";
import { useProfileData } from "@/hooks/use-profile-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/currency"; // Import the new utility

const Dashboard = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const { profile, isLoadingProfileData } = useProfileData();
  const { balance, userStocks, totalStockValue, totalPortfolioValue, totalPortfolioProfitLoss, isLoadingPortfolio, error: portfolioError, fetchPortfolio } = useUserPortfolio();
  const { xpData, streakData, badges, isLoadingGamification, error: gamificationError, fetchGamificationData } = useGamification();

  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialBalance = async () => {
      if (!user) {
        setIsLoadingBalance(false);
        return;
      }

      setIsLoadingBalance(true);
      setError(null);
      try {
        const { data: _data, error: supabaseError } = await supabase
          .from("user_balances")
          .select("balance")
          .eq("user_id", user.id)
          .maybeSingle();

        if (supabaseError) {
          console.error("Supabase error fetching balance:", supabaseError.message);
          setError(`Failed to load balance: ${supabaseError.message}`);
          return;
        }
      } catch (err: any) {
        console.error("Unexpected error fetching balance:", err.message);
        setError("Failed to load balance due to an unexpected error.");
      } finally {
        setIsLoadingBalance(false);
      }
    };

    if (!isSessionLoading && user) {
      fetchInitialBalance();
      fetchPortfolio();
      fetchGamificationData();
    }
  }, [user, isSessionLoading, fetchPortfolio, fetchGamificationData]);

  const displayLoading = isLoadingBalance || isLoadingPortfolio || isLoadingGamification || isLoadingProfileData;
  const displayError = error || portfolioError || gamificationError;

  const firstName = profile?.first_name || user?.user_metadata?.first_name || "Trader";

  const isProfit = totalPortfolioProfitLoss >= 0;
  const profitLossColorClass = isProfit ? "text-green-600" : "text-red-600";
  const ProfitLossIcon = isProfit ? TrendingUp : LineChart; // Using LineChart for loss, TrendingUp for profit

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Welcome, {displayLoading ? <Skeleton className="inline-block h-8 w-32 align-middle" /> : firstName}!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Your personalized overview of your StockSim journey.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full max-w-6xl mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Portfolio Value
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {displayLoading ? (
                <Skeleton className="h-10 w-3/4" />
              ) : displayError ? (
                <p className="text-red-500 text-2xl font-bold">{displayError}</p>
              ) : (
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalPortfolioValue)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Cash + Stock Holdings
              </p>
            </CardContent>
          </Card>

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
                  {formatCurrency(balance)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Your current virtual trading funds.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Stock Holdings Value
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {displayLoading ? (
                <Skeleton className="h-10 w-3/4" />
              ) : displayError ? (
                <p className="text-red-500 text-2xl font-bold">{displayError}</p>
              ) : (
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalStockValue)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Current market value of your stocks.
              </p>
            </CardContent>
          </Card>

          {/* New Card for Total Portfolio P/L */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total P/L
              </CardTitle>
              <ProfitLossIcon className={`h-4 w-4 ${profitLossColorClass}`} />
            </CardHeader>
            <CardContent>
              {displayLoading ? (
                <Skeleton className="h-10 w-3/4" />
              ) : displayError ? (
                <p className="text-red-500 text-2xl font-bold">{displayError}</p>
              ) : (
                <div className={`text-4xl font-bold ${profitLossColorClass}`}>
                  {formatCurrency(totalPortfolioProfitLoss)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Overall profit/loss across all holdings.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* XP & Level and Trading Streak Cards */}
        <div className="grid gap-4 md:grid-cols-2 w-full max-w-6xl mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium text-gray-700 dark:text-gray-300">
                XP & Level
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {displayLoading ? (
                <Skeleton className="h-10 w-3/4" />
              ) : (
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  Level {xpData?.level || 1}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {xpData?.xp || 0} XP earned
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span>Trading Streak</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayLoading ? (
                <Skeleton className="h-10 w-1/2 mx-auto" />
              ) : (
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {streakData?.trades_streak || 0} Trades
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Longest streak: {streakData?.longest_trades_streak || 0} trades
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="w-full max-w-6xl bg-white dark:bg-gray-800 shadow-lg mb-8">
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
                      <TableHead className="text-right">Current Price</TableHead>
                      <TableHead className="text-right">Current Value</TableHead>
                      <TableHead className="text-right">P/L</TableHead> {/* New column */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userStocks.map((stock) => {
                      const isStockProfit = stock.total_profit_loss != null && stock.total_profit_loss >= 0;
                      const stockProfitLossColorClass = isStockProfit ? "text-green-600" : "text-red-600";
                      return (
                        <TableRow key={stock.id}>
                          <TableCell className="font-medium">{stock.stock_symbol}</TableCell>
                          <TableCell>{stock.quantity}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(stock.average_buy_price)}
                          </TableCell>
                          <TableCell className="text-right">
                            {isLoadingPortfolio ? (
                              <Skeleton className="h-4 w-16 inline-block" />
                            ) : formatCurrency(stock.current_price)}
                          </TableCell>
                          <TableCell className="text-right">
                            {isLoadingPortfolio ? (
                              <Skeleton className="h-4 w-20 inline-block" />
                            ) : formatCurrency(stock.current_value)}
                          </TableCell>
                          <TableCell className={`text-right ${stockProfitLossColorClass}`}> {/* New P/L cell */}
                            {isLoadingPortfolio ? (
                              <Skeleton className="h-4 w-16 inline-block" />
                            ) : formatCurrency(stock.total_profit_loss)}
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

        <Card className="w-full max-w-6xl bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Your Badges</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayLoading ? (
              <div className="flex flex-wrap gap-2 justify-center">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-8 w-20" />
                </div>
            ) : displayError ? (
              <p className="text-red-500 text-center py-4">{displayError}</p>
            ) : badges.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No badges earned yet. Keep trading to unlock achievements!
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center py-4">
                {badges.map((badge) => (
                  <Badge key={badge.id} variant="secondary" className="text-lg px-4 py-2">
                    {badge.badge_name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;