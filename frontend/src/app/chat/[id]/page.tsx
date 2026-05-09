'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useChat } from '../../../hooks/useChats';
import { useMessages, useSendMessage } from '../../../hooks/useMessages';
import { MessageList } from '../../../components/chat/message-list';
import { ChatInput } from '../../../components/chat/chat-input';

export default function ChatDetailPage() {
  const params = useParams();
  const chatId = params.id as string;

  const { data: chat, error: chatError } = useChat(chatId);
  const { data: messages, isLoading: messagesLoading, error: messagesError } = useMessages(chatId);
  const sendMessage = useSendMessage(chatId);
  
  const hasSentInitialRef = useRef(false);

  const isWaitingForReply = (() => {
    if (!messages || messages.length === 0) return false;
    const lastMessage = messages[messages.length - 1];
    return lastMessage.role === 'USER' || lastMessage.status === 'PENDING';
  })();

  const handleSend = (content: string) => {
    if (sendMessage.isPending || isWaitingForReply) return;

    sendMessage.mutate(content, {
      onError: () => {
        toast.error('Failed to send message. Please try again.');
      },
    });
  };

  // Check for initial message from the new chat screen
  useEffect(() => {
    if (hasSentInitialRef.current || messagesLoading || (messages && messages.length > 0)) return;
    
    const key = `initial_message_${chatId}`;
    const initialContent = sessionStorage.getItem(key);
    
    if (initialContent) {
      hasSentInitialRef.current = true;
      sessionStorage.removeItem(key);
      handleSend(initialContent);
    }
  }, [chatId, messages, messagesLoading]);

  if (chatError) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="text-center px-4">
          <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
            Chat not found
          </h2>
          <p className="text-sm text-zinc-500">
            This chat may have been deleted or you don&apos;t have access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#0a0a0a] transition-colors duration-200">
      {/* Messages */}
      <MessageList
        messages={messages}
        isLoading={messagesLoading}
        error={messagesError}
        chatTitle={chat?.title}
      />

      {/* Input */}
      <div className="w-full">
        <ChatInput
          onSend={handleSend}
          disabled={sendMessage.isPending}
          isWaitingForReply={isWaitingForReply}
        />
      </div>
    </div>
  );
}
