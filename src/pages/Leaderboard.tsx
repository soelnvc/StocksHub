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
import { Trophy } from "lucide-react";
import { useLeaderboard } from "@/hooks/use-leaderboard";

const Leaderboard = () => {
  const { leaderboard, isLoading, error, fetchLeaderboard } = useLeaderboard();

  useEffect(() => {
    fetchLeaderboard(); // Fetch on component mount
    // Optionally, refetch periodically
    const interval = setInterval(fetchLeaderboard, 60000); // Refetch every minute
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">Leaderboard</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          See who's topping the charts with the highest virtual balance!
        </p>

        <Card className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader className="border-b dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Top Traders</span>
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
            ) : leaderboard.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No traders on the leaderboard yet. Be the first!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((entry) => (
                      <TableRow key={entry.user_id}>
                        <TableCell className="font-medium">{entry.rank}</TableCell>
                        <TableCell>{entry.first_name || "Anonymous"} {entry.last_name}</TableCell>
                        <TableCell className="text-right">
                          ₹{entry.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

export default Leaderboard;