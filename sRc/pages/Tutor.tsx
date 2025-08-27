import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { AuthGuard } from "@/components/AuthGuard";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChatHeader } from "@/components/tutor/ChatHeader";
import { ChatMessage } from "@/components/tutor/ChatMessage";
import { MessageInput } from "@/components/tutor/MessageInput";
import { SuggestedQuestions } from "@/components/tutor/SuggestedQuestions";
import { LoadingIndicator } from "@/components/tutor/LoadingIndicator";
import { History } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  hasCode?: boolean;
}

const Tutor = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI tutor powered by Mistral AI. I can help you with Computer Science concepts, algorithms, data structures, databases, operating systems, and more. What would you like to learn about today?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  const [sessionId] = useState(() => uuidv4());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      console.log('Sending message to Mistral:', currentInput);
      
      const { data, error } = await supabase.functions.invoke('chat-with-mistral', {
        body: {
          message: currentInput,
          sessionId: sessionId,
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Received response from Mistral:', data);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date(),
        hasCode: data.hasCode,
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setRetryCount(0); // Reset retry count on success

      // Update user progress
      await supabase.rpc('update_user_progress', {
        p_user_id: user.id,
        p_subject: 'Computer Science',
        p_topic: currentInput.substring(0, 50),
        p_progress_percentage: 10,
        p_study_time_minutes: 2
      });

    } catch (error) {
      console.error('Error calling Mistral:', error);
      
      // Increment retry count
      setRetryCount(prev => prev + 1);
      
      // Create a more helpful error message based on retry count
      let errorContent = '';
      if (retryCount === 0) {
        errorContent = 'I encountered a temporary issue. This might be due to high demand on the AI service. Please try again in a moment.';
      } else if (retryCount === 1) {
        errorContent = 'Still having trouble connecting to the AI service. This could be due to API rate limits. Please wait a few seconds and try again.';
      } else {
        errorContent = 'The AI service seems to be experiencing extended issues. This might be due to:\n\n• API rate limits or quota exceeded\n• Temporary service outage\n• Network connectivity issues\n\nPlease try again later, or check if your Mistral AI API key has sufficient credits.';
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: errorContent,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "AI Service Temporarily Unavailable",
        description: retryCount < 2 ? "Please try again in a moment" : "Please check your API key credits and try later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      if (!user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view chat history",
          variant: "destructive",
        });
        return;
      }
      
      // Get chat history with actual columns
      const { data, error } = await supabase
        .from('chat_history')
        .select('id, created_at, content, message_type, session_id, user_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        setChatHistory([]);
        return;
      }
      
      // Group messages by session
      const groupedHistory = (data || []).reduce((acc, item) => {
        const sessionId = item.session_id || 'default_session';
        if (!acc[sessionId]) {
          acc[sessionId] = {
            id: sessionId,
            created_at: item.created_at,
            messages: []
          };
        }
        acc[sessionId].messages.push({
          role: item.user_id === user.id ? 'user' : 'ai',
          content: item.content || ''
        });
        return acc;
      }, {});
      
      setChatHistory(Object.values(groupedHistory));
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast({
        title: "Failed to Load History",
        description: "Could not retrieve your chat history. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <ChatHeader 
            onHistoryClick={() => {
              fetchChatHistory();
              setShowHistory(true);
            }} 
          />

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-background to-muted/20">
            <div className="group">
              {messages.map((message, index) => (
                <div key={message.id} className={`animate-slide-in-up animate-stagger-${Math.min(index + 1, 4)}`}>
                  <ChatMessage message={message} />
                </div>
              ))}
            </div>
            
            {/* Loading indicator */}
            {isLoading && <LoadingIndicator />}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <SuggestedQuestions onQuestionSelect={setInputValue} />
          )}

          {/* Input Area */}
          <MessageInput
            inputValue={inputValue}
            isLoading={isLoading}
            onInputChange={setInputValue}
            onSend={handleSend}
          />
        </div>
      </div>
      {showHistory && (
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Chat History
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {chatHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No chat history found
                </p>
              ) : (
                chatHistory.map(session => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        {new Date(session.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {session.messages.map((msg, i) => (
                        <div key={i} className={`text-sm ${msg.role === 'user' ? 'text-primary' : 'text-foreground'}`}>
                          <strong>{msg.role === 'user' ? 'You' : 'Tutor'}:</strong> {msg.content}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AuthGuard>
  );
};

export default Tutor;