'use client';

import { useRef, useEffect } from 'react';
import { MessageItem } from './message-item';
import { Skeleton } from '../ui/skeleton';
import type { Message } from '../../types';

interface MessageListProps {
  messages: Message[] | undefined;
  isLoading: boolean;
  error: Error | null;
  chatTitle?: string;
}

export function MessageList({ messages, isLoading, error, chatTitle }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-8 p-6 max-w-3xl mx-auto w-full">
        <Skeleton className="h-8 w-3/4 bg-zinc-200 dark:bg-zinc-800/50 mb-8" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-8 w-8 rounded-full shrink-0 bg-zinc-200 dark:bg-zinc-800/50" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800/50" />
              <Skeleton className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800/50" />
              <Skeleton className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800/50" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-[#EF5350] text-sm">Failed to load messages</p>
          <p className="text-zinc-500 text-xs mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4 opacity-0 animate-fade-in">
          <div className="flex justify-center mb-6">
            <img src="/TT%20Logo%20-%20colored%201.png" alt="TuringTech Logo" className="h-16 w-auto object-contain dark:invert-0 grayscale dark:grayscale-0" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-8 pb-4 transition-colors duration-200">
      <div className="max-w-3xl mx-auto">
        {chatTitle && chatTitle !== 'New Chat' && (
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-8 mt-4 px-4 md:px-8">
            {chatTitle}
          </h1>
        )}
        
        <div className="space-y-6">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
        </div>
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
