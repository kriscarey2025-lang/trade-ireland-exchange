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
      const { data, error } = await supabase.rpc('spend_credits', {
        _amount: amount,
        _description: description,
        _conversation_id: conversationId || null,
      });
      
      if (error) throw error;
      return data;
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
      const { data, error } = await supabase.rpc('earn_credits', {
        _amount: amount,
        _description: description,
        _conversation_id: conversationId || null,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      queryClient.invalidateQueries({ queryKey: ["credit-transactions"] });
    },
  });
}
