export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const SUPPORTED_TYPES = [".txt", ".md", ".json", ".csv", ".html", ".htm", ".xml", ".pdf", ".docx"];
export const SUPPORTED_MIME_TYPES = ["text/plain", "text/markdown", "application/json", "text/csv", "text/html", "application/xml", "text/xml", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export function fileValidationError(file: { name: string; size: number }): string | null {
  if (file.size === 0) return "This file is empty. Please choose a document containing text.";
  if (file.size > MAX_FILE_BYTES) return "Maximum file size is 10MB.";
  if (file.name.toLowerCase().endsWith(".doc")) return "Old .doc format is not supported. Please convert it to .docx.";
  if (!SUPPORTED_TYPES.some(ext => file.name.toLowerCase().endsWith(ext)))
    return "Supported: TXT, MD, JSON, CSV, HTML, XML, PDF, DOCX.";
  return null;
}