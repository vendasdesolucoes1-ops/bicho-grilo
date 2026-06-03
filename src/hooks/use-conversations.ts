/**
 * useConversations — TanStack Query hooks for IA conversation history
 * All scoped to the current tenant via RLS automatically.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import type { Conversation, ConversationMessage } from "@/types/database";

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
        .schema("neo")
        .from("conversations")
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
        .schema("neo")
        .from("conversation_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw new Error(error.message);
      return (data ?? []) as ConversationMessage[];
    },
    staleTime: 60_000,
  });
}

// ─── Create conversation ───────────────────────────────────────────────────

interface CreateConversationInput {
  title?: string;
  analysis_id?: string;
  context_snapshot?: string;
}

export function useCreateConversation() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateConversationInput) => {
      if (!user || !profile) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .schema("neo")
        .from("conversations")
        .insert({
          tenant_id: profile.tenant_id,
          user_id: user.id,
          title: input.title ?? null,
          analysis_id: input.analysis_id ?? null,
          context_snapshot: input.context_snapshot ?? null,
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

interface AppendMessageInput {
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
}

export function useAppendMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: AppendMessageInput) => {
      const { data, error } = await supabase
        .schema("neo")
        .from("conversation_messages")
        .insert({
          conversation_id: input.conversation_id,
          role: input.role,
          content: input.content,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as ConversationMessage;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [MSG_KEY, variables.conversation_id] });
      qc.invalidateQueries({ queryKey: [CONV_KEY] });
    },
  });
}

// ─── Delete conversation ───────────────────────────────────────────────────

export function useDeleteConversation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .schema("neo")
        .from("conversations")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CONV_KEY] });
    },
  });
}
