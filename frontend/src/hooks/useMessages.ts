'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Message, SendMessageResponse } from '../types';

/**
 * Fetches messages for a chat with conditional polling.
 * Polls every 2s when the last message is from the USER (waiting for assistant reply)
 * or when there's a PENDING message. Stops polling when the assistant has replied.
 */
export function useMessages(chatId: string | null) {
  return useQuery<Message[]>({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const { data } = await api.get(`/chats/${chatId}/messages`);
      return data;
    },
    enabled: !!chatId,
    refetchInterval: (query) => {
      const messages = query.state.data;
      if (!messages || messages.length === 0) return false;

      const lastMessage = messages[messages.length - 1];

      // Poll while waiting for assistant reply
      if (lastMessage.role === 'USER') return 2000;

      // Poll while assistant message is still generating
      if (lastMessage.status === 'PENDING') return 2000;

      // Stop polling — assistant has replied
      return false;
    },
  });
}

export function useSendMessage(chatId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<SendMessageResponse, Error, string>({
    mutationFn: async (content: string) => {
      const { data } = await api.post(`/chats/${chatId}/messages`, { content });
      return data;
    },
    onSuccess: () => {
      // Immediately refetch messages to show user message + pending state
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      // Also refresh chat list (title may have changed)
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}
