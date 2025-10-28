import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User as UserIcon, Loader2 } from "lucide-react";
import { useAiMentorChat } from "@/hooks/use-ai-mentor-chat";
import { Skeleton } from "@/components/ui/skeleton";

const AIMentor = () => {
  const [inputMessage, setInputMessage] = useState("");
  const { messages, isLoading, isSending, error, sendMessage } = useAiMentorChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "" || isSending) return;
    const messageToSend = inputMessage;
    setInputMessage("");
    await sendMessage(messageToSend);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Chat with Vee, your AI Financial Companion
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Ask about market data, financial literacy, or personal finance.
        </p>

        <Card className="w-full max-w-3xl h-[70vh] flex flex-col bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader className="border-b dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>Vee - AI Mentor</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-4 overflow-hidden flex flex-col">
            <ScrollArea className="flex-grow pr-4">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-10 w-3/4" />
                  </div>
                  <div className="flex items-start justify-end space-x-2">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <div className="flex items-start space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-10 w-2/3" />
                  </div>
                </div>
              ) : error ? (
                <p className="text-red-500 text-center py-4">{error}</p>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 dark:text-gray-400">
                  <Bot className="h-16 w-16 mb-4" />
                  <p>Start a conversation with Vee!</p>
                  <p>Ask me anything about finance.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, _index) => (
                    <div
                      key={msg.id}
                      className={`flex items-start ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.sender === "vee" && (
                        <Bot className="h-8 w-8 rounded-full bg-blue-500 text-white p-1 mr-2 flex-shrink-0" />
                      )}
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.sender === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs text-right mt-1 opacity-75">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {msg.sender === "user" && (
                        <UserIcon className="h-8 w-8 rounded-full bg-gray-300 text-gray-700 p-1 ml-2 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
            <div className="flex mt-4 space-x-2">
              <Input
                placeholder="Ask Vee a question..."
                className="flex-grow dark:bg-gray-700 dark:text-white"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
                disabled={isSending}
              />
              <Button onClick={handleSendMessage} disabled={isSending || inputMessage.trim() === ""}>
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AIMentor;