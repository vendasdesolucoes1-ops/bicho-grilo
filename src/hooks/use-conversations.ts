/**
 * useConversations — TanStack Query hooks for IA conversation history
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";

export interface Conversation {
  id: string;
  user_id: string;
  title: string | null;
  context_snapshot: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const CONV_KEY = "neo-conversations";
const MSG_KEY = "neo-messages";

// ─── List conversations ────────────────────────────────────────────────────

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [CONV_KEY, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("neo_conversations")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(50);

      if (error) throw new Error(error.message);
      return (data ?? []) as Conversation[];
    },
    staleTime: 30_000,
  });
}

// ─── List messages for a conversation ─────────────────────────────────────

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: [MSG_KEY, conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("neo_conversation_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw new Error(error.message);
      return (data ?? []) as ConversationMessage[];
    },
    staleTime: 10_000,
  });
}

// ─── Create conversation ───────────────────────────────────────────────────

export function useCreateConversation() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { title?: string; context?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("neo_conversations")
        .insert({
          user_id: user.id,
          title: input.title ?? null,
          context_snapshot: input.context ?? null,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Conversation;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CONV_KEY] });
    },
  });
}

// ─── Append message ────────────────────────────────────────────────────────

export function useAppendMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      conversationId: string;
      role: "user" | "assistant";
      content: string;
    }) => {
      const { error } = await supabase
        .from("neo_conversation_messages")
        .insert({
          conversation_id: input.conversationId,
          role: input.role,
          content: input.content,
        });

      if (error) throw new Error(error.message);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [MSG_KEY, vars.conversationId] });
    },
  });
}

// ─── Delete conversation ───────────────────────────────────────────────────

export function useDeleteConversation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("neo_conversations")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CONV_KEY] });
    },
  });
}
