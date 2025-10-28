import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) {
        setIsLoadingBalance(false);
        return;
      }

      setIsLoadingBalance(true);
      setError(null);
      try {
        // Use .maybeSingle() to handle cases where no record is found gracefully
        const { data, error: supabaseError } = await supabase
          .from("user_balances")
          .select("balance")
          .eq("user_id", user.id)
          .maybeSingle(); // Changed from .single() to .maybeSingle()

        if (supabaseError) {
          console.error("Supabase error fetching balance:", supabaseError.message);
          setError(`Failed to load balance: ${supabaseError.message}`);
          return;
        }

        if (data) {
          setBalance(data.balance);
        } else {
          // If data is null (no record found), set balance to 0
          setBalance(0); 
        }
      } catch (err: any) {
        console.error("Unexpected error fetching balance:", err.message);
        setError("Failed to load balance due to an unexpected error.");
      } finally {
        setIsLoadingBalance(false);
      }
    };

    if (!isSessionLoading && user) {
      fetchBalance();
    }
  }, [user, isSessionLoading]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full max-w-4xl">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Virtual Balance
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <Skeleton className="h-10 w-3/4" />
              ) : error ? (
                <p className="text-red-500 text-2xl font-bold">{error}</p>
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
      </div>
    </Layout>
  );
};

export default Dashboard;