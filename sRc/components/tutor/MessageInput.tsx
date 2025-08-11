
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Code, Lightbulb, Sparkles } from "lucide-react";
import { FileUpload } from "./FileUpload";

interface MessageInputProps {
  inputValue: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export const MessageInput = ({ inputValue, isLoading, onInputChange, onSend }: MessageInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (selectedFiles.length > 0) {
      // TODO: Handle file uploads - for now just show files are attached
      console.log('Files to upload:', selectedFiles);
    }
    onSend();
    setSelectedFiles([]); // Clear files after sending
  };

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-card/95 backdrop-blur-sm border-t border-border p-6 space-y-4">
      {/* File Upload Section */}
      <FileUpload
        onFileSelect={handleFileSelect}
        selectedFiles={selectedFiles}
        onRemoveFile={handleRemoveFile}
      />

      <div className="flex space-x-4 mb-4">
        <div className="flex-1 relative group">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about Computer Science..."
            className="pr-14 py-4 text-base bg-background/50 border-2 border-border hover:border-purple-500/50 focus:border-purple-500 transition-all duration-300 rounded-xl"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={(!inputValue.trim() && selectedFiles.length === 0) || isLoading}
            className="absolute right-2 top-2 h-10 w-10 p-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg shadow-lg hover-lift disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Quick Action Buttons */}
      <div className="flex space-x-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onInputChange("Give me an analogy")}
          className="text-xs glass-effect border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/10 hover-lift transition-all duration-300"
        >
          <Lightbulb className="w-3 h-3 mr-1.5" />
          Analogy
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onInputChange("Show me code examples")}
          className="text-xs glass-effect border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/10 hover-lift transition-all duration-300"
        >
          <Code className="w-3 h-3 mr-1.5" />
          Code
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onInputChange("Explain this step by step")}
          className="text-xs glass-effect border-green-500/20 hover:border-green-500/50 hover:bg-green-500/10 hover-lift transition-all duration-300"
        >
          <Sparkles className="w-3 h-3 mr-1.5" />
          Step-by-step
        </Button>
      </div>
    </div>
  );
};
