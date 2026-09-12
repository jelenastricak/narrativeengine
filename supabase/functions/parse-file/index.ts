import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Parse DOCX file (ZIP with XML inside)
async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  // DOCX stores main content in word/document.xml
  const documentXml = zip.file("word/document.xml");
  if (!documentXml) {
    throw new Error("Invalid DOCX file: missing document.xml");
  }
  
  const xmlContent = await documentXml.async("text");
  
  // Extract text from XML, preserving paragraph breaks
  // Match text content within <w:t> tags
  const textMatches = xmlContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
  const paragraphBreaks = xmlContent.match(/<\/w:p>/g) || [];
  
  // Build text with paragraph awareness
  let result = "";
  let lastIndex = 0;
  
  // Simple extraction: get all text content
  const allText: string[] = [];
  let currentParagraph = "";
  
  // Split by paragraph tags and extract text
  const paragraphs = xmlContent.split(/<\/w:p>/);
  
  for (const para of paragraphs) {
    const texts = para.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    if (texts.length > 0) {
      const paraText = texts
        .map(t => t.replace(/<w:t[^>]*>([^<]*)<\/w:t>/, "$1"))
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

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);

    const fileName = file.name.toLowerCase();
    const fileType = file.type;
    let extractedText = "";

    // Handle different file types
    if (fileType === "text/plain" || fileName.endsWith(".txt") || fileName.endsWith(".md")) {
      extractedText = await file.text();
      console.log("Extracted text from plain text file");
    } else if (fileType === "application/json" || fileName.endsWith(".json")) {
      const jsonContent = await file.text();
      try {
        const parsed = JSON.parse(jsonContent);
        extractedText = JSON.stringify(parsed, null, 2);
      } catch {
        extractedText = jsonContent;
      }
      console.log("Extracted text from JSON file");
    } else if (fileType === "text/csv" || fileName.endsWith(".csv")) {
      extractedText = await file.text();
      console.log("Extracted text from CSV file");
    } else if (fileType === "text/html" || fileName.endsWith(".html") || fileName.endsWith(".htm")) {
      const htmlContent = await file.text();
      extractedText = htmlContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      console.log("Extracted text from HTML file");
    } else if (fileType === "application/xml" || fileType === "text/xml" || fileName.endsWith(".xml")) {
      extractedText = await file.text();
      console.log("Extracted text from XML file");
    } else if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      // Parse DOCX natively using JSZip
      try {
        extractedText = await parseDocx(file);
        console.log("Extracted text from DOCX file");
      } catch (docxError) {
        console.error("DOCX parsing error:", docxError);
        return new Response(JSON.stringify({ error: "Failed to parse DOCX file" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      // For PDF, use Lovable AI to extract text
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return new Response(JSON.stringify({ error: "AI service not configured" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binaryString = "";
      const chunkSize = 8192;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, i + chunkSize);
        binaryString += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const base64 = btoa(binaryString);
      const dataUrl = `data:${fileType};base64,${base64}`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract all text content from this document. Return ONLY the extracted text, no commentary or formatting instructions. Preserve paragraph structure with line breaks.",
                },
                {
                  type: "image_url",
                  image_url: { url: dataUrl },
                },
              ],
            },
          ],
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error("AI extraction failed:", errorText);
        return new Response(JSON.stringify({ error: "Failed to extract text from PDF" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const aiData = await aiResponse.json();
      extractedText = aiData.choices?.[0]?.message?.content || "";
      console.log("Extracted text from PDF using AI");
    } else if (fileType === "application/msword" || fileName.endsWith(".doc")) {
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
      // Unsupported file type - try to read as text
      try {
        extractedText = await file.text();
        console.log("Attempted to read unsupported file as text");
      } catch {
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
    }

    if (!extractedText.trim()) {
      return new Response(JSON.stringify({ error: "No text content could be extracted from the file" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Successfully extracted ${extractedText.length} characters`);

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
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to parse file" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
