import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { fileValidationError, MAX_FILE_BYTES } from "../_shared/filePolicy.ts";
import { MAX_INPUT_CHARS } from "../_shared/normalizeModel.ts";
import { validateDocxArchive } from "../_shared/validateDocx.ts";
import JSZip from "https://esm.sh/jszip@3.10.1";

const decodeXml = (s: string) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");

// Parse DOCX file (ZIP with XML inside)
async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  validateDocxArchive(arrayBuffer);
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  // DOCX stores main content in word/document.xml
  const documentXml = zip.file("word/document.xml");
  if (!documentXml) {
    throw new Error("Invalid DOCX file: missing document.xml");
  }
  
  const xmlContent = await documentXml.async("text");
  
  const allText: string[] = [];
  const paragraphs = xmlContent.split(/<\/w:p>/);
  
  for (const para of paragraphs) {
    const texts = para.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    if (texts.length > 0) {
      const paraText = texts
        .map(t => decodeXml(t.replace(/<w:t[^>]*>([^<]*)<\/w:t>/, "$1")))
        .join("");
      if (paraText.trim()) {
        allText.push(paraText.trim());
      }
    }
  }
  
  return allText.join("\n\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validationError = fileValidationError(file);
    if (validationError) return new Response(JSON.stringify({ error: validationError }), {
      status: file.size > MAX_FILE_BYTES ? 413 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    const fileName = file.name.toLowerCase();
    const fileType = file.type;
    let extractedText = "";

    // Handle different file types
    if (fileName.endsWith(".txt") || fileName.endsWith(".md")) {
      extractedText = await file.text();

    } else if (fileName.endsWith(".json")) {
      const jsonContent = await file.text();
      try {
        const parsed = JSON.parse(jsonContent);
        extractedText = JSON.stringify(parsed, null, 2);
      } catch {
        extractedText = jsonContent;
      }

    } else if (fileName.endsWith(".csv")) {
      extractedText = await file.text();

    } else if (fileName.endsWith(".html") || fileName.endsWith(".htm")) {
      const htmlContent = (await file.text()).replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ");
      extractedText = decodeXml(htmlContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());

    } else if (fileName.endsWith(".xml")) {
      extractedText = await file.text();

    } else if (
      fileName.endsWith(".docx")
    ) {
      // Parse DOCX natively using JSZip
      try {
        extractedText = await parseDocx(file);

      } catch (docxError) {
        console.error("DOCX parsing error:", docxError);
        return new Response(JSON.stringify({ error: "Failed to parse DOCX file" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (fileName.endsWith(".pdf")) {
      // Extract PDF text natively (Gemini does not accept PDFs via image_url)
      try {
        const arrayBuffer = await file.arrayBuffer();
        const { extractText, getDocumentProxy } = await import("https://esm.sh/unpdf@0.12.1");
        const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
        const { text } = await extractText(pdf, { mergePages: true });
        extractedText = (Array.isArray(text) ? text.join("\n\n") : text) ?? "";

      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError);
        return new Response(
          JSON.stringify({ error: "Could not read this PDF. It may be scanned or password protected." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

    } else if (fileName.endsWith(".doc")) {
      // Old .doc format is not supported
      return new Response(
        JSON.stringify({
          error: "Old .doc format not supported. Please convert to .docx",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
        return new Response(
        JSON.stringify({
          error: `Unsupported file type: ${fileType || fileName}. Supported: TXT, MD, JSON, CSV, HTML, XML, PDF, DOCX`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (extractedText.length > MAX_INPUT_CHARS) return new Response(
      JSON.stringify({ error: "This document exceeds the 100,000-character analysis limit. Upload a shorter section." }),
      { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    if (!extractedText.trim()) {
      return new Response(JSON.stringify({ error: "No text could be extracted. Scanned or image-only PDFs are not supported; use a text-based document." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    return new Response(
      JSON.stringify({
        text: extractedText,
        fileName: file.name,
        fileType: fileType || "unknown",
        characterCount: extractedText.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error parsing file:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process the file. Please try another file." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
