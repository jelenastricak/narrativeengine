import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Plus, FileText, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface IncrementalUpdateInputProps {
  onSubmit: (text: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const SUPPORTED_TYPES = [
  ".txt", ".md", ".json", ".csv", ".html", ".htm", ".xml",
  ".pdf", ".docx", ".doc"
];

const SUPPORTED_MIME_TYPES = [
  "text/plain",
  "text/markdown",
  "application/json",
  "text/csv",
  "text/html",
  "application/xml",
  "text/xml",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

export function IncrementalUpdateInput({ onSubmit, onCancel, isLoading }: IncrementalUpdateInputProps) {
  const [text, setText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return;
    }

    const isValidType = SUPPORTED_MIME_TYPES.includes(file.type) || 
      SUPPORTED_TYPES.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      toast({
        title: "Unsupported file type",
        description: "Supported: TXT, MD, JSON, CSV, HTML, XML, PDF, DOCX",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadedFile(file);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload files.",
          variant: "destructive",
        });
        setUploadedFile(null);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-file`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to parse file");
      }

      const data = await response.json();
      
      setText(prev => prev ? `${prev}\n\n${data.text}` : data.text);
      toast({
        title: "File processed",
        description: `Extracted ${data.characterCount.toLocaleString()} characters from ${file.name}`,
      });
    } catch (error) {
      console.error("File upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  return (
    <div className="border border-accent bg-card">
      {/* Header */}
      <div className="border-b border-accent px-4 py-3 flex items-center justify-between bg-accent/10">
        <div className="flex items-center gap-3">
          <Plus className="w-4 h-4 text-accent" />
          <span className="font-display text-sm uppercase tracking-widest text-accent">
            Add New Intelligence
          </span>
        </div>
        <div className="flex items-center gap-3">
          {uploadedFile && (
            <div className="flex items-center gap-2 px-2 py-1 bg-muted text-xs font-mono text-muted-foreground">
              <span className="truncate max-w-32">{uploadedFile.name}</span>
              <button onClick={clearFile} className="hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <span className="font-mono text-xs text-muted-foreground">
            {text.length} chars
          </span>
        </div>
      </div>
      
      {/* Info */}
      <div className="px-4 py-2 border-b border-border bg-muted/30">
        <p className="text-xs text-muted-foreground font-body">
          New information will be merged with the existing narrative model. Entities, arcs, and conflicts will be updated or added based on the new data.
        </p>
      </div>
      
      {/* Input Area */}
      <div className="p-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add new developments, updates, or additional context to merge into the current narrative model..."
          className="min-h-[150px] bg-input border-border text-foreground placeholder:text-muted-foreground font-body text-sm resize-none focus:border-accent focus:ring-0"
          autoFocus
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
            id="incremental-file-upload"
          />
          <label 
            htmlFor="incremental-file-upload"
            className={`btn-tactical flex items-center gap-2 cursor-pointer ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isUploading ? "Processing..." : "Upload File"}
          </label>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onCancel}
            disabled={isLoading}
            className="btn-tactical"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading || isUploading}
            className="btn-hot flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {isLoading ? "Merging..." : "Merge Updates"}
          </button>
        </div>
      </div>
    </div>
  );
}
