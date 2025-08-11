
import { Button } from "@/components/ui/button";
import { Copy, ThumbsUp, ThumbsDown, Bot, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  hasCode?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const formatMessage = (content: string) => {
    const parts = content.split('```');
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const lines = part.split('\n');
        const language = lines[0] || '';
        const code = lines.slice(1).join('\n');
        
        return (
          <div key={index} className="my-6 relative group">
            <div className="bg-slate-900 dark:bg-slate-800 text-slate-100 rounded-xl overflow-hidden shadow-lg border border-slate-700">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800 dark:bg-slate-700 text-sm border-b border-slate-600">
                <span className="text-slate-300 font-mono">{language}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(code)}
                  className="text-slate-300 hover:text-white hover:bg-slate-600 h-8 px-3 opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm font-mono">{code}</code>
              </pre>
            </div>
          </div>
        );
      } else {
        return (
          <div key={index} className="whitespace-pre-wrap leading-relaxed">
            {part.split('\n').map((line, lineIndex) => {
              if (line.startsWith('**') && line.endsWith('**')) {
                return (
                  <div key={lineIndex} className="font-bold text-foreground my-3 text-lg">
                    {line.slice(2, -2)}
                  </div>
                );
              }
              if (line.startsWith('- ')) {
                return (
                  <div key={lineIndex} className="ml-4 my-2 flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>{line.slice(2)}</span>
                  </div>
                );
              }
              return <div key={lineIndex} className="my-1">{line}</div>;
            })}
          </div>
        );
      }
    });
  };

  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in-up`}>
      <div className={`max-w-4xl ${message.type === 'user' ? 'order-2' : 'order-1'} flex items-start space-x-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            message.type === 'user' 
              ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500'
          } shadow-lg`}>
            {message.type === 'user' ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`${message.type === 'user' ? 'order-1' : 'order-2'} flex-1`}>
          <div
            className={`rounded-2xl px-6 py-4 shadow-lg transition-all duration-300 hover:shadow-xl ${
              message.type === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm'
                : 'glass-effect border border-border/50 text-foreground rounded-bl-sm hover:border-purple-500/30'
            }`}
          >
            {message.type === 'ai' ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {formatMessage(message.content)}
              </div>
            ) : (
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            )}
          </div>
          
          {/* AI Message Actions */}
          {message.type === 'ai' && (
            <div className="flex items-center space-x-2 mt-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button size="sm" variant="ghost" className="h-8 px-3 text-xs hover:bg-green-500/10 hover:text-green-400 transition-colors">
                <ThumbsUp className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 px-3 text-xs hover:bg-red-500/10 hover:text-red-400 transition-colors">
                <ThumbsDown className="w-3 h-3" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 px-3 text-xs hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                onClick={() => copyToClipboard(message.content)}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-2 px-2">
            {message.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};
