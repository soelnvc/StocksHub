import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { fetchTopStocks, TopStock } from "@/lib/market-data-api"; // Import fetchTopStocks and TopStock

// Define the initial balance for all users
const TOTAL_INITIAL_BALANCE = 100000.00;

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  balance: number; // Cash balance
  total_portfolio_value: number;
  total_profit_made: number; // New field for ranking based on profit
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
        supabase.from("user_stocks").select(`user_id, stock_symbol, quantity`),
        fetchTopStocks()
      ]);

      if (balancesError) throw balancesError;
      if (stocksError) throw stocksError;

      const stockPricesMap = new Map<string, number>();
      allCurrentStocks.forEach((stock: TopStock) => stockPricesMap.set(stock.symbol, stock.price));

      const userPortfolioValues = new Map<string, {
        balance: number;
        stockValue: number;
        firstName: string | null;
        lastName: string | null;
      }>();

      (balancesData as SupabaseBalanceRawEntry[] || []).forEach(entry => {
        const userId = entry.user_id;
        const firstName = entry.profiles?.[0]?.first_name || null;
        const lastName = entry.profiles?.[0]?.last_name || null;
        userPortfolioValues.set(userId, {
          balance: entry.balance,
          stockValue: 0,
          firstName,
          lastName
        });
      });

      (stocksData as SupabaseUserStockRawEntry[] || []).forEach(stockHolding => {
        const userId = stockHolding.user_id;
        const currentPrice = stockPricesMap.get(stockHolding.stock_symbol) || 0;
        const stockValue = currentPrice * stockHolding.quantity;

        if (userPortfolioValues.has(userId)) {
          const current = userPortfolioValues.get(userId)!;
          current.stockValue += stockValue;
          userPortfolioValues.set(userId, current);
        } else {
          userPortfolioValues.set(userId, {
            balance: 0,
            stockValue: stockValue,
            firstName: null,
            lastName: null
          });
        }
      });

      const rawLeaderboard = Array.from(userPortfolioValues.entries()).map(([userId, data]) => {
        const totalPortfolioValue = data.balance + data.stockValue;
        const totalProfitMade = totalPortfolioValue - TOTAL_INITIAL_BALANCE; // Calculate profit made
        return {
          user_id: userId,
          first_name: data.firstName,
          last_name: data.lastName,
          balance: data.balance,
          total_portfolio_value: totalPortfolioValue,
          total_profit_made: totalProfitMade, // Include in the entry
        };
      });

      // Sort by total_profit_made in descending order
      rawLeaderboard.sort((a, b) => b.total_profit_made - a.total_profit_made);

      const finalLeaderboard = rawLeaderboard.map((entry, index) => ({
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