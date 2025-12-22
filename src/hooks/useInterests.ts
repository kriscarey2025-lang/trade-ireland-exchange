import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { trackInterestExpressedHubSpot } from "./useHubSpot";

export interface Interest {
  id: string;
  user_id: string;
  service_id: string;
  created_at: string;
}

export function useInterests(serviceId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["interests", serviceId, user?.id],
    queryFn: async () => {
      if (!user || !serviceId) return null;
      
      const { data, error } = await supabase
        .from("interests")
        .select("*")
        .eq("service_id", serviceId)
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Interest | null;
    },
    enabled: !!user && !!serviceId,
  });
}

export function useServiceInterestCount(serviceId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["interest-count", serviceId],
    queryFn: async () => {
      if (!serviceId) return 0;
      
      const { count, error } = await supabase
        .from("interests")
        .select("*", { count: "exact", head: true })
        .eq("service_id", serviceId);
      
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user && !!serviceId,
  });
}

export function useExpressInterest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ serviceId, serviceTitle }: { serviceId: string; serviceTitle?: string }) => {
      if (!user) throw new Error("Must be logged in");
      
      const { data, error } = await supabase
        .from("interests")
        .insert({ user_id: user.id, service_id: serviceId })
        .select()
        .single();
      
      if (error) throw error;
      return { data, serviceTitle };
    },
    onSuccess: ({ data, serviceTitle }, { serviceId }) => {
      queryClient.invalidateQueries({ queryKey: ["interests", serviceId] });
      queryClient.invalidateQueries({ queryKey: ["interest-count", serviceId] });
      toast.success("Interest expressed! The owner will be notified.");
      
      // Track in HubSpot
      if (user?.email && serviceTitle) {
        trackInterestExpressedHubSpot(user.email, serviceTitle);
      }
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast.info("You've already expressed interest in this service");
      } else {
        toast.error("Failed to express interest");
      }
    },
  });
}

export function useRemoveInterest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (serviceId: string) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase
        .from("interests")
        .delete()
        .eq("user_id", user.id)
        .eq("service_id", serviceId);
      
      if (error) throw error;
    },
    onSuccess: (_, serviceId) => {
      queryClient.invalidateQueries({ queryKey: ["interests", serviceId] });
      queryClient.invalidateQueries({ queryKey: ["interest-count", serviceId] });
      toast.success("Interest removed");
    },
    onError: () => {
      toast.error("Failed to remove interest");
    },
  });
}
