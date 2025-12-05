import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface UseFileUploadOptions {
  onTextExtracted: (text: string, filename: string, charCount: number) => void;
}

export function useFileUpload({ onTextExtracted }: UseFileUploadOptions) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = useCallback((file: File): boolean => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return false;
    }

    const isValidType = SUPPORTED_MIME_TYPES.includes(file.type) || 
      SUPPORTED_TYPES.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      toast({
        title: "Unsupported file type",
        description: "Supported: TXT, MD, JSON, CSV, HTML, XML, PDF, DOCX",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [toast]);

  const processFile = useCallback(async (file: File) => {
    console.log("Processing file:", file.name, file.type, file.size);
    if (!validateFile(file)) return;

    setIsUploading(true);
    setUploadedFile(file);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session retrieved:", !!session);
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

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-file`;
      console.log("Calling edge function:", url);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Failed to parse file");
      }

      const data = await response.json();
      console.log("Success, extracted chars:", data.characterCount);
      onTextExtracted(data.text, file.name, data.characterCount);
      
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
  }, [validateFile, onTextExtracted, toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const clearFile = useCallback(() => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return {
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
  };
}
