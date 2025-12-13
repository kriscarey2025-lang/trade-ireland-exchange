import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export function useCredits() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["credits", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.credits ?? 0;
    },
    enabled: !!user,
  });
}

export function useCreditTransactions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["credit-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useSpendCredits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      amount, 
      description, 
      conversationId 
    }: { 
      amount: number; 
      description: string; 
      conversationId?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Get current credits
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      if ((profile?.credits ?? 0) < amount) {
        throw new Error("Insufficient credits");
      }

      // Deduct credits
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ credits: (profile?.credits ?? 0) - amount })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from("credit_transactions")
        .insert({
          user_id: user.id,
          amount: -amount,
          type: "spent",
          description,
          related_conversation_id: conversationId,
        });

      if (transactionError) throw transactionError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      queryClient.invalidateQueries({ queryKey: ["credit-transactions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useEarnCredits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      amount, 
      description, 
      conversationId 
    }: { 
      amount: number; 
      description: string; 
      conversationId?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Get current credits
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Add credits
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ credits: (profile?.credits ?? 0) + amount })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from("credit_transactions")
        .insert({
          user_id: user.id,
          amount,
          type: "earned",
          description,
          related_conversation_id: conversationId,
        });

      if (transactionError) throw transactionError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      queryClient.invalidateQueries({ queryKey: ["credit-transactions"] });
    },
  });
}
