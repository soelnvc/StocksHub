import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

interface Transaction {
  id: string;
  user_id: string;
  stock_symbol: string;
  quantity: number;
  price: number;
  type: "buy" | "sell";
  transaction_time: string;
}

interface UseTransactionsResult {
  transactions: Transaction[];
  isLoadingTransactions: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
}

export const useTransactions = (): UseTransactionsResult => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setIsLoadingTransactions(false);
      return;
    }

    setIsLoadingTransactions(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("transaction_time", { ascending: false }); // Latest transactions first

      if (supabaseError) throw supabaseError;
      setTransactions(data || []);
    } catch (err: any) {
      console.error("Error fetching transactions:", err.message);
      setError("Failed to load transaction history.");
      showError("Failed to load transaction history.");
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isSessionLoading && user) {
      fetchTransactions();
    }
  }, [user, isSessionLoading, fetchTransactions]);

  return { transactions, isLoadingTransactions, error, fetchTransactions };
};