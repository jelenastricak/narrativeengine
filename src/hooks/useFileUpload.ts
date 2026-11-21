import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { fileValidationError, SUPPORTED_TYPES, SUPPORTED_MIME_TYPES } from "../../supabase/functions/_shared/filePolicy";
import { MAX_INPUT_CHARS } from "@/lib/normalizeModel";

interface UseFileUploadOptions {
  onTextExtracted: (text: string, filename: string, charCount: number) => void;
}

export function useFileUpload({ onTextExtracted }: UseFileUploadOptions) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeRequest = useRef<XMLHttpRequest | null>(null);
  const mounted = useRef(true);
  const onExtracted = useRef(onTextExtracted);
  onExtracted.current = onTextExtracted;
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; activeRequest.current?.abort(); };
  }, []);

  const processFile = useCallback(async (file: File) => {
    if (activeRequest.current) return;
    const validationError = fileValidationError(file);
    if (validationError) {
      toast.error("Cannot upload file", { description: validationError });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    setUploadedFile(file);
    try {
      const data: unknown = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        activeRequest.current = xhr;
        xhr.upload.onprogress = event => {
          if (mounted.current && event.lengthComputable) setUploadProgress(Math.round(event.loaded / event.total * 100));
        };
        xhr.onload = () => {
          try {
            const response: unknown = JSON.parse(xhr.responseText);
            if (xhr.status < 200 || xhr.status >= 300) {
              const message = response && typeof response === "object" && "error" in response && typeof response.error === "string" ? response.error : "Failed to read this file.";
              reject(new Error(message));
            } else resolve(response);
          } catch { reject(new Error("The server returned an unreadable response. Please try again.")); }
        };
        xhr.onerror = () => reject(new Error("Upload could not connect. Check your connection and try again."));
        xhr.ontimeout = () => reject(new Error("File processing took too long. Please try a smaller document."));
        xhr.onabort = () => reject(new Error("Upload cancelled"));
        xhr.open("POST", `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-file`);
        xhr.timeout = 90_000;
        xhr.setRequestHeader("apikey", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
        const formData = new FormData();
        formData.append("file", file);
        xhr.send(formData);
      });
      if (!mounted.current) return;
      if (!data || typeof data !== "object" || !("text" in data) || typeof data.text !== "string" || !data.text.trim())
        throw new Error("No usable text was returned from this document.");
      if (data.text.length > MAX_INPUT_CHARS) throw new Error(`This document exceeds the ${MAX_INPUT_CHARS.toLocaleString()}-character analysis limit. Upload a shorter section.`);
      onExtracted.current(data.text, file.name, data.text.length);
      toast.success("File processed", { description: `Extracted ${data.text.length.toLocaleString()} characters from ${file.name}` });
    } catch (error) {
      if (!mounted.current) return;
      toast.error("Upload failed", { description: error instanceof Error ? error.message : "Failed to process file" });
      setUploadedFile(null);
    } finally {
      activeRequest.current = null;
      if (mounted.current) { setIsUploading(false); setUploadProgress(0); }
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
  }, [processFile]);
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  }, [processFile]);
  const clearFile = useCallback(() => {
    if (activeRequest.current) return;
    setUploadedFile(null); setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);
  return { uploadedFile, isUploading, uploadProgress, isDragOver, fileInputRef,
    handleFileSelect, handleDragOver, handleDragLeave, handleDrop, clearFile, SUPPORTED_TYPES, SUPPORTED_MIME_TYPES };
}
