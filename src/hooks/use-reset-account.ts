import { useState, useCallback } from "react";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

interface UseResetAccountResult {
  isResetting: boolean;
  resetError: string | null;
  resetAccount: () => Promise<boolean>;
}

export const useResetAccount = (): UseResetAccountResult => {
  const { user, session } = useSession();
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const resetAccount = useCallback(async (): Promise<boolean> => {
    if (!user || !session) {
      showError("You must be logged in to reset your account.");
      return false;
    }

    setIsResetting(true);
    setResetError(null);

    try {
      const { data, error: edgeFunctionError } = await supabase.functions.invoke('reset-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (edgeFunctionError) {
        throw edgeFunctionError;
      }

      if (data && data.error) {
        throw new Error(data.error);
      }

      showSuccess("Your account has been reset successfully!");
      return true;
    } catch (err: any) {
      console.error("Error during account reset:", err.message);
      setResetError(err.message || "Failed to reset account.");
      showError(`Failed to reset account: ${err.message}`);
      return false;
    } finally {
      setIsResetting(false);
    }
  }, [user, session]);

  return { isResetting, resetError, resetAccount };
};