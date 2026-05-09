'use client';

import { useAuthContext } from '../../providers/auth-provider';
import { cn } from '../../lib/utils';
import type { Message } from '../../types';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const { user } = useAuthContext();
  const isAssistant = message.role === 'ASSISTANT';
  const isPending = message.status === 'PENDING';
  const isFailed = message.status === 'FAILED';

  return (
    <div
      className={cn(
        'flex gap-4 px-4 py-4 md:px-8 transition-all duration-300 rounded-2xl',
        isAssistant ? 'bg-transparent' : 'bg-transparent',
      )}
      id={`message-${message.id}`}
    >
      <div className="shrink-0 mt-0.5">
        {isAssistant ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800/60 shadow-sm overflow-hidden p-1.5 transition-colors">
            <img src="/TT%20Logo%20-%20colored%201.png" alt="AI" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-300 ring-1 ring-zinc-300 dark:ring-zinc-700 transition-colors">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-1.5 min-w-0 pt-1">
        <p className="text-xs font-semibold text-zinc-400">
          {isAssistant ? 'TuringTech' : 'You'}
        </p>
        <div
          className={cn(
            'text-[15px] leading-relaxed transition-colors',
            isPending ? 'text-zinc-500' : isFailed ? 'text-[#EF5350]' : 'text-zinc-800 dark:text-zinc-200',
          )}
        >
          {isPending ? (
            <TypingIndicator />
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
        </div>
        {isFailed && (
          <p className="text-xs text-[#EF5350] mt-1">
            Failed to generate response
          </p>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <div className="flex gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-[#EF5350] animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-[#EF5350] animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-[#EF5350] animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
