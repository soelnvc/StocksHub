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

// Corrected interface based on TypeScript error message
interface SupabaseLeaderboardRawEntry {
  user_id: string;
  balance: number;
  profiles: { // This is now an array of profile objects
    first_name: string | null;
    last_name: string | null;
  }[] | null;
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

      if (supabaseError) {
        console.error("Supabase Leaderboard Error:", supabaseError);
        throw supabaseError;
      }

      // --- DEBUGGING LOG ---
      console.log("Raw Supabase data for leaderboard:", data);
      // --- END DEBUGGING LOG ---

      const sortedLeaderboard: LeaderboardEntry[] = (data as SupabaseLeaderboardRawEntry[] || []).map((entry, index) => ({
        rank: index + 1,
        user_id: entry.user_id,
        // Access first_name and last_name from the first element of the profiles array
        first_name: entry.profiles?.[0]?.first_name || null,
        last_name: entry.profiles?.[0]?.last_name || null,
        balance: entry.balance,
      }));

      setLeaderboard(sortedLeaderboard);
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