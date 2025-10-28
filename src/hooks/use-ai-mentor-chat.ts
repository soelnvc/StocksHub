import { useState, useEffect, useCallback } from "react"; // Removed useRef
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string;
  created_at: string;
}

interface UseAIMentorChatResult {
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  sendMessage: (userMessage: string) => Promise<void>;
  fetchMessages: () => Promise<void>;
}

export const useAIMentorChat = (): UseAIMentorChatResult => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from("ai_mentor_chats")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (supabaseError) throw supabaseError;
      setMessages(data || []);
    } catch (err: any) {
      console.error("Error fetching AI mentor chats:", err.message);
      setError("Failed to load chat history.");
      showError("Failed to load chat history.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!user || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      // First, invoke the Edge Function to get the AI response
      const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('ai-mentor', {
        body: { message: userMessage },
      });

      if (edgeFunctionError) throw edgeFunctionError;

      const aiResponse = edgeFunctionData.response;

      // Then, save both the user message and AI response to the database
      const { data, error: supabaseError } = await supabase
        .from("ai_mentor_chats")
        .insert({
          user_id: user.id,
          message: userMessage,
          response: aiResponse,
        })
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      setMessages((prevMessages) => [...prevMessages, data]);
    } catch (err: any) {
      console.error("Error sending message to AI mentor:", err.message);
      setError("Failed to send message.");
      showError("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  }, [user, isSending]);

  useEffect(() => {
    if (!isSessionLoading && user) {
      fetchMessages();
    }
  }, [user, isSessionLoading, fetchMessages]);

  return { messages, isLoading, isSending, error, sendMessage, fetchMessages };
};