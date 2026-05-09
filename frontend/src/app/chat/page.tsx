'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCreateChat } from '../../hooks/useChats';
import { ChatInput } from '../../components/chat/chat-input';

export default function ChatIndexPage() {
  const router = useRouter();
  const createChat = useCreateChat();

  const handleSendInitialMessage = async (content: string) => {
    try {
      const chat = await createChat.mutateAsync(undefined);
      sessionStorage.setItem(`initial_message_${chat.id}`, content);
      router.push(`/chat/${chat.id}`);
    } catch (error) {
      toast.error('Failed to create chat. Please check your connection or log in again.');
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-[#0a0a0a] transition-colors duration-200">
      {/* Empty space to push logo to center */}
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-fade-in opacity-80 dark:invert-0 grayscale dark:grayscale-0">
          <img src="/TT%20Logo%20-%20colored%201.png" alt="TuringTech Logo" className="h-24 w-auto object-contain" />
        </div>
      </div>

      {/* Input at bottom */}
      <div className="w-full">
        <ChatInput 
          onSend={handleSendInitialMessage}
          disabled={createChat.isPending}
          isWaitingForReply={false}
        />
      </div>
    </div>
  );
}
