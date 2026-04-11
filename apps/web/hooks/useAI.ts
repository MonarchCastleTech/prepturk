import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { apiGet, apiPost } from '../lib/api';
import { useAIChatStore, type AICitation } from '../lib/stores';
import { generateId } from '../lib/utils';

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  conversation_id?: string | null;
  mode: string;
  official_only: boolean;
  child_safe: boolean;
  vault_mode: boolean;
  document_ids?: string[] | null;
}

interface ChatResponse {
  conversation_id: string;
  message_id: string;
  content: string;
  citations: AICitation[];
  model: string;
  confidence: string;
}

interface Conversation {
  id: string;
  title: string;
  mode: string;
  official_only: boolean;
  child_safe: boolean;
  vault_mode: boolean;
  created_at: string;
  updated_at: string;
}

interface ConversationsResponse {
  conversations: Conversation[];
}

export function useAIChat() {
  const {
    conversationId,
    messages,
    mode,
    officialOnly,
    childSafe,
    explain15,
    stepByStep,
    setConversationId,
    addMessage,
    clear,
  } = useAIChatStore();

  const [isSending, setIsSending] = useState(false);

  const actualMode = explain15
    ? 'explain_15'
    : stepByStep
      ? 'step_by_step'
      : officialOnly
        ? 'official_only'
        : mode;

  const send = useCallback(
    async (content: string) => {
      const userMsg = {
        id: generateId(),
        role: 'user' as const,
        content,
        timestamp: new Date().toISOString(),
      };
      addMessage(userMsg);
      setIsSending(true);

      try {
        const chatMessages: ChatMessage[] = messages
          .slice(-10)
          .map((m) => ({ role: m.role, content: m.content }));
        chatMessages.push({ role: 'user', content });

        const req: ChatRequest = {
          messages: chatMessages,
          conversation_id: conversationId,
          mode: actualMode,
          official_only: officialOnly,
          child_safe: childSafe,
          vault_mode: false,
        };

        const res = await apiPost<ChatResponse>('/ai/chat', req);

        setConversationId(res.conversation_id);
        addMessage({
          id: res.message_id,
          role: 'assistant',
          content: res.content,
          citations: res.citations,
          confidence: res.confidence,
          timestamp: new Date().toISOString(),
        });
      } finally {
        setIsSending(false);
      }
    },
    [messages, conversationId, actualMode, officialOnly, childSafe, addMessage, setConversationId]
  );

  return { messages, send, isSending, clear, conversationId };
}

export function useConversations() {
  const { data, isLoading, mutate } = useSWR<ConversationsResponse>(
    '/ai/conversations',
    (p: string) => apiGet<ConversationsResponse>(p),
    { revalidateOnFocus: false }
  );

  return { conversations: data?.conversations ?? [], isLoading, mutate };
}
