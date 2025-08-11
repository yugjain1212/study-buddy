
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Image, X, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
}

export const FileUpload = ({ onFileSelect, selectedFiles, onRemoveFile }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file size (max 10MB per file)
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      onFileSelect([...selectedFiles, ...validFiles]);
    }
    
    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      {/* Upload Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs glass-effect border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/10 hover-lift transition-all duration-300"
        >
          <Paperclip className="w-3 h-3 mr-1.5" />
          File
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => imageInputRef.current?.click()}
          className="text-xs glass-effect border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/10 hover-lift transition-all duration-300"
        >
          <Image className="w-3 h-3 mr-1.5" />
          Image
        </Button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="*/*"
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="*/*"
      />

      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-2 bg-background/50 border border-border rounded-lg text-xs glass-effect hover-lift"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getFileIcon(file)}
                <span className="truncate font-medium">{file.name}</span>
                <span className="text-muted-foreground">({formatFileSize(file.size)})</span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onRemoveFile(index)}
                className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
