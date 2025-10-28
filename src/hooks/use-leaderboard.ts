import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  balance: number;
}

interface SupabaseLeaderboardRawEntry {
  user_id: string;
  balance: number;
  profiles: Array<{
    first_name: string | null;
    last_name: string | null;
  }> | null;
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
      // Fetch balances and join with profiles to get names
      const { data, error: supabaseError } = await supabase
        .from("user_balances")
        .select(`
          user_id,
          balance,
          profiles (first_name, last_name)
        `)
        .order("balance", { ascending: false }); // Order by balance descending

      if (supabaseError) throw supabaseError;

      const sortedLeaderboard: LeaderboardEntry[] = (data as SupabaseLeaderboardRawEntry[] || []).map((entry, index) => ({
        rank: index + 1,
        user_id: entry.user_id,
        first_name: entry.profiles?.[0]?.first_name || null, // Access first element of the array
        last_name: entry.profiles?.[0]?.last_name || null,   // Access first element of the array
        balance: entry.balance,
      }));

      setLeaderboard(sortedLeaderboard);
    } catch (err: any) {
      console.error("Error fetching leaderboard:", err.message);
      setError("Failed to load leaderboard data.");
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