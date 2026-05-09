'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Chat } from '../types';

export function useChats() {
  return useQuery<Chat[]>({
    queryKey: ['chats'],
    queryFn: async () => {
      const { data } = await api.get('/chats');
      return data;
    },
    staleTime: 10_000,
  });
}

export function useChat(chatId: string | null) {
  return useQuery<Chat>({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      const { data } = await api.get(`/chats/${chatId}`);
      return data;
    },
    enabled: !!chatId,
  });
}

export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title?: string) => {
      const { data } = await api.post('/chats', { title });
      return data as Chat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}

export function useDeleteChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatId: string) => {
      await api.delete(`/chats/${chatId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}
