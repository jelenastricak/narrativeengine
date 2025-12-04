import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Send, FileText } from "lucide-react";

interface NarrativeInputProps {
  onSubmit: (text: string) => void;
  isLoading?: boolean;
}

export function NarrativeInput({ onSubmit, isLoading }: NarrativeInputProps) {
  const [text, setText] = useState("");
  
  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text);
    }
  };
  
  return (
    <div className="border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="font-display text-sm uppercase tracking-widest text-muted-foreground">
            Intelligence Input
          </span>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {text.length} chars
        </span>
      </div>
      
      {/* Input Area */}
      <div className="p-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste notes, documents, updates, transcripts, market data, friction logs, or any strategic intelligence..."
          className="min-h-[200px] bg-input border-border text-foreground placeholder:text-muted-foreground font-body text-sm resize-none focus:border-accent focus:ring-0"
        />
      </div>
      
      {/* Actions */}
      <div className="border-t border-border px-4 py-3 flex items-center justify-between">
        <button 
          className="btn-tactical flex items-center gap-2 opacity-50 cursor-not-allowed"
          disabled
        >
          <Upload className="w-4 h-4" />
          Upload File
        </button>
        
        <button 
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          className="btn-hot flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {isLoading ? "Analyzing..." : "Analyze Narrative"}
        </button>
      </div>
    </div>
  );
}
