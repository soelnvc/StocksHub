import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Package, Award, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserPortfolio } from "@/hooks/use-user-portfolio";
import { useGamification } from "@/hooks/use-gamification";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const { balance, userStocks, isLoadingPortfolio, error: portfolioError, fetchPortfolio } = useUserPortfolio();
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

  const displayLoading = isLoadingBalance || isLoadingPortfolio || isLoadingGamification;
  const displayError = error || portfolioError || gamificationError;

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

          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Trading Streak
              </CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {displayLoading ? (
                <Skeleton className="h-10 w-3/4" />
              ) : (
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {streakData?.current_streak || 0} Days
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Longest: {streakData?.longest_streak || 0} days
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg mb-8">
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

        <Card className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Your Badges</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayLoading ? (
              <Skeleton className="h-20 w-full" />
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