import React, { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User as UserIcon } from "lucide-react";
import { useAIMentorChat } from "@/hooks/use-ai-mentor-chat";
import { Skeleton } from "@/components/ui/skeleton";

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
                    <div key={msg.id} className="flex flex-col items-start">
                      <div className="flex items-center space-x-2 mb-1">
                        <UserIcon className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold text-gray-900 dark:text-white">You:</span>
                      </div>
                      <div className="bg-blue-100 dark:bg-blue-900 text-gray-800 dark:text-gray-200 p-3 rounded-lg max-w-[80%] self-end">
                        {msg.message}
                      </div>
                      <div className="flex items-center space-x-2 mt-2 mb-1">
                        <Bot className="h-4 w-4 text-green-500" />
                        <span className="font-semibold text-gray-900 dark:text-white">Mentor:</span>
                      </div>
                      <div className="bg-green-100 dark:bg-green-900 text-gray-800 dark:text-gray-200 p-3 rounded-lg max-w-[80%] self-start">
                        {msg.response}
                      </div>
                    </div>
                  ))}
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