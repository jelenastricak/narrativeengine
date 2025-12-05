import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Send, FileText, X, Loader2 } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";

interface NarrativeInputProps {
  onSubmit: (text: string) => void;
  isLoading?: boolean;
}

export function NarrativeInput({ onSubmit, isLoading }: NarrativeInputProps) {
  const [text, setText] = useState("");
  
  const {
    uploadedFile,
    isUploading,
    isDragOver,
    fileInputRef,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearFile,
    SUPPORTED_TYPES,
    SUPPORTED_MIME_TYPES,
  } = useFileUpload({
    onTextExtracted: (extractedText) => setText(extractedText),
  });

  const handleClearFile = () => {
    clearFile();
    setText("");
  };
  
  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text);
    }
  };
  
  return (
    <div 
      className={`border bg-card transition-colors ${isDragOver ? 'border-accent bg-accent/5' : 'border-border'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="font-display text-sm uppercase tracking-widest text-muted-foreground">
            Intelligence Input
          </span>
        </div>
        <div className="flex items-center gap-3">
          {uploadedFile && (
            <div className="flex items-center gap-2 px-2 py-1 bg-muted text-xs font-mono text-muted-foreground">
              <span className="truncate max-w-32">{uploadedFile.name}</span>
              <button onClick={handleClearFile} className="hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <span className="font-mono text-xs text-muted-foreground">
            {text.length} chars
          </span>
        </div>
      </div>
      
      {/* Input Area */}
      <div className="p-4 relative">
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-accent/10 border-2 border-dashed border-accent z-10">
            <div className="text-center">
              <Upload className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-sm font-display uppercase tracking-widest text-accent">Drop file here</p>
            </div>
          </div>
        )}
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste notes, documents, updates, transcripts, market data, friction logs, or any strategic intelligence... (or drag & drop a file)"
          className="min-h-[200px] bg-input border-border text-foreground placeholder:text-muted-foreground font-body text-sm resize-none focus:border-accent focus:ring-0"
        />
      </div>
      
      {/* Actions */}
      <div className="border-t border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={[...SUPPORTED_TYPES, ...SUPPORTED_MIME_TYPES].join(",")}
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label 
            htmlFor="file-upload"
            className={`btn-tactical flex items-center gap-2 cursor-pointer ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isUploading ? "Processing..." : "Upload File"}
          </label>
          <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
            TXT, MD, JSON, CSV, PDF, DOCX
          </span>
        </div>
        
        <button 
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading || isUploading}
          className="btn-hot flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {isLoading ? "Analyzing..." : "Analyze Narrative"}
        </button>
      </div>
    </div>
  );
}
