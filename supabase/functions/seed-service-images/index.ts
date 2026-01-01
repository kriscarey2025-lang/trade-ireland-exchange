import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Service image mappings
const serviceImageMappings = [
  {
    serviceId: "ce3eef35-40de-4a95-863b-31cb78073edf",
    imageName: "holistic-massage.jpg",
    title: "Lymphatic drainage massage"
  },
  {
    serviceId: "9fe2997f-756b-44cf-af30-379756c36c81", 
    imageName: "gardening.jpg",
    title: "Gardening Duties"
  },
  {
    serviceId: "43708d6c-d615-4377-91e7-ee26a962426a",
    imageName: "german-language.jpg", 
    title: "German Language Help"
  }
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { imageData } = await req.json();
    
    if (!imageData || !Array.isArray(imageData)) {
      return new Response(
        JSON.stringify({ error: "imageData array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const item of imageData) {
      const { serviceId, base64Image, fileName } = item;
      
      // Convert base64 to Uint8Array
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Upload to storage
      const filePath = `generated/${fileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("service-images")
        .upload(filePath, bytes, {
          contentType: "image/jpeg",
          upsert: true
        });

      if (uploadError) {
        console.error(`Upload error for ${fileName}:`, uploadError);
        results.push({ serviceId, success: false, error: uploadError.message });
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("service-images")
        .getPublicUrl(filePath);

      // Update service with new image
      const { error: updateError } = await supabase
        .from("services")
        .update({ images: [urlData.publicUrl] })
        .eq("id", serviceId);

      if (updateError) {
        console.error(`Update error for service ${serviceId}:`, updateError);
        results.push({ serviceId, success: false, error: updateError.message });
        continue;
      }

      results.push({ 
        serviceId, 
        success: true, 
        imageUrl: urlData.publicUrl 
      });
      
      console.log(`Successfully updated service ${serviceId} with image ${urlData.publicUrl}`);
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in seed-service-images:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
