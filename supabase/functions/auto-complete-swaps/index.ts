import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find accepted swaps where:
    // 1. They have an agreed_completion_date set
    // 2. The agreed date + 2 weeks has passed
    // 3. The swap is still in 'accepted' status (not completed)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const cutoffDate = twoWeeksAgo.toISOString().split('T')[0];

    console.log(`Looking for swaps with agreed_completion_date before ${cutoffDate}`);

    const { data: overdueSwaps, error: fetchError } = await supabase
      .from("conversations")
      .select("id, service_id, participant_1, participant_2, agreed_completion_date")
      .eq("swap_status", "accepted")
      .not("agreed_completion_date", "is", null)
      .lte("agreed_completion_date", cutoffDate);

    if (fetchError) {
      console.error("Error fetching overdue swaps:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${overdueSwaps?.length || 0} overdue swaps to auto-complete`);

    const results = [];

    for (const swap of overdueSwaps || []) {
      console.log(`Auto-completing swap ${swap.id} (agreed date: ${swap.agreed_completion_date})`);

      // Update conversation to completed
      const { error: updateError } = await supabase
        .from("conversations")
        .update({
          swap_status: "completed",
          completed_by_1: true,
          completed_by_2: true,
        })
        .eq("id", swap.id);

      if (updateError) {
        console.error(`Error updating swap ${swap.id}:`, updateError);
        results.push({ id: swap.id, success: false, error: updateError.message });
        continue;
      }

      // Increment completed_swaps_count on the service if it exists
      if (swap.service_id) {
        const { error: serviceError } = await supabase.rpc("increment_completed_swaps", {
          _service_id: swap.service_id,
        });

        if (serviceError) {
          console.warn(`Could not increment swap count for service ${swap.service_id}:`, serviceError);
        }
      }

      results.push({ id: swap.id, success: true });
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(`Auto-completed ${successCount}/${results.length} swaps`);

    return new Response(
      JSON.stringify({
        message: `Auto-completed ${successCount} swaps`,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in auto-complete-swaps:", error);
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
