import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { getAllSimulatedStocks } from "@/lib/market-data-api"; // Import getAllSimulatedStocks
import { fetchStockPrice } from "@/lib/stock-api"; // Import fetchStockPrice to ensure symbols are created

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  balance: number; // Cash balance
  total_portfolio_value: number; // Field for ranking based on total portfolio value
}

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
  average_buy_price: number;
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
    console.log("Leaderboard: Starting fetchLeaderboard...");
    setIsLoading(true);
    setError(null);
    try {
      const [{ data: balancesData, error: balancesError }, { data: stocksData, error: stocksError }] =
        await Promise.all([
          supabase.from("user_balances").select(`user_id, balance, profiles (first_name, last_name)`),
          supabase.from("user_stocks").select(`user_id, stock_symbol, quantity, average_buy_price`),
        ]);

      if (balancesError) throw balancesError;
      if (stocksError) throw stocksError;

      // Collect all unique stock symbols from user portfolios
      const uniqueStockSymbols = new Set<string>();
      (stocksData as SupabaseUserStockRawEntry[] || []).forEach(stockHolding => {
        uniqueStockSymbols.add(stockHolding.stock_symbol);
      });
      console.log("Leaderboard: Unique stock symbols found in user portfolios:", Array.from(uniqueStockSymbols));

      // Ensure prices are generated/updated for all these symbols
      await Promise.all(Array.from(uniqueStockSymbols).map(symbol => fetchStockPrice(symbol)));
      console.log("Leaderboard: Ensured prices for all unique stock symbols.");

      // Now get all simulated stocks (including any newly created ones)
      const allCurrentSimulatedStocks = getAllSimulatedStocks();
      const stockPricesMap = new Map<string, number>();
      allCurrentSimulatedStocks.forEach(stock => stockPricesMap.set(stock.symbol, stock.price));
      console.log("Leaderboard: Current simulated stock prices (full map):", Object.fromEntries(stockPricesMap));


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
        console.log(`Leaderboard: Initializing user ${firstName || 'Anonymous'} (${userId}) with balance: ${entry.balance}`);
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
          console.log(`  - User ${userEntry.firstName || 'Anonymous'} (${userId}) added stock: ${stockHolding.stock_symbol}, Qty: ${stockHolding.quantity}`);
        } else {
          // This case should ideally not happen if all users have a balance entry
          // If it does, it means a user has stocks but no balance entry, which is an inconsistency.
          // For robustness, we should probably initialize a default balance here.
          userHoldingsMap.set(userId, {
            balance: 0, // Default balance if no entry found
            stocks: [{
              stock_symbol: stockHolding.stock_symbol,
              quantity: stockHolding.quantity,
              average_buy_price: stockHolding.average_buy_price
            }],
            firstName: null,
            lastName: null
          });
          console.warn(`Leaderboard: User ${userId} has stocks but no balance entry. Initializing with 0 balance.`);
        }
      });

      const rawLeaderboard: IntermediateLeaderboardEntry[] = [];

      for (const [userId, userData] of userHoldingsMap.entries()) {
        let totalStockValue = 0;
        console.log(`Leaderboard: Calculating portfolio for ${userData.firstName || 'Anonymous'} (${userId}). Current Balance: ${userData.balance}`);

        for (const stock of userData.stocks) {
          const currentPrice = stockPricesMap.get(stock.stock_symbol);
          if (currentPrice === undefined) {
            console.warn(`Leaderboard: Stock price not found for symbol '${stock.stock_symbol}' for user ${userId}. Assuming price 0 for calculation.`);
          }
          const actualCurrentPrice = currentPrice || 0;
          const currentValue = actualCurrentPrice * stock.quantity;
          totalStockValue += currentValue;
          console.log(`  - Stock: ${stock.stock_symbol}, Qty: ${stock.quantity}, Current Price: ${actualCurrentPrice.toFixed(2)}, Value: ${currentValue.toFixed(2)}`);
        }

        const totalPortfolioValue = userData.balance + totalStockValue;
        console.log(`Leaderboard: User ${userData.firstName || 'Anonymous'} (${userId}) - Calculated Stock Value: ${totalStockValue.toFixed(2)}, Total Portfolio Value: ${totalPortfolioValue.toFixed(2)}`);


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
      console.log("Leaderboard: Fetching complete.");
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