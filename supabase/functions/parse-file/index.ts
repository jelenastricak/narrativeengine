import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    console.log("Auth header present:", !!authHeader);
    
    if (!authHeader) {
      console.log("No auth header provided");
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    console.log("Supabase URL configured:", !!supabaseUrl);
    console.log("Service role key configured:", !!serviceRoleKey);

    const supabase = createClient(
      supabaseUrl ?? "",
      serviceRoleKey ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log("Auth result - user:", !!user, "error:", authError?.message);
    
    if (authError || !user) {
      console.log("Auth failed:", authError?.message || "No user");
      return new Response(JSON.stringify({ error: "Unauthorized", details: authError?.message }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log("User authenticated:", user.id);

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
      // Plain text files
      extractedText = await file.text();
      console.log("Extracted text from plain text file");
    } else if (fileType === "application/json" || fileName.endsWith(".json")) {
      // JSON files
      const jsonContent = await file.text();
      try {
        const parsed = JSON.parse(jsonContent);
        extractedText = JSON.stringify(parsed, null, 2);
      } catch {
        extractedText = jsonContent;
      }
      console.log("Extracted text from JSON file");
    } else if (fileType === "text/csv" || fileName.endsWith(".csv")) {
      // CSV files
      extractedText = await file.text();
      console.log("Extracted text from CSV file");
    } else if (fileType === "text/html" || fileName.endsWith(".html") || fileName.endsWith(".htm")) {
      // HTML files - strip tags
      const htmlContent = await file.text();
      extractedText = htmlContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      console.log("Extracted text from HTML file");
    } else if (fileType === "application/xml" || fileType === "text/xml" || fileName.endsWith(".xml")) {
      // XML files
      extractedText = await file.text();
      console.log("Extracted text from XML file");
    } else if (
      fileType === "application/pdf" ||
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileType === "application/msword" ||
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".docx") ||
      fileName.endsWith(".doc")
    ) {
      // For PDF and DOCX, we'll use Lovable AI to extract text
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return new Response(JSON.stringify({ error: "AI service not configured" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const dataUrl = `data:${fileType};base64,${base64}`;

      // Use AI to extract text from the document
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
        return new Response(JSON.stringify({ error: "Failed to extract text from document" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const aiData = await aiResponse.json();
      extractedText = aiData.choices?.[0]?.message?.content || "";
      console.log("Extracted text from document using AI");
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
