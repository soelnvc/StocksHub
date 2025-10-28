import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { fetchTopStocks, TopStock } from "@/lib/market-data-api"; // Import fetchTopStocks and TopStock

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  balance: number; // Cash balance
  total_portfolio_value: number; // Field for ranking based on total portfolio value
}

// New intermediate interface without the 'rank' property
interface IntermediateLeaderboardEntry {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  balance: number;
  total_portfolio_value: number;
}

interface SupabaseBalanceRawEntry {
  user_id: string;
  balance: number;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  }[] | null;
}

interface SupabaseUserStockRawEntry {
  user_id: string;
  stock_symbol: string;
  quantity: number;
  average_buy_price: number; // Added to fetch average buy price
}

interface UseLeaderboardResult {
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  fetchLeaderboard: () => Promise<void>;
}

export const useLeaderboard = (): UseLeaderboardResult => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        { data: balancesData, error: balancesError },
        { data: stocksData, error: stocksError },
        allCurrentStocks
      ] = await Promise.all([
        supabase.from("user_balances").select(`user_id, balance, profiles (first_name, last_name)`),
        supabase.from("user_stocks").select(`user_id, stock_symbol, quantity, average_buy_price`), // Fetch average_buy_price
        fetchTopStocks()
      ]);

      if (balancesError) throw balancesError;
      if (stocksError) throw stocksError;

      const stockPricesMap = new Map<string, number>();
      allCurrentStocks.forEach((stock: TopStock) => stockPricesMap.set(stock.symbol, stock.price));

      const userHoldingsMap = new Map<string, {
        balance: number;
        stocks: {
          stock_symbol: string;
          quantity: number;
          average_buy_price: number;
        }[];
        firstName: string | null;
        lastName: string | null;
      }>();

      // Initialize with balance and profile data
      (balancesData as SupabaseBalanceRawEntry[] || []).forEach(entry => {
        const userId = entry.user_id;
        const firstName = entry.profiles?.[0]?.first_name || null;
        const lastName = entry.profiles?.[0]?.last_name || null;
        userHoldingsMap.set(userId, {
          balance: entry.balance,
          stocks: [],
          firstName,
          lastName
        });
      });

      // Add stock holdings to each user
      (stocksData as SupabaseUserStockRawEntry[] || []).forEach(stockHolding => {
        const userId = stockHolding.user_id;
        if (userHoldingsMap.has(userId)) {
          const userEntry = userHoldingsMap.get(userId)!;
          userEntry.stocks.push({
            stock_symbol: stockHolding.stock_symbol,
            quantity: stockHolding.quantity,
            average_buy_price: stockHolding.average_buy_price
          });
          userHoldingsMap.set(userId, userEntry);
        } else {
          // This case should ideally not happen if all users have a balance entry
          userHoldingsMap.set(userId, {
            balance: 0,
            stocks: [{
              stock_symbol: stockHolding.stock_symbol,
              quantity: stockHolding.quantity,
              average_buy_price: stockHolding.average_buy_price
            }],
            firstName: null,
            lastName: null
          });
        }
      });

      const rawLeaderboard: IntermediateLeaderboardEntry[] = []; // Use the intermediate interface here

      for (const [userId, userData] of userHoldingsMap.entries()) {
        let totalStockValue = 0;

        for (const stock of userData.stocks) {
          const currentPrice = stockPricesMap.get(stock.stock_symbol) || 0;
          const currentValue = currentPrice * stock.quantity;
          totalStockValue += currentValue;
        }

        const totalPortfolioValue = userData.balance + totalStockValue;

        rawLeaderboard.push({
          user_id: userId,
          first_name: userData.firstName,
          last_name: userData.lastName,
          balance: userData.balance,
          total_portfolio_value: totalPortfolioValue,
        });
      }

      // Sort by total_portfolio_value in descending order
      rawLeaderboard.sort((a, b) => b.total_portfolio_value - a.total_portfolio_value);

      const finalLeaderboard: LeaderboardEntry[] = rawLeaderboard.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

      setLeaderboard(finalLeaderboard);
    } catch (err: any) {
      console.error("Error fetching leaderboard (caught):", err.message);
      setError("Failed to load leaderboard data. Please check the console for details.");
      showError("Failed to load leaderboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { leaderboard, isLoading, error, fetchLeaderboard };
};