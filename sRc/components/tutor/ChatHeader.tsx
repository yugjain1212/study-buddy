import { BookOpen, Sparkles, History } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ChatHeader = ({ onHistoryClick }: { onHistoryClick: () => void }) => {
  return (
    <div className="bg-card border-b border-border p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse-glow">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-card animate-pulse">
              <Sparkles className="w-2 h-2 text-white m-0.5" />
            </div>
          </div>
          <div className="animate-slide-in-right">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Tutor
            </h1>
            <p className="text-muted-foreground">
              Powered by Mistral AI - Your personal Computer Science assistant
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onHistoryClick}
          className="hover:bg-muted/50"
          aria-label="View chat history"
        >
          <History className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
