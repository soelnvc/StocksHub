import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

interface GamificationXP {
  xp: number;
  level: number;
}

interface GamificationStreak {
  current_streak: number; // Consecutive trading days
  longest_streak: number; // Longest consecutive trading days
  trades_streak: number; // Consecutive trades within the current trading period
  longest_trades_streak: number; // Longest consecutive trades ever
  last_activity_date: string | null;
}

interface GamificationBadge {
  id: string;
  badge_name: string;
  awarded_at: string;
}

interface UseGamificationResult {
  xpData: GamificationXP | null;
  streakData: GamificationStreak | null;
  badges: GamificationBadge[];
  isLoadingGamification: boolean;
  error: string | null;
  fetchGamificationData: () => Promise<void>;
}

export const useGamification = (): UseGamificationResult => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [xpData, setXpData] = useState<GamificationXP | null>(null);
  const [streakData, setStreakData] = useState<GamificationStreak | null>(null);
  const [badges, setBadges] = useState<GamificationBadge[]>([]);
  const [isLoadingGamification, setIsLoadingGamification] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGamificationData = useCallback(async () => {
    if (!user) {
      setIsLoadingGamification(false);
      return;
    }

    setIsLoadingGamification(true);
    setError(null);

    try {
      // Fetch XP and Level
      const { data: xpResult, error: xpError } = await supabase
        .from("gamification_xp")
        .select("xp, level")
        .eq("user_id", user.id)
        .maybeSingle();

      if (xpError) throw xpError;
      setXpData(xpResult || { xp: 0, level: 1 }); // Default to 0 XP, Level 1 if no entry

      // Fetch Streaks including new trade streak columns
      const { data: streakResult, error: streakError } = await supabase
        .from("gamification_streaks")
        .select("current_streak, longest_streak, last_activity_date, trades_streak, longest_trades_streak")
        .eq("user_id", user.id)
        .maybeSingle();

      if (streakError) throw streakError;
      setStreakData(streakResult || { current_streak: 0, longest_streak: 0, trades_streak: 0, longest_trades_streak: 0, last_activity_date: null });

      // Fetch Badges
      const { data: badgesResult, error: badgesError } = await supabase
        .from("gamification_badges")
        .select("id, badge_name, awarded_at")
        .eq("user_id", user.id)
        .order("awarded_at", { ascending: false });

      if (badgesError) throw badgesError;
      setBadges(badgesResult || []);

    } catch (err: any) {
      console.error("Error fetching gamification data:", err.message);
      setError("Failed to load gamification data.");
      showError("Failed to load gamification data.");
    } finally {
      setIsLoadingGamification(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isSessionLoading && user) {
      fetchGamificationData();
    }
  }, [user, isSessionLoading, fetchGamificationData]);

  return { xpData, streakData, badges, isLoadingGamification, error, fetchGamificationData };
};