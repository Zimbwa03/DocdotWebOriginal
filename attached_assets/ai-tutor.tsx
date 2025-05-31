import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SendHorizontal, Brain, ImagePlus, Lightbulb, BookOpen } from "lucide-react";
import { sendAiChatMessage, generateFlashcards, summarizeTopic, createQuizQuestions } from "@/lib/openai";
import AiChat from "@/components/ai/ai-chat";

interface Message {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

export default function AiTutor() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Hi there! I'm your AI medical tutor. How can I help you with your studies today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Send message to AI
      const response = await sendAiChatMessage({
        userId: user.id,
        question: input
      });

      // Add AI response to chat
      const aiMessage: Message = {
        role: "ai",
        content: response.answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to get AI response:", error);

      // Add error message with more specific error handling
      const errorMessage: Message = {
        role: "ai",
        content: error.response?.data?.error || "I encountered an error processing your request. Please try asking your medical question again.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (!user) return;

    let prompt = "";

    switch (action) {
      case "flashcards":
        prompt = "Please generate 5 flashcards about the brachial plexus";
        break;
      case "diagram":
        prompt = "Create a diagram explaining the cardiac cycle";
        break;
      case "summarize":
        prompt = "Summarize the key points about renal physiology";
        break;
      case "quiz":
        prompt = "Quiz me on the cranial nerves";
        break;
      default:
        return;
    }

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send message to AI
      const response = await sendAiChatMessage({
        userId: user.id,
        question: prompt
      });

      // Add AI response
      const aiMessage: Message = {
        role: "ai",
        content: response.answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to execute quick action:", error);

      // Add error message with more specific error handling
      const errorMessage: Message = {
        role: "ai",
        content: "I apologize for the error. Let me try to help you with your medical question. Please try asking again or rephrase your question.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Authentication requirement removed temporarily

  return (
    <div className="py-12 bg-gray-50 dark:bg-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-8">
          <h2 className="text-base text-secondary-600 dark:text-secondary-400 font-semibold tracking-wide uppercase">AI Tutor</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Your Personal Medical Assistant
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
            Get instant answers, personalized explanations, and study materials tailored to your needs.
          </p>
        </div>

        <div className="mt-10">
          <Card className="shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="px-6 py-5 border-b border-gray-200 dark:border-dark-600">
              <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Ask Anything</CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-4 h-80 overflow-y-auto scrollbar-hide bg-gray-50 dark:bg-dark-800">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <AiChat
                    key={index}
                    role={message.role}
                    content={message.content}
                  />
                ))}
                {isLoading && (
                  <AiChat
                    role="ai"
                    content="Thinking..."
                    isLoading
                  />
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter className="px-6 py-4 bg-white dark:bg-dark-700">
              <form onSubmit={handleSendMessage} className="w-full">
                <div className="flex">
                  <Input
                    type="text"
                    placeholder="Ask any medical question..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-500 rounded-l-md focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-600 dark:text-white"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-r-md"
                    disabled={isLoading}
                  >
                    <SendHorizontal className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex mt-3 space-x-2 flex-wrap gap-2">
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-600"
                    onClick={() => handleQuickAction("flashcards")}
                  >
                    <BookOpen className="h-3 w-3 mr-1" />
                    Generate flashcards
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-600"
                    onClick={() => handleQuickAction("diagram")}
                  >
                    <ImagePlus className="h-3 w-3 mr-1" />
                    Create diagram
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-600"
                    onClick={() => handleQuickAction("summarize")}
                  >
                    <Brain className="h-3 w-3 mr-1" />
                    Summarize topic
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-600"
                    onClick={() => handleQuickAction("quiz")}
                  >
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Quiz me
                  </Badge>
                </div>
              </form>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}