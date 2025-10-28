import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface UseProfileDataResult {
  profile: ProfileData | null;
  isLoadingProfileData: boolean;
  error: string | null;
  fetchProfileData: () => Promise<void>;
  updateProfile: (updates: Partial<ProfileData>) => Promise<boolean>;
}

export const useProfileData = (): UseProfileDataResult => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoadingProfileData, setIsLoadingProfileData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = useCallback(async () => {
    if (!user) {
      setIsLoadingProfileData(false);
      return;
    }

    setIsLoadingProfileData(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (supabaseError) throw supabaseError;
      setProfile(data || null);
    } catch (err: any) {
      console.error("Error fetching profile data:", err.message);
      setError("Failed to load profile data.");
      showError("Failed to load profile data.");
    } finally {
      setIsLoadingProfileData(false);
    }
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<ProfileData>): Promise<boolean> => {
    if (!user) {
      showError("User not authenticated.");
      return false;
    }

    setIsLoadingProfileData(true);
    setError(null);

    try {
      const { error: supabaseError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (supabaseError) throw supabaseError;

      // Also update user_metadata in auth.users table for consistency
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          first_name: updates.first_name,
          last_name: updates.last_name,
          avatar_url: updates.avatar_url,
        },
      });

      if (authUpdateError) throw authUpdateError;

      showSuccess("Profile updated successfully!");
      await fetchProfileData(); // Re-fetch to ensure UI is up-to-date
      return true;
    } catch (err: any) {
      console.error("Error updating profile:", err.message);
      setError("Failed to update profile.");
      showError("Failed to update profile.");
      return false;
    } finally {
      setIsLoadingProfileData(false);
    }
  }, [user, fetchProfileData]);

  useEffect(() => {
    if (!isSessionLoading && user) {
      fetchProfileData();
    }
  }, [user, isSessionLoading, fetchProfileData]);

  return { profile, isLoadingProfileData, error, fetchProfileData, updateProfile };
};