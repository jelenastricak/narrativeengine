import { Button } from "@/components/ui/button";
import { MIN_INPUT_CHARS, MAX_INPUT_CHARS } from "@/lib/normalizeModel";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Upload, Plus, X, Loader2 } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";

interface IncrementalUpdateInputProps {
  text: string;
  onTextChange: (text: string) => void;
  onSubmit: (text: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function IncrementalUpdateInput({ text, onTextChange, onSubmit, onCancel, isLoading }: IncrementalUpdateInputProps) {
  const setText = onTextChange;
  const validText = text.trim().length >= MIN_INPUT_CHARS && text.trim().length <= MAX_INPUT_CHARS;

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
    onTextExtracted: (extractedText) => setText(text ? `${text}\n\n${extractedText}` : extractedText),
  });

  const handleSubmit = () => {
    if (validText && !isLoading && !isUploading) {
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
      <div className="border-b border-accent px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-3 bg-accent/10">
        <div className="flex items-center gap-2 min-w-0">
          <Plus className="w-4 h-4 text-accent" />
          <span className="font-display text-sm uppercase tracking-widest text-accent">
            Add New Intelligence
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          {uploadedFile && (
            <div className="flex items-center gap-2 px-2 py-1 bg-muted text-xs font-mono text-muted-foreground">
              <span className="truncate max-w-20 sm:max-w-32">{uploadedFile.name}</span>
              <Button variant="ghost" aria-label="Remove uploaded file" disabled={isUploading} onClick={clearFile} className="hover:text-foreground">
                <X className="w-3 h-3" />
              </Button>
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
          <div className="flex items-center gap-2 min-w-0">
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
          aria-label="Update text"
          aria-describedby={!validText && text.length > 0 ? "update-validation" : undefined}
          aria-invalid={!validText && text.length > 0}
          disabled={isLoading || isUploading}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add new developments, updates, or additional context to merge into the current narrative model... (or drag & drop a file)"
          className="min-h-[150px] bg-input border-border text-foreground placeholder:text-muted-foreground font-body text-sm resize-none focus:border-accent focus:ring-0"
          autoFocus
        />
        {!validText && text.length > 0 && <p id="update-validation" role="status" className="mt-2 text-xs text-accent">
          {text.trim().length < MIN_INPUT_CHARS ? "Enter at least 20 characters." : "Maximum input is 100,000 characters. Use a shorter section."}
        </p>}
      </div>

      {/* Actions */}
      <div className="border-t border-border px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            disabled={isUploading || isLoading}
            accept={[...SUPPORTED_TYPES, ...SUPPORTED_MIME_TYPES].join(",")}
            onChange={handleFileSelect}
            className="hidden"
            id="incremental-file-upload"
          />
          <Button variant="tactical" onClick={() => fileInputRef.current?.click()} disabled={isUploading || isLoading} aria-label="Upload file"
            className={`btn-tactical flex items-center gap-2 cursor-pointer ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isUploading ? `Uploading ${uploadProgress}%` : "Upload"}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="btn-tactical text-xs sm:text-sm"
          >
            Cancel
          </Button>
          <Button variant="ghost"
            onClick={handleSubmit}
            disabled={!validText || isLoading || isUploading}
            className="btn-hot flex items-center gap-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {isLoading ? "Merging..." : "Merge Updates"}
          </Button>
        </div>
      </div>
    </div>
  );
}