import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Conversation {
  id: string;
  service_id: string | null;
  participant_1: string;
  participant_2: string;
  created_at: string;
  updated_at: string;
  service?: {
    id: string;
    title: string;
  } | null;
  other_profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
  unread_count?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          service:service_id (id, title)
        `)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Fetch other participant profiles and last messages
      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (conv) => {
          const otherUserId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
          
          const [profileResult, lastMessageResult, unreadResult] = await Promise.all([
            supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .eq("id", otherUserId)
              .single(),
            supabase
              .from("messages")
              .select("content, created_at, sender_id")
              .eq("conversation_id", conv.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .single(),
            supabase
              .from("messages")
              .select("id", { count: "exact" })
              .eq("conversation_id", conv.id)
              .eq("read", false)
              .neq("sender_id", user.id),
          ]);

          return {
            ...conv,
            other_profile: profileResult.data,
            last_message: lastMessageResult.data,
            unread_count: unreadResult.count || 0,
          } as Conversation;
        })
      );

      return conversationsWithDetails;
    },
    enabled: !!user,
  });
}

export function useMessages(conversationId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Real-time subscription
  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
          queryClient.invalidateQueries({ queryKey: ["conversations", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user, queryClient]);

  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId && !!user,
  });
}

export function useSendMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation's updated_at
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });
}

export function useStartConversation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, providerId, initialMessage }: { 
      serviceId: string; 
      providerId: string; 
      initialMessage: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("service_id", serviceId)
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${providerId}),and(participant_1.eq.${providerId},participant_2.eq.${user.id})`)
        .single();

      let conversationId: string;

      if (existing) {
        conversationId = existing.id;
      } else {
        const { data: newConv, error: convError } = await supabase
          .from("conversations")
          .insert({
            service_id: serviceId,
            participant_1: user.id,
            participant_2: providerId,
          })
          .select()
          .single();

        if (convError) throw convError;
        conversationId = newConv.id;
      }

      // Send initial message
      const { error: msgError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: initialMessage,
        });

      if (msgError) throw msgError;

      return conversationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
      toast.success("Message sent!");
    },
    onError: () => {
      toast.error("Failed to start conversation");
    },
  });
}

export function useMarkAsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) return;

      await supabase
        .from("messages")
        .update({ read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
    },
  });
}
