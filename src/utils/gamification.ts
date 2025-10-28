import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { showError } from "@/utils/toast";

const XP_PER_TRADE = 10; // XP awarded for each trade

export const updateGamificationOnTrade = async (user: User) => {
  try {
    // Update XP
    const { data: xpData, error: xpError } = await supabase
      .from("gamification_xp")
      .select("xp, level")
      .eq("user_id", user.id)
      .maybeSingle();

    if (xpError) throw xpError;

    let currentXp = xpData?.xp || 0;
    let currentLevel = xpData?.level || 1;

    currentXp += XP_PER_TRADE;

    // Simple leveling system: 100 XP per level
    const newLevel = Math.floor(currentXp / 100) + 1;
    if (newLevel > currentLevel) {
      currentLevel = newLevel;
      // Optionally, award a badge for leveling up here
    }

    const { error: updateXpError } = await supabase
      .from("gamification_xp")
      .update({ xp: currentXp, level: currentLevel, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (updateXpError) throw updateXpError;

    // Update Streak
    const { data: streakData, error: streakError } = await supabase
      .from("gamification_streaks")
      .select("current_streak, longest_streak, last_activity_date")
      .eq("user_id", user.id)
      .maybeSingle();

    if (streakError) throw streakError;

    let currentStreak = streakData?.current_streak || 0;
    let longestStreak = streakData?.longest_streak || 0;
    const lastActivityDate = streakData?.last_activity_date ? new Date(streakData.last_activity_date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    if (!lastActivityDate || lastActivityDate.toDateString() !== today.toDateString()) {
      // If last activity was not today, check if it was yesterday
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      if (lastActivityDate && lastActivityDate.toDateString() === yesterday.toDateString()) {
        currentStreak += 1; // Continue streak
      } else {
        currentStreak = 1; // Start new streak
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      const { error: updateStreakError } = await supabase
        .from("gamification_streaks")
        .update({
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_activity_date: today.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateStreakError) throw updateStreakError;
    }
  } catch (err: any) {
    console.error("Error updating gamification data:", err.message);
    showError("Failed to update gamification progress.");
  }
};