import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

interface ChatMessage {
  id: string;
  user_id: string;
  sender: "user" | "vee";
  content: string;
  created_at: string;
}

interface UseAiMentorChatResult {
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  fetchChatHistory: () => Promise<void>;
}

export const useAiMentorChat = (): UseAiMentorChatResult => {
  const { user, session, isLoading: isSessionLoading } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChatHistory = useCallback(async () => {
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

      const formattedMessages: ChatMessage[] = data.flatMap(chat => [
        {
          id: chat.id + "-user",
          user_id: chat.user_id,
          sender: "user",
          content: chat.message,
          created_at: chat.created_at,
        },
        {
          id: chat.id + "-vee",
          user_id: chat.user_id,
          sender: "vee",
          content: chat.response,
          created_at: chat.created_at,
        },
      ]);
      setMessages(formattedMessages);
    } catch (err: any) {
      console.error("Error fetching chat history:", err.message);
      setError("Failed to load chat history.");
      showError("Failed to load chat history.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const sendMessage = useCallback(async (message: string) => {
    if (!user || !session) {
      showError("You must be logged in to chat with Vee.");
      return;
    }
    if (isSending) return;

    setIsSending(true);
    setError(null);

    const userMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      user_id: user.id,
      sender: "user",
      content: message,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const { data, error: edgeFunctionError } = await supabase.functions.invoke('ai-mentor', {
        body: JSON.stringify({ message }),
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (edgeFunctionError) {
        throw edgeFunctionError;
      }

      if (data && data.error) {
        throw new Error(data.error);
      }

      const veeResponseContent = data?.response || "I'm sorry, I couldn't generate a response at this time.";

      // Store the conversation in the database
      const { data: newChat, error: insertError } = await supabase
        .from("ai_mentor_chats")
        .insert({
          user_id: user.id,
          message: message,
          response: veeResponseContent,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const veeMessage: ChatMessage = {
        id: newChat.id + "-vee",
        user_id: user.id,
        sender: "vee",
        content: veeResponseContent,
        created_at: newChat.created_at,
      };

      setMessages((prev) =>
        prev.map((msg) => (msg.id === userMessage.id ? { ...msg, id: newChat.id + "-user" } : msg))
        .concat(veeMessage)
      );

    } catch (err: any) {
      console.error("Error sending message to AI Mentor:", err.message);
      setError(err.message || "Failed to get response from Vee.");
      showError(err.message || "Failed to get response from Vee.");
      // Remove the optimistic user message if the AI response failed
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsSending(false);
    }
  }, [user, session, isSending]);

  useEffect(() => {
    if (!isSessionLoading && user) {
      fetchChatHistory();
    }
  }, [user, isSessionLoading, fetchChatHistory]);

  return { messages, isLoading, isSending, error, sendMessage, fetchChatHistory };
};