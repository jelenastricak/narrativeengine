import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Upload, Plus, X, Loader2 } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";

interface IncrementalUpdateInputProps {
  onSubmit: (text: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function IncrementalUpdateInput({ onSubmit, onCancel, isLoading }: IncrementalUpdateInputProps) {
  const [text, setText] = useState("");
  
  const {
    uploadedFile,
    isUploading,
    uploadProgress,
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
    onTextExtracted: (extractedText) => setText(prev => prev ? `${prev}\n\n${extractedText}` : extractedText),
  });
  
  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text);
    }
  };
  
  return (
    <div 
      className={`border bg-card transition-colors ${isDragOver ? 'border-accent bg-accent/5' : 'border-accent'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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

      {/* Upload Progress */}
      {isUploading && (
        <div className="px-4 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Progress value={uploadProgress} className="h-2" />
            </div>
            <span className="text-xs font-mono text-muted-foreground w-12 text-right">
              {uploadProgress}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {uploadProgress < 100 ? "Uploading..." : "Processing file..."}
          </p>
        </div>
      )}
      
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
          placeholder="Add new developments, updates, or additional context to merge into the current narrative model... (or drag & drop a file)"
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
            {isUploading ? `Uploading ${uploadProgress}%` : "Upload File"}
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