import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User as UserIcon } from "lucide-react";
import { useAIMentorChat } from "@/hooks/use-ai-mentor-chat";
import { Skeleton } from "@/components/ui/skeleton";
// Removed: import { useSession } from "@/contexts/SessionContext";

const AIMentor = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const { messages, isLoading, isSending, error, sendMessage } = useAIMentorChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (currentMessage.trim() && !isSending) {
      await sendMessage(currentMessage);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">AI Mentor</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Your personal trading insights assistant. Ask me anything!
        </p>

        <Card className="w-full max-w-2xl h-[600px] flex flex-col bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader className="border-b dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>AI Mentor Chat</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-4 overflow-hidden flex flex-col">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-1/2" />
              </div>
            ) : error ? (
              <p className="text-red-500 text-center py-4">{error}</p>
            ) : (
              <ScrollArea className="flex-grow pr-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id}>
                      {/* User Message */}
                      <div className="flex justify-end mb-2">
                        <div className="flex items-end space-x-2 max-w-[80%]">
                          <div className="bg-blue-600 text-white p-3 rounded-lg shadow-md">
                            {msg.message}
                          </div>
                          <UserIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
                        </div>
                      </div>

                      {/* AI Mentor Response */}
                      <div className="flex justify-start mb-2">
                        <div className="flex items-end space-x-2 max-w-[80%]">
                          <Bot className="h-6 w-6 text-green-600 flex-shrink-0" />
                          <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-3 rounded-lg shadow-md">
                            {msg.response}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isSending && (
                    <div className="flex justify-start mb-2">
                      <div className="flex items-end space-x-2 max-w-[80%]">
                        <Bot className="h-6 w-6 text-green-600 flex-shrink-0" />
                        <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-3 rounded-lg shadow-md animate-pulse">
                          Thinking...
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            )}
          </CardContent>
          <div className="p-4 border-t dark:border-gray-700 flex space-x-2">
            <Input
              placeholder="Ask your AI mentor..."
              className="flex-grow dark:bg-gray-700 dark:text-white"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              disabled={isSending}
            />
            <Button onClick={handleSendMessage} disabled={!currentMessage.trim() || isSending}>
              {isSending ? "Sending..." : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AIMentor;