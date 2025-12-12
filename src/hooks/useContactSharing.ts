import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ContactShare {
  id: string;
  owner_id: string;
  shared_with_id: string;
  conversation_id: string;
  created_at: string;
}

interface ProfileWithContactStatus {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  contact_shared: boolean;
}

export function useContactShares(conversationId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["contact-shares", conversationId],
    queryFn: async () => {
      if (!conversationId || !user) return { given: false, received: false };

      // Get conversation to find other participant
      const { data: conversation } = await supabase
        .from("conversations")
        .select("participant_1, participant_2")
        .eq("id", conversationId)
        .single();

      if (!conversation) return { given: false, received: false };

      const otherUserId = conversation.participant_1 === user.id 
        ? conversation.participant_2 
        : conversation.participant_1;

      // Check if I shared my contact with them
      const { data: givenShare } = await supabase
        .from("contact_shares")
        .select("id")
        .eq("owner_id", user.id)
        .eq("shared_with_id", otherUserId)
        .eq("conversation_id", conversationId)
        .maybeSingle();

      // Check if they shared their contact with me
      const { data: receivedShare } = await supabase
        .from("contact_shares")
        .select("id")
        .eq("owner_id", otherUserId)
        .eq("shared_with_id", user.id)
        .eq("conversation_id", conversationId)
        .maybeSingle();

      return {
        given: !!givenShare,
        received: !!receivedShare,
        givenShareId: givenShare?.id,
        otherUserId,
      };
    },
    enabled: !!conversationId && !!user,
  });
}

export function useShareContact() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      sharedWithId,
    }: {
      conversationId: string;
      sharedWithId: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("contact_shares").insert({
        owner_id: user.id,
        shared_with_id: sharedWithId,
        conversation_id: conversationId,
      });

      if (error) throw error;
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ["contact-shares", conversationId] });
      toast.success("Contact information shared successfully");
    },
    onError: (error) => {
      console.error("Error sharing contact:", error);
      toast.error("Failed to share contact information");
    },
  });
}

export function useRevokeContactShare() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      sharedWithId,
    }: {
      conversationId: string;
      sharedWithId: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("contact_shares")
        .delete()
        .eq("owner_id", user.id)
        .eq("shared_with_id", sharedWithId)
        .eq("conversation_id", conversationId);

      if (error) throw error;
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ["contact-shares", conversationId] });
      toast.success("Contact sharing revoked");
    },
    onError: (error) => {
      console.error("Error revoking contact share:", error);
      toast.error("Failed to revoke contact sharing");
    },
  });
}

export function useProfileForConversation(profileId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile-conversation", profileId],
    queryFn: async () => {
      if (!profileId) return null;

      const { data, error } = await supabase.rpc("get_profile_for_conversation", {
        _profile_id: profileId,
      });

      if (error) throw error;
      return data?.[0] as ProfileWithContactStatus | null;
    },
    enabled: !!profileId && !!user,
  });
}
