import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

interface UserStock {
  id: string;
  stock_symbol: string;
  quantity: number;
  average_buy_price: number;
}

interface UseUserPortfolioResult {
  balance: number | null;
  userStocks: UserStock[];
  isLoadingPortfolio: boolean;
  error: string | null;
  buyStock: (symbol: string, quantity: number, price: number) => Promise<boolean>;
  sellStock: (symbol: string, quantity: number, price: number) => Promise<boolean>;
  fetchPortfolio: () => Promise<void>;
}

export const useUserPortfolio = (): UseUserPortfolioResult => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [balance, setBalance] = useState<number | null>(null);
  const [userStocks, setUserStocks] = useState<UserStock[]>([]);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!user) {
      setIsLoadingPortfolio(false);
      return;
    }

    setIsLoadingPortfolio(true);
    setError(null);

    try {
      // Fetch balance
      const { data: balanceData, error: balanceError } = await supabase
        .from("user_balances")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (balanceError) throw balanceError;
      setBalance(balanceData?.balance || 0);

      // Fetch user stocks
      const { data: stocksData, error: stocksError } = await supabase
        .from("user_stocks")
        .select("*")
        .eq("user_id", user.id);

      if (stocksError) throw stocksError;
      setUserStocks(stocksData || []);

    } catch (err: any) {
      console.error("Error fetching portfolio:", err.message);
      setError("Failed to load portfolio data.");
      showError("Failed to load portfolio data.");
    } finally {
      setIsLoadingPortfolio(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isSessionLoading && user) {
      fetchPortfolio();
    }
  }, [user, isSessionLoading, fetchPortfolio]);

  const buyStock = useCallback(async (symbol: string, quantity: number, price: number): Promise<boolean> => {
    if (!user || balance === null) {
      showError("User not authenticated or balance not loaded.");
      return false;
    }

    const totalCost = quantity * price;
    if (balance < totalCost) {
      showError("Insufficient funds to complete this purchase.");
      return false;
    }

    setIsLoadingPortfolio(true);
    try {
      // 1. Deduct from balance
      const newBalance = balance - totalCost;
      const { error: balanceUpdateError } = await supabase
        .from("user_balances")
        .update({ balance: newBalance })
        .eq("user_id", user.id);

      if (balanceUpdateError) throw balanceUpdateError;

      // 2. Update/Insert user_stocks
      const existingStock = userStocks.find(s => s.stock_symbol === symbol);
      if (existingStock) {
        const newTotalQuantity = existingStock.quantity + quantity;
        const newAverageBuyPrice = ((existingStock.average_buy_price * existingStock.quantity) + (price * quantity)) / newTotalQuantity;

        const { error: stockUpdateError } = await supabase
          .from("user_stocks")
          .update({
            quantity: newTotalQuantity,
            average_buy_price: newAverageBuyPrice,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingStock.id);

        if (stockUpdateError) throw stockUpdateError;
      } else {
        const { error: stockInsertError } = await supabase
          .from("user_stocks")
          .insert({
            user_id: user.id,
            stock_symbol: symbol,
            quantity: quantity,
            average_buy_price: price,
          });

        if (stockInsertError) throw stockInsertError;
      }

      // 3. Record transaction
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          stock_symbol: symbol,
          quantity: quantity,
          price: price,
          type: "buy",
        });

      if (transactionError) throw transactionError;

      setBalance(newBalance); // Optimistic update
      await fetchPortfolio(); // Re-fetch to ensure consistency
      showSuccess(`Successfully bought ${quantity} shares of ${symbol}.`);
      return true;
    } catch (err: any) {
      console.error("Error buying stock:", err.message);
      showError(`Failed to buy stock: ${err.message}`);
      setError(`Failed to buy stock: ${err.message}`);
      await fetchPortfolio(); // Re-fetch to revert optimistic update if failed
      return false;
    } finally {
      setIsLoadingPortfolio(false);
    }
  }, [user, balance, userStocks, fetchPortfolio]);

  const sellStock = useCallback(async (symbol: string, quantity: number, price: number): Promise<boolean> => {
    if (!user || balance === null) {
      showError("User not authenticated or balance not loaded.");
      return false;
    }

    const existingStock = userStocks.find(s => s.stock_symbol === symbol);
    if (!existingStock || existingStock.quantity < quantity) {
      showError("Insufficient shares to sell.");
      return false;
    }

    setIsLoadingPortfolio(true);
    try {
      // 1. Add to balance
      const totalProceeds = quantity * price;
      const newBalance = balance + totalProceeds;
      const { error: balanceUpdateError } = await supabase
        .from("user_balances")
        .update({ balance: newBalance })
        .eq("user_id", user.id);

      if (balanceUpdateError) throw balanceUpdateError;

      // 2. Update/Delete user_stocks
      const newQuantity = existingStock.quantity - quantity;
      if (newQuantity === 0) {
        const { error: stockDeleteError } = await supabase
          .from("user_stocks")
          .delete()
          .eq("id", existingStock.id);

        if (stockDeleteError) throw stockDeleteError;
      } else {
        const { error: stockUpdateError } = await supabase
          .from("user_stocks")
          .update({
            quantity: newQuantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingStock.id);

        if (stockUpdateError) throw stockUpdateError;
      }

      // 3. Record transaction
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          stock_symbol: symbol,
          quantity: quantity,
          price: price,
          type: "sell",
        });

      if (transactionError) throw transactionError;

      setBalance(newBalance); // Optimistic update
      await fetchPortfolio(); // Re-fetch to ensure consistency
      showSuccess(`Successfully sold ${quantity} shares of ${symbol}.`);
      return true;
    } catch (err: any) {
      console.error("Error selling stock:", err.message);
      showError(`Failed to sell stock: ${err.message}`);
      setError(`Failed to sell stock: ${err.message}`);
      await fetchPortfolio(); // Re-fetch to revert optimistic update if failed
      return false;
    } finally {
      setIsLoadingPortfolio(false);
    }
  }, [user, balance, userStocks, fetchPortfolio]);

  return { balance, userStocks, isLoadingPortfolio, error, buyStock, sellStock, fetchPortfolio };
};