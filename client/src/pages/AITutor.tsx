import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStudyState } from "@/contexts/StudyStateContext";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, Loader2, Trash2, BookOpen, Brain, MessageCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AITutor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { chatMessages, setChatMessages, addChatMessage } = useStudyState();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ 
          message,
          userId: user?.id,
          context: 'medical_tutor'
        }),
      });
    },
    onSuccess: (data) => {
      const aiMessage: Message = {
        id: Date.now().toString() + '_ai',
        role: 'assistant',
        content: data.response || "I'm here to help with your medical studies!",
        timestamp: new Date()
      };
      addChatMessage(aiMessage);
      setIsTyping(false);
    },
    onError: (error: any) => {
      console.error('AI Chat error:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      addChatMessage(errorMessage);
      setIsTyping(false);
      toast({
        title: "Connection Error",
        description: "Unable to reach AI tutor. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString() + '_user',
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    addChatMessage(userMessage);
    setInput("");
    setIsTyping(true);

    try {
      await sendMessageMutation.mutateAsync(input.trim());
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setChatMessages([]);
    toast({
      title: "Chat Cleared",
      description: "Your conversation history has been cleared.",
    });
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const quickPrompts = [
    "Explain the cardiovascular system",
    "What are the functions of the liver?",
    "Help me understand nephron structure",
    "Quiz me on anatomy",
    "Explain drug mechanisms",
    "Study tips for medical exams"
  ];

  if (!user) {
    return (
      <div className="text-center py-8">
        <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Please log in to chat with your AI tutor.</p>
      </div>
    );
  }

  return (
    <div className="h-[800px] flex flex-col">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              AI Medical Tutor
              <Badge variant="secondary" className="ml-2">
                {chatMessages.length} messages
              </Badge>
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearChat}
              disabled={chatMessages.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Chat
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Welcome to your AI Medical Tutor!</h3>
                  <p className="text-muted-foreground mb-6">
                    I'm here to help you learn medical concepts, answer questions, and guide your studies.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
                    {quickPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setInput(prompt)}
                        className="text-left justify-start"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                      <div className={`text-xs mt-2 ${
                        message.role === 'user' 
                          ? 'text-primary-foreground/70' 
                          : 'text-muted-foreground'
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about medical topics..."
                disabled={sendMessageMutation.isPending}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || sendMessageMutation.isPending}
                size="icon"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}